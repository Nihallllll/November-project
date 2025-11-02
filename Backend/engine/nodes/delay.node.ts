import type { NodeHandler } from "./node-handler.interface";

export const delayNode: NodeHandler = {
  type: "delay",
  
  execute: async (nodeData, input, context) => {
    const { seconds = 1 } = nodeData;
    
    context.logger(`delay: waiting ${seconds} seconds...`);
    
    const startTime = Date.now();
    
    // Wait for specified time
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    
    const endTime = Date.now();
    const actualDelay = (endTime - startTime) / 1000;
    
    context.logger(`delay: complete (waited ${actualDelay.toFixed(2)}s)`);
    
    return {
      delayed: true,
      requestedSeconds: seconds,
      actualSeconds: actualDelay,
      input  // Pass input through
    };
  }
};
