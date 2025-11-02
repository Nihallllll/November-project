import type { NodeHandler } from "./node-handler.interface";
import {
  PythHttpClient,
  getPythProgramKeyForCluster,
} from "@pythnetwork/client";

/**
 * PYTH PRICE NODE
 *
 * What it does:
 * - Gets real-time price data from Pyth Network oracle
 * - Returns price, confidence interval, and timestamp
 *
 * Pyth is a blockchain oracle that provides:
 * - Real-time prices (updates every 400ms)
 * - Confidence intervals (price accuracy)
 * - For 200+ assets (crypto, stocks, forex, commodities)
 *
 * Configuration (nodeData):
 * - symbol: string (required) - Price feed symbol
 *   Examples: "Crypto.SOL/USD", "Crypto.BTC/USD", "Crypto.ETH/USD"
 * - network: 'mainnet-beta' | 'devnet' (optional)
 *
 * Output:
 * {
 *   symbol: string,
 *   price: number,           // Current price
 *   confidence: number,      // Price confidence interval
 *   timestamp: Date,         // When price was updated
 *   expo: number             // Price exponent (for precision)
 * }
 *
 * Example usage:
 * {
 *   "type": "pyth_price",
 *   "data": {
 *     "symbol": "Crypto.SOL/USD"
 *   }
 * }
 */

export const pythPriceNode: NodeHandler = {
  type: "pyth_price",

  execute: async (nodeData, input, context) => {
    // ========== STEP 1: VALIDATE INPUT ==========

    const { symbol, network = "devnet" } = nodeData;

    if (!symbol) {
      throw new Error("pyth_price: symbol is required");
    }

    context.logger(`pyth_price: fetching price for ${symbol}`);

    // ========== STEP 2: CHECK WEB3 CONNECTION ==========

    if (!context.web3?.solana) {
      throw new Error("pyth_price: Solana connection not available");
    }

    try {
      // ========== STEP 3: CREATE PYTH CLIENT ==========

      // Get Pyth program address for the network
      const pythProgramKey = getPythProgramKeyForCluster(network as any);

      // Create Pyth HTTP client
      const pythClient = new PythHttpClient(
        context.web3.solana,
        pythProgramKey
      );

      // ========== STEP 4: GET PRICE DATA ==========

      context.logger(`pyth_price: querying oracle...`);

      // Get all price data from Pyth
      const priceData = await pythClient.getData();

      // Find the specific symbol we want
      const productData = priceData.products.find(
        (product) => product.symbol === symbol
      );

      if (!productData) {
        throw new Error(
          `pyth_price: Symbol "${symbol}" not found. Available symbols: ${priceData.products
            .map((p) => p.symbol)
            .join(", ")}`
        );
      }

      // Get the price feed for this product
      const priceAccount = priceData.productPrice.get(
        productData.symbol as string
      );

      if (!priceAccount || !priceAccount.price || !priceAccount.confidence) {
        throw new Error(`pyth_price: No price data available for ${symbol}`);
      }

      // ========== STEP 5: FORMAT PRICE DATA ==========

      // Pyth prices have an exponent (10^expo)
      // Example: price=45000, expo=-2 means actual price = 45000 * 10^-2 = 450.00
      const price = Number(priceAccount.price);
      const confidence = Number(priceAccount.confidence);
      const expo = priceAccount.exponent;

      // Calculate actual price with exponent
      const actualPrice = price * Math.pow(10, expo);
      const actualConfidence = confidence * Math.pow(10, expo);

      const result = {
        symbol: symbol,
        price: actualPrice,
        confidence: actualConfidence,
        expo: expo,
        timestamp: new Date(),
        network: network,
      };

      context.logger(
        `pyth_price: ${symbol} = $${actualPrice.toFixed(
          2
        )} ±${actualConfidence.toFixed(2)}`
      );

      return result;
    } catch (error: any) {
      // ========== STEP 6: ERROR HANDLING ==========

      context.logger(`pyth_price: error - ${error.message}`);

      return {
        symbol: symbol,
        price: 0,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
};
