import type { NodeHandler } from "./nodes/node-handler.interface";
import { httpRequestNode } from "./nodes/http-request.node";
import { conditionNode } from "./nodes/condition.node";
import { delayNode } from "./nodes/delay.node";
import { logNode } from "./nodes/log.nodes";
import { walletBalanceNode } from "./nodes/wallet-ballance.node";
import { pythPriceNode } from "./nodes/pyth-price.node";
import { emailNode } from "./nodes/email.node";
import { telegramNode } from "./nodes/telegram.node";
import { solanaRPCNode } from "./nodes/solana-rpc.node";
import { tokenProgramNode } from "./nodes/token-program.node";
import { jupiterNode } from "./nodes/jupiter.node";
import { webhookNode } from "./nodes/webhook.node";
import { watchWalletNode } from "./nodes/watch-wallet.node";
import { postgresDBNode } from "./nodes/postgres-db.node";
import { heliusIndexerNode } from "./nodes/helius-indexer.node";
import { aiNode } from "./nodes/ai.node";

// ========== NODE REGISTRY ==========
// This is where you register all your node types
// When you create a new node, add it here!

const NODE_REGISTRY: Record<string, NodeHandler> = {
  "http_request": httpRequestNode,
  "condition": conditionNode,
  "delay": delayNode,
  "log": logNode,
  "wallet_balance":walletBalanceNode,
  "pyth_price": pythPriceNode,
  "email": emailNode,
  "telegram": telegramNode,
  "solana_rpc" : solanaRPCNode,
  "token_program" : tokenProgramNode,
  "jupiter" : jupiterNode,
  "webhook" : webhookNode,
  "watch-wallet" : watchWalletNode,
  "postgres_db" : postgresDBNode,
  "ai": aiNode,  // ✅ ADD THIS
  "helius_indexer": heliusIndexerNode,
};

// ========== LOOKUP FUNCTION ==========

export function getNodeHandler(nodeType: string): NodeHandler {
  const handler = NODE_REGISTRY[nodeType];
  
  if (!handler) {
    throw new Error(`Unknown node type: "${nodeType}". Available types: ${Object.keys(NODE_REGISTRY).join(', ')}`);
  }
  
  return handler;
}

// ========== UTILITY FUNCTIONS ==========

// Get list of all available node types
export function getAvailableNodeTypes(): string[] {
  return Object.keys(NODE_REGISTRY);
}

// Check if a node type exists
export function hasNodeType(nodeType: string): boolean {
  return nodeType in NODE_REGISTRY;
}
