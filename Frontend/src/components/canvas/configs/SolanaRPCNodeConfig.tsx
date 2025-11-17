import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface SolanaRPCNodeConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
}

const SOLANA_ACTIONS = [
  { value: 'getBalance', label: 'Get Balance', requiresAddress: true },
  { value: 'getAccountInfo', label: 'Get Account Info', requiresAddress: true },
  { value: 'getTransaction', label: 'Get Transaction', requiresSignature: true },
  { value: 'getSignaturesForAddress', label: 'Get Signatures for Address', requiresAddress: true },
  { value: 'getSlot', label: 'Get Current Slot', requiresAddress: false },
  { value: 'getBlockHeight', label: 'Get Block Height', requiresAddress: false },
  { value: 'getRecentBlockhash', label: 'Get Recent Blockhash', requiresAddress: false },
];

export function SolanaRPCNodeConfig({ node, onUpdate }: SolanaRPCNodeConfigProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [localData, setLocalData] = useState<Record<string, any>>(node.data || {});

  useEffect(() => {
    loadCredentials();
  }, []);

  useEffect(() => {
    setLocalData(node.data || {});
  }, [node.data]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('SolanaRPCNodeConfig: No userId in localStorage');
        return;
      }

      console.log('SolanaRPCNodeConfig: Loading credentials for userId:', userId);
      const allCreds = await credentialsApi.list(userId);
      console.log('SolanaRPCNodeConfig: All credentials:', allCreds);
      console.log('SolanaRPCNodeConfig: Credential types:', allCreds.map(c => c.type));
      
      const solanaRPCCreds = allCreds.filter((c) => c.type === 'solana_rpc');
      console.log('SolanaRPCNodeConfig: Filtered Solana RPC credentials:', solanaRPCCreds);
      
      setCredentials(solanaRPCCreds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load RPC credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    const userId = localStorage.getItem('userId');
    const newData = { 
      ...localData, 
      [field]: value,
      userId,  // Always include userId for backend credential lookup
    };
    setLocalData(newData);
    onUpdate(node.id, newData);
  };

  const selectedAction = SOLANA_ACTIONS.find(a => a.value === localData.action);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">RPC Credential</label>
          <button
            type="button"
            onClick={loadCredentials}
            className="text-xs text-blue-500 hover:text-blue-600 underline"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="space-y-2">
            <div className="text-sm text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              No Solana RPC credentials found. Please create one in the Credential Manager.
            </div>
            <button
              type="button"
              onClick={loadCredentials}
              className="w-full text-sm px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 text-blue-600"
            >
              🔄 Refresh Credentials
            </button>
          </div>
        ) : (
          <select
            value={localData.credentialId ?? ''}
            onChange={(e) => handleChange('credentialId', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select RPC endpoint</option>
            {credentials.map((cred) => (
              <option key={cred.id} value={cred.id}>
                {cred.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Action</label>
        <select
          value={localData.action ?? ''}
          onChange={(e) => handleChange('action', e.target.value)}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select action</option>
          {SOLANA_ACTIONS.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
      </div>

      {selectedAction?.requiresAddress && (
        <div>
          <label className="block text-sm font-medium mb-2">Wallet Address</label>
          <input
            type="text"
            value={localData.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Solana wallet address"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {selectedAction?.requiresSignature && (
        <div>
          <label className="block text-sm font-medium mb-2">Transaction Signature</label>
          <input
            type="text"
            value={localData.signature ?? ''}
            onChange={(e) => handleChange('signature', e.target.value)}
            placeholder="Transaction signature"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {localData.action === 'getSignaturesForAddress' && (
        <div>
          <label className="block text-sm font-medium mb-2">Limit (optional)</label>
          <input
            type="number"
            value={localData.limit ?? 10}
            onChange={(e) => handleChange('limit', parseInt(e.target.value) || 10)}
            placeholder="10"
            min="1"
            max="1000"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">ℹ️ Usage Tips</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Create a Solana RPC credential first (Mainnet, Devnet, or custom)</li>
          <li>• Free RPC: https://api.mainnet-beta.solana.com</li>
          <li>• For production, use paid providers (Helius, QuickNode, Alchemy)</li>
        </ul>
      </div>
    </div>
  );
}
