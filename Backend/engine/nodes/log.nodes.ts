import type { NodeHandler } from "./node-handler.interface";

export const logNode: NodeHandler = {
  type: "log",
  
  execute: async (nodeData, input, context) => {
    const { message = "Log" } = nodeData;
    
    context.logger(`log: ${message}`);
    
    // Pretty print the input data
    console.log("┌─────────────────────────────────");
    console.log(`│ 📝 ${message}`);
    console.log("├─────────────────────────────────");
    console.log("│ Input data:");
    console.log(JSON.stringify(input, null, 2).split('\n').map(line => `│   ${line}`).join('\n'));
    console.log("└─────────────────────────────────");
    
    return {
      logged: true,
      message,
      input,  // Pass input through
      timestamp: new Date()
    };
  }
};
