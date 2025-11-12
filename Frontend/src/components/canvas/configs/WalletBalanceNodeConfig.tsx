import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface WalletBalanceNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function WalletBalanceNodeConfig({ node, onUpdate }: WalletBalanceNodeConfigProps) {
  const [walletAddress, setWalletAddress] = useState(node.data.walletAddress || '');
  const [tokenMint, setTokenMint] = useState(node.data.tokenMint || '');

  useEffect(() => {
    onUpdate({
      ...node.data,
      walletAddress,
      tokenMint,
    });
  }, [walletAddress, tokenMint]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Solana wallet address..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Token Mint (Optional)</label>
        <input
          type="text"
          value={tokenMint}
          onChange={(e) => setTokenMint(e.target.value)}
          placeholder="Leave empty for SOL balance"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter SPL token mint address or leave empty for native SOL
        </p>
      </div>
    </div>
  );
}
