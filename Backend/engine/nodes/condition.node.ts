import type { NodeHandler } from "./node-handler.interface";
import { Parser } from "expr-eval";

/**
 * CONDITION NODE - SECURE VERSION
 * 
 * Evaluates expressions safely using expr-eval library (no arbitrary code execution).
 * If expression evaluates to true, execution continues.
 * If false, execution may stop (depending on flow configuration).
 * 
 * Configuration (nodeData):
 * - expression: string (required) - Safe expression to evaluate
 *   Examples:
 *   - "balance > 0"
 *   - "price < 100"
 *   - "status == 'success'"
 *   - "balance > 100 and price < 50"
 *   - "value >= 10 or status == 'approved'"
 * 
 * Supported Operators:
 * - Comparison: ==, !=, <, >, <=, >=
 * - Logical: and, or, not
 * - Arithmetic: +, -, *, /, %, ^
 * - Functions: abs(), ceil(), floor(), round(), sqrt(), max(), min()
 * 
 * Input:
 * - Any data from previous node (all fields available as variables)
 * 
 * Output:
 * {
 *   passed: boolean,
 *   expression: string,
 *   evaluatedValue: any,
 *   ...input  // Original input data is passed through
 * }
 * 
 * Security: Uses expr-eval parser - NO eval(), NO arbitrary code execution
 */

export const conditionNode: NodeHandler = {
  type: "condition",

  execute: async (nodeData, input, context) => {
    const { expression } = nodeData;

    if (!expression) {
      throw new Error("condition: expression is required");
    }

    context.logger(`condition: evaluating "${expression}"`);

    try {
      // Create safe expression parser
      const parser = new Parser();

      // Flatten input object to make all fields available as variables
      // Example: { data: { balance: 100 } } becomes { balance: 100, data: {...} }
      const variables = flattenObject(input);

      context.logger(`condition: available variables: ${Object.keys(variables).join(', ')}`);

      // Parse and evaluate expression safely
      const result = parser.evaluate(expression, variables);

      // Convert result to boolean
      const passed = Boolean(result);

      context.logger(`condition: result = ${passed} (value: ${result})`);

      // Return the result along with original input data
      return {
        passed,
        expression,
        evaluatedValue: result,
        ...input, // Spread input data so it's available for next nodes
      };

    } catch (error: any) {
      context.logger(`condition: error - ${error.message}`);
      
      // Provide helpful error messages
      let errorMsg = error.message;
      if (errorMsg.includes('undefined variable')) {
        const availableVars = input ? Object.keys(flattenObject(input)).join(', ') : 'none';
        errorMsg += `\n\nAvailable variables: ${availableVars}`;
        errorMsg += `\n\nTip: Use exact field names from input data`;
      }
      
      throw new Error(`Condition evaluation failed: ${errorMsg}`);
    }
  },
};

/**
 * Helper: Flatten nested object for expression evaluation
 * Example: { data: { balance: 100 } } => { balance: 100, data_balance: 100, data: {...} }
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const flattened: Record<string, any> = {};

  // Add the object itself (for nested access)
  if (prefix) {
    flattened[prefix.slice(0, -1)] = obj; // Remove trailing underscore
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix + key;

    // Add the field directly
    flattened[newKey] = value;

    // Recursively flatten nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenObject(value, `${newKey}_`);
      Object.assign(flattened, nested);
    }
  }

  return flattened;
}
