import type { NodeHandler } from "./node-handler.interface";

/**
 * CRYPTO PRICE NODE (CoinGecko API)
 * 
 * Fetches real-time cryptocurrency prices from CoinGecko
 * 
 * Configuration (nodeData):
 * - coinId: string (optional) - CoinGecko coin ID (e.g., "bitcoin", "solana", "ethereum")
 * - symbol: string (deprecated) - Legacy support for old flows
 * 
 * If neither coinId nor symbol is provided, defaults to "solana"
 * 
 * Find coin IDs at:
 * - API: https://api.coingecko.com/api/v3/coins/list
 * - Google Sheet: https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit
 * - Website: Visit coin page on CoinGecko.com → "API ID" in info section
 * 
 * Input: Previous node output (optional)
 * 
 * Output:
 * {
 *   coinId: string,
 *   symbol: string,
 *   price: number,
 *   timestamp: Date
 * }
 */

export const pythPriceNode: NodeHandler = {
  type: "pyth_price",
  execute: async (nodeData, input, context) => {
    // ========== STEP 1: GET COIN ID FROM NODE DATA ==========
    
    // Priority: coinId > symbol > default
    let coinId = nodeData.coinId as string | undefined;
    
    // Legacy support: convert old "Crypto.SOL/USD" format to coin ID
    if (!coinId && nodeData.symbol) {
      const symbolMap: Record<string, string> = {
        "Crypto.SOL/USD": "solana",
        "Crypto.BTC/USD": "bitcoin",
        "Crypto.ETH/USD": "ethereum",
      };
      coinId = symbolMap[nodeData.symbol as string] || nodeData.symbol as string;
    }
    
    // Default to solana if nothing provided
    if (!coinId) {
      coinId = "solana";
    }

    context.logger(`pyth_price: fetching price for "${coinId}"`);

    try {
      // ========== STEP 2: CALL COINGECKO API ==========
      
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;

      context.logger(`pyth_price: calling ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // ========== STEP 3: PARSE RESPONSE ==========
      
      const data = (await response.json()) as Record<string, { usd: number }>;

      if (!data[coinId] || data[coinId]!.usd === undefined) {
        throw new Error(`Coin ID "${coinId}" not found. Check https://api.coingecko.com/api/v3/coins/list for valid IDs`);
      }

      const price = data[coinId]!.usd;

      context.logger(`pyth_price: ${coinId} = $${price.toFixed(2)}`);

      // ========== STEP 4: RETURN RESULT ==========
      
      return {
        coinId: coinId,
        symbol: coinId.toUpperCase(), // For backward compatibility
        price: parseFloat(price.toFixed(2)),
        timestamp: new Date(),
      };

    } catch (error: any) {
      context.logger(`pyth_price: ERROR - ${error.message}`);
      
      return {
        coinId: coinId,
        symbol: coinId.toUpperCase(),
        price: 0,
        error: error.message,
        timestamp: new Date(),
      };
    }
  },
};
