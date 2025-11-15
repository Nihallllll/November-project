import type { NodeHandler } from "./node-handler.interface";

/**
 * MERGE NODE
 * ==========
 * Combines outputs from multiple parent nodes into a single structured input.
 * 
 * Use Case:
 * - Collecting data from multiple sources before AI analysis
 * - Example: wallet balance + price data + market sentiment → merge → AI decision
 * 
 * Input Format (already merged by executor):
 * {
 *   "node-1-id": { balance: 5.2 },
 *   "node-2-id": { price: 142.50 },
 *   "node-3-id": { sentiment: "bullish" }
 * }
 * 
 * Output Format:
 * {
 *   merged: true,
 *   sources: ["node-1-id", "node-2-id", "node-3-id"],
 *   data: { ...all parent outputs... },
 *   flattened: { balance: 5.2, price: 142.50, sentiment: "bullish" }
 * }
 */
export const mergeNode: NodeHandler = {
  type: "merge",

  execute: async (nodeData, input, context) => {
    context.logger("🔀 Merge Node: Combining inputs from multiple sources");

    // Input is already merged by executor as { parentNodeType: output, ... }
    if (!input || typeof input !== "object") {
      context.logger("⚠️ No valid inputs to merge");
      return {
        merged: true,
        sources: [],
        data: {},
        flattened: {},
      };
    }

    const sources = Object.keys(input);
    context.logger(`   Found ${sources.length} parent sources: ${sources.join(", ")}`);

    // Flatten the data for easier consumption by downstream nodes
    const flattened: Record<string, any> = {};
    
    for (const [nodeType, output] of Object.entries(input)) {
      if (output && typeof output === "object") {
        // Merge each parent's output into the flattened object
        Object.assign(flattened, output);
      }
    }

    const result = {
      merged: true,
      sources,
      data: input,       // Preserve original structure with node type keys
      flattened,         // Simplified flat structure (all fields merged)
      // Add individual sources for easy access
      ...input,          // Spread all parent outputs at root level
    };

    context.logger(`   ✅ Merged ${sources.length} sources successfully`);
    context.logger(`   📦 Available data: ${Object.keys(flattened).join(", ")}`);

    return result;
  },
};
