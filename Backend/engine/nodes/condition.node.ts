import type { NodeHandler } from "./node-handler.interface";

/**
 * CONDITION NODE
 * 
 * Evaluates a JavaScript expression and returns true/false.
 * If expression evaluates to true, execution continues.
 * If false, execution may stop (depending on flow configuration).
 * 
 * Configuration (nodeData):
 * - expression: string (required) - JavaScript expression to evaluate
 *   Examples:
 *   - "input.balance > 0"
 *   - "input.price < 100"
 *   - "input.status === 'success'"
 * 
 * Input:
 * - Any data from previous node (accessible as `input` in expression)
 * 
 * Output:
 * {
 *   passed: boolean,
 *   expression: string,
 *   ...input  // Original input data is passed through
 * }
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
      // Create a safe evaluation context
      // Input is available as 'input' variable in the expression
      const evalFunction = new Function('input', `
        try {
          return ${expression};
        } catch (error) {
          throw new Error('Expression evaluation failed: ' + error.message);
        }
      `);

      // Evaluate the expression with the input data
      const result = evalFunction(input);

      // Convert result to boolean
      const passed = Boolean(result);

      context.logger(`condition: result = ${passed}`);

      // Return the result along with original input data
      return {
        passed,
        expression,
        ...input, // Spread input data so it's available for next nodes
      };

    } catch (error: any) {
      context.logger(`condition: error - ${error.message}`);
      throw new Error(`Condition evaluation failed: ${error.message}`);
    }
  },
};
