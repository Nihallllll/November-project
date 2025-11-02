import { Connection, clusterApiUrl } from "@solana/web3.js";
import type { Commitment } from "@solana/web3.js";

/**
 * Create and manage a singleton Solana RPC Connection.
 *
 * Usage:
 *   import { getConnection, createConnection } from '../config/web3';
 *   const conn = getConnection();
 *
 * The RPC URL is taken from process.env.SOLANA_RPC_URL if present,
 * otherwise it falls back to the mainnet-beta cluster URL.
 */

const DEFAULT_COMMITMENT: Commitment = "confirmed";
let connectionSingleton: Connection | null = null;

export function createConnection(rpcUrl?: string, commitment: Commitment = DEFAULT_COMMITMENT): Connection {
	const url = rpcUrl ?? process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet");
	connectionSingleton = new Connection(url, { commitment });
	return connectionSingleton;
}

export function getConnection(): Connection {
	if (!connectionSingleton) {
		createConnection();
	}
	return connectionSingleton as Connection;
}

// convenience default export
export default getConnection;
