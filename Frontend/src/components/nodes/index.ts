import AINode from './AINode';
import ConditionNode from './ConditionNode';
import MergeNode from './MergeNode';
import WalletBalanceNode from './WalletBalanceNode';
import PythPriceNode from './PythPriceNode';
import JupiterNode from './JupiterNode';
import TelegramNode from './TelegramNode';
import EmailNode from './EmailNode';
import PostgresDBNode from './PostgresDBNode';
import HTTPRequestNode from './HTTPRequestNode';
import WebhookNode from './WebhookNode';
import HeliusIndexerNode from './HeliusIndexerNode';
import WatchWalletNode from './WatchWalletNode';
import SolanaRPCNode from './SolanaRPCNode';
import TokenProgramNode from './TokenProgramNode';
import DelayNode from './DelayNode';
import LogNode from './LogNode';

export const nodeTypes = {
  ai: AINode,
  condition: ConditionNode,
  merge: MergeNode,
  wallet_balance: WalletBalanceNode,
  pyth_price: PythPriceNode,
  jupiter: JupiterNode,
  telegram: TelegramNode,
  email: EmailNode,
  postgres_db: PostgresDBNode,
  http_request: HTTPRequestNode,
  webhook: WebhookNode,
  helius_indexer: HeliusIndexerNode,
  watch_wallet: WatchWalletNode,
  solana_rpc: SolanaRPCNode,
  token_program: TokenProgramNode,
  delay: DelayNode,
  log: LogNode,
};
