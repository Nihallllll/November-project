import type { NodeHandler } from "./node-handler.interface";

export const conditionNode: NodeHandler = {
  type: "condition",
  
  execute: async (nodeData, input, context) => {
    const { expression } = nodeData;
    
    context.logger(`condition: evaluating "${expression}"`);
    
    try {
      // Simple evaluation - in production use a safe parser!
      // For now, we'll just check simple comparisons
      
      // Example: "input.amount > 100" or "input.status === 200"
      const passed = eval(expression);
      
      context.logger(`condition: result = ${passed}`);
      
      return {
        passed,
        expression,
        input  // Pass input through
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      context.logger(`condition: error ${msg}`);
      return { passed: false, error: msg };
    }
  }
};
