import { Node } from 'reactflow';

const createSimpleConfig = (title: string, fields: { name: string; label: string; type: string; placeholder?: string }[]) => {
  return function SimpleConfig({ node, onUpdate }: { node: Node; onUpdate: (data: any) => void }) {
    const handleChange = (field: string, value: any) => {
      onUpdate({
        ...node.data,
        [field]: value,
      });
    };

    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={node.data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            ) : (
              <input
                type={field.type}
                value={node.data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>
        ))}
      </div>
    );
  };
};

export const PythPriceNodeConfig = createSimpleConfig('Pyth Price', [
  { name: 'priceFeed', label: 'Price Feed ID', type: 'text', placeholder: 'e.g., SOL/USD' },
]);

export const JupiterNodeConfig = createSimpleConfig('Jupiter Swap', [
  { name: 'inputMint', label: 'Input Token Mint', type: 'text', placeholder: 'Token to swap from' },
  { name: 'outputMint', label: 'Output Token Mint', type: 'text', placeholder: 'Token to swap to' },
  { name: 'amount', label: 'Amount', type: 'number', placeholder: '0' },
]);

export const TelegramNodeConfig = createSimpleConfig('Telegram', [
  { name: 'chatId', label: 'Chat ID', type: 'text', placeholder: 'Telegram chat ID' },
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Message to send...' },
]);

export const EmailNodeConfig = createSimpleConfig('Email', [
  { name: 'to', label: 'To', type: 'email', placeholder: 'recipient@example.com' },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
  { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body...' },
]);

export const PostgresDBNodeConfig = createSimpleConfig('Postgres DB', [
  { name: 'operation', label: 'Operation', type: 'text', placeholder: 'SELECT, INSERT, UPDATE, DELETE' },
  { name: 'query', label: 'SQL Query', type: 'textarea', placeholder: 'SELECT * FROM...' },
]);

export const HTTPRequestNodeConfig = createSimpleConfig('HTTP Request', [
  { name: 'method', label: 'Method', type: 'text', placeholder: 'GET, POST, PUT, DELETE' },
  { name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com' },
  { name: 'body', label: 'Request Body (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
]);

export const WebhookNodeConfig = createSimpleConfig('Webhook', [
  { name: 'path', label: 'Webhook Path', type: 'text', placeholder: '/webhook/my-flow' },
]);

export const HeliusIndexerNodeConfig = createSimpleConfig('Helius Indexer', [
  { name: 'accountAddress', label: 'Account Address', type: 'text', placeholder: 'Solana account to watch' },
  { name: 'transactionTypes', label: 'Transaction Types', type: 'text', placeholder: 'ANY, NFT_SALE, etc.' },
]);

export const WatchWalletNodeConfig = createSimpleConfig('Watch Wallet', [
  { name: 'walletAddress', label: 'Wallet Address', type: 'text', placeholder: 'Solana wallet address' },
  { name: 'interval', label: 'Check Interval (seconds)', type: 'number', placeholder: '60' },
]);

export const SolanaRPCNodeConfig = createSimpleConfig('Solana RPC', [
  { name: 'method', label: 'RPC Method', type: 'text', placeholder: 'getAccountInfo, getBalance, etc.' },
  { name: 'params', label: 'Parameters (JSON)', type: 'textarea', placeholder: '["address"]' },
]);

export const TokenProgramNodeConfig = createSimpleConfig('Token Program', [
  { name: 'instruction', label: 'Instruction', type: 'text', placeholder: 'transfer, mint, burn' },
  { name: 'tokenMint', label: 'Token Mint', type: 'text', placeholder: 'SPL token mint address' },
  { name: 'amount', label: 'Amount', type: 'number', placeholder: '0' },
]);

export const DelayNodeConfig = createSimpleConfig('Delay', [
  { name: 'duration', label: 'Duration (milliseconds)', type: 'number', placeholder: '1000' },
]);

export const LogNodeConfig = createSimpleConfig('Log', [
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Log message...' },
  { name: 'level', label: 'Level', type: 'text', placeholder: 'info, warn, error' },
]);

export const MergeNodeConfig = function MergeNodeConfig() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">Merge Node</p>
        <p className="text-xs text-muted-foreground">
          This node waits for all incoming connections to complete before continuing.
          No configuration needed.
        </p>
      </div>
    </div>
  );
};

export default {
  PythPriceNodeConfig,
  JupiterNodeConfig,
  TelegramNodeConfig,
  EmailNodeConfig,
  PostgresDBNodeConfig,
  HTTPRequestNodeConfig,
  WebhookNodeConfig,
  HeliusIndexerNodeConfig,
  WatchWalletNodeConfig,
  SolanaRPCNodeConfig,
  TokenProgramNodeConfig,
  DelayNodeConfig,
  LogNodeConfig,
  MergeNodeConfig,
};
