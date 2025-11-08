import type { NodeHandler } from "./node-handler.interface";

export const jupiterNode: NodeHandler = {
  type: "jupiter",
  execute: async (nodeData, input, context) => {
    const {
      action, // 'getQuote' or 'swap'
      inputMint, // Token to swap FROM (e.g., SOL address)
      outputMint, // Token to swap TO (e.g., USDC address)
      amount, // Amount in smallest unit (lamports)
      slippageBps, // Slippage tolerance (50 = 0.5%)
      userPublicKey, // User's wallet address
      userId, // User ID from context
      onlyDirectRoutes, // Optional: limit to direct routes
      maxAccounts, // Optional: limit accounts for faster quotes
    } = nodeData;
    // Validate required fields
    if (!action) throw new Error("action is required");
    if (!inputMint) throw new Error("inputMint is required");
    if (!outputMint) throw new Error("outputMint is required");
    if (!amount) throw new Error("amount is required");
    if (slippageBps === undefined) throw new Error("slippageBps is required");
    if (!userId) throw new Error("userId is required");

    try {
      let result;

      if (action === "getQuote") {
        // Just get quote, no transaction
        result = await getJupiterQuote(nodeData);
      }
      //   else if (action === 'swap') {
      //     // Validate userPublicKey for swaps
      //     if (!userPublicKey) {
      //       throw new Error('userPublicKey is required for swap action');
      //     }

      //     // Create pending transaction
      //     result = await createPendingSwapTransaction(
      //       nodeData,
      //       userId,
      //       context.runId
      //     );

      //   }
      else {
        throw new Error(`Unknown action: ${action}`);
      }

      context.logger(`jupiter: ${action} completed successfully`);

      return {
        success: true,
        action: action,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      context.logger(`jupiter: ❌ ERROR - ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

async function getJupiterQuote(config: any) {
  const params = new URLSearchParams({
    inputMint: config.inputMint,
    outputMint: config.outputMint,
    amount: config.amount.toString(),
    slippageBps: config.slippageBps.toString(),
  });

  if (config.restrictIntermediateTokens) {
    params.append("restrictIntermediateTokens", "true");
  }
  if (config.maxAccounts) {
    params.append("maxAccounts", config.maxAccounts.toString());
  }

  const response = await fetch(
    `https://lite-api.jup.ag/swap/v1/quote?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jupiter quote API error: ${error}`);
  }

  const quoteResponse: any = await response.json();

  return {
    inputMint: quoteResponse.inputMint,
    outputMint: quoteResponse.outputMint,
    inAmount: quoteResponse.inAmount,
    outAmount: quoteResponse.outAmount,
    priceImpactPct: quoteResponse.priceImpactPct,
    routePlan: quoteResponse.routePlan,
    _fullQuote: quoteResponse,
  };
}
