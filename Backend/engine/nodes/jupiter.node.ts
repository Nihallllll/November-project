import type { NodeHandler } from "./node-handler.interface";

/**
 * JUPITER QUOTE NODE - QUOTE ONLY (NO SWAPS)
 * 
 * Gets best swap quotes from Jupiter Aggregator
 * Does NOT execute actual swaps - only shows pricing and routes
 * 
 * Configuration:
 * - inputMint: Token address to swap FROM (e.g., SOL)
 * - outputMint: Token address to swap TO (e.g., USDC)
 * - amount: USD amount (optional, defaults to $1)
 * 
 * Output:
 * - bestPrice: Output amount you'd receive
 * - priceImpact: Price impact percentage
 * - route: DEX route information
 * - pools: Pool names used in the route
 */
export const jupiterNode: NodeHandler = {
  type: "jupiter",
  execute: async (nodeData, input, context) => {
    const {
      inputMint,
      outputMint,
      amount, // USD amount (optional)
    } = nodeData;

    // Validate required fields
    if (!inputMint) throw new Error("inputMint (input token address) is required");
    if (!outputMint) throw new Error("outputMint (output token address) is required");

    try {
      context.logger(`jupiter: getting quote for ${inputMint} → ${outputMint}`);

      // Default to $1 if no amount specified
      const usdAmount = amount || 1;
      context.logger(`jupiter: amount = $${usdAmount} USD`);

      // Get quote with USD amount converted to input token amount
      const result = await getJupiterQuote(inputMint, outputMint, usdAmount, context);

      context.logger(`jupiter: quote received successfully`);

      return {
        success: true,
        inputToken: result.inputToken,
        outputToken: result.outputToken,
        inputAmount: result.inputAmount,
        outputAmount: result.outputAmount,
        priceImpact: result.priceImpact,
        route: result.route,
        pools: result.pools,
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

/**
 * Get Jupiter quote with USD amount
 * Uses Jupiter Legacy Swap API v1
 * Docs: https://dev.jup.ag/docs/swap/get-quote
 */
async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  usdAmount: number,
  context: any
) {
  context.logger(`jupiter: input token = ${inputMint}`);
  context.logger(`jupiter: output token = ${outputMint}`);
  
  // Common token decimals
  const TOKEN_DECIMALS: Record<string, number> = {
    'So11111111111111111111111111111111111111112': 9, // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 6, // USDT
  };

  const inputDecimals = TOKEN_DECIMALS[inputMint] || 6; // Default to 6 for most tokens
  
  // For $1 worth of tokens, use a simple conversion
  // This assumes $1 = 1 million smallest units for most tokens
  // For more accurate pricing, integrate with CoinGecko
  let inputAmount: number;
  
  if (usdAmount <= 100) {
    // Treat as USD - convert to token smallest units
    // $1 worth = 1,000,000 smallest units (for 6 decimal tokens)
    inputAmount = Math.floor(usdAmount * Math.pow(10, inputDecimals));
  } else {
    // Large numbers treated as raw token amounts
    inputAmount = usdAmount;
  }

  context.logger(`jupiter: amount = ${inputAmount} smallest units (${inputAmount / Math.pow(10, inputDecimals)} tokens)`);

  // Get quote from Jupiter Legacy API
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: inputAmount.toString(),
    slippageBps: '50', // 0.5% slippage
  });

  const apiUrl = `https://lite-api.jup.ag/swap/v1/quote?${params.toString()}`;
  context.logger(`jupiter: calling ${apiUrl}`);

  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorText = await response.text();
    context.logger(`jupiter: API error response: ${errorText}`);
    throw new Error(`Jupiter API returned ${response.status}: ${errorText}`);
  }

  const quote: any = await response.json();

  // Extract route information
  const routeInfo = quote.routePlan || [];
  const pools = routeInfo.map((step: any) => ({
    dex: step.swapInfo?.label || 'Unknown',
    percent: step.percent || 100,
  }));

  const outputDecimals = TOKEN_DECIMALS[outputMint] || 6;
  const outputAmountRaw = Number(quote.outAmount);
  const outputAmount = outputAmountRaw / Math.pow(10, outputDecimals);

  const route = routeInfo.map((r: any) => r.swapInfo?.label || 'Unknown').join(' → ');
  
  context.logger(`jupiter: best route = ${route}`);
  context.logger(`jupiter: output = ${outputAmount} tokens`);
  context.logger(`jupiter: price impact = ${quote.priceImpactPct || 0}%`);

  return {
    inputToken: inputMint,
    outputToken: outputMint,
    inputAmount: inputAmount,
    outputAmount: outputAmount,
    priceImpact: Number(quote.priceImpactPct || 0),
    route: route,
    pools: pools,
  };
}
