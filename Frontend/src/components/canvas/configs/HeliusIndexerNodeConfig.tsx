import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { useParams } from 'react-router-dom';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface HeliusIndexerNodeConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
}

const TRANSACTION_TYPES = [
  { value: 'ANY', label: 'Any Transaction' },
  { value: 'NFT_SALE', label: 'NFT Sale' },
  { value: 'NFT_LISTING', label: 'NFT Listing' },
  { value: 'NFT_BID', label: 'NFT Bid' },
  { value: 'NFT_MINT', label: 'NFT Mint' },
  { value: 'SWAP', label: 'Token Swap' },
  { value: 'TRANSFER', label: 'Token Transfer' },
  { value: 'TOKEN_MINT', label: 'Token Mint' },
  { value: 'BURN', label: 'Token Burn' },
];

const NETWORKS = [
  { value: 'mainnet-beta', label: 'Mainnet' },
  { value: 'devnet', label: 'Devnet' },
];

const WEBHOOK_TYPES = [
  { value: 'enhanced', label: 'Enhanced (Parsed data)' },
  { value: 'raw', label: 'Raw (Raw blockchain data)' },
  { value: 'discord', label: 'Discord (Formatted for Discord)' },
];

export function HeliusIndexerNodeConfig({ node, onUpdate }: HeliusIndexerNodeConfigProps) {
  const { id: flowId } = useParams();  // Get flowId from URL
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
        console.warn('HeliusIndexerNodeConfig: No userId in localStorage');
        toast.error('User not logged in. Please refresh the page.');
        return;
      }

      console.log('HeliusIndexerNodeConfig: Loading credentials for userId:', userId);
      const allCreds = await credentialsApi.list(userId);
      console.log('HeliusIndexerNodeConfig: All credentials:', allCreds);
      console.log('HeliusIndexerNodeConfig: Credential types found:', allCreds.map(c => c.type));
      
      // Filter for helius credentials (case-insensitive)
      const heliusCreds = allCreds.filter((c) => 
        c.type.toLowerCase() === 'helius' || 
        c.type.toLowerCase() === 'helius_api_key' ||
        c.type.toLowerCase().includes('helius')
      );
      console.log('HeliusIndexerNodeConfig: Filtered Helius credentials:', heliusCreds);
      
      if (heliusCreds.length === 0 && allCreds.length > 0) {
        console.warn('⚠️ No Helius credentials found. Available types:', allCreds.map(c => c.type));
        toast.error('No Helius credentials found. Please create one with type "Helius API Key"');
      }
      
      setCredentials(heliusCreds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load Helius credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    const userId = localStorage.getItem('userId');
    const newData = { 
      ...localData, 
      [field]: value,
      userId,   // Always include userId for backend
      flowId,   // Always include flowId for backend
    };
    setLocalData(newData);
    onUpdate(node.id, newData);
  };

  // Parse account addresses from comma-separated string to array
  const accountAddressesStr = Array.isArray(localData.accountAddresses) 
    ? localData.accountAddresses.join(', ')
    : localData.accountAddresses || '';

  const handleAccountAddressesChange = (value: string) => {
    // Split by comma and trim whitespace
    const addresses = value.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
    handleChange('accountAddresses', addresses);
  };

  // Parse transaction types
  const selectedTypes = Array.isArray(localData.transactionTypes) 
    ? localData.transactionTypes 
    : (localData.transactionTypes || 'ANY').split(',').map((t: string) => t.trim());

  const handleTransactionTypesChange = (type: string) => {
    let newTypes: string[];
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter((t: string) => t !== type);
    } else {
      newTypes = [...selectedTypes, type];
    }
    handleChange('transactionTypes', newTypes.length > 0 ? newTypes : ['ANY']);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Helius API Key</label>
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
              No Helius credentials found. Please create one in the Credential Manager.
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
            <option value="">Select Helius API key</option>
            {credentials.map((cred) => (
              <option key={cred.id} value={cred.id}>
                {cred.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-sm font-medium mb-1">📡 Webhook Endpoint</p>
        <p className="text-xs text-muted-foreground">
          Helius will automatically send blockchain events to your backend. The webhook URL is auto-generated when you run this flow.
        </p>
        <p className="text-xs text-blue-400 mt-1 font-mono">
          /api/webhooks/helius/{'{'}flowId{'}'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Account Addresses to Monitor</label>
        <textarea
          value={accountAddressesStr}
          onChange={(e) => handleAccountAddressesChange(e.target.value)}
          placeholder="Enter Solana addresses (comma-separated)&#10;e.g., DYw8jC..., 7xKXt..."
          rows={3}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate multiple addresses with commas
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Transaction Types</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-background border border-input rounded-lg">
          {TRANSACTION_TYPES.map((type) => (
            <label key={type.value} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-accent/50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.value)}
                onChange={() => handleTransactionTypesChange(type.value)}
                className="rounded border-input"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Network</label>
          <select
            value={localData.network ?? 'mainnet-beta'}
            onChange={(e) => handleChange('network', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {NETWORKS.map((network) => (
              <option key={network.value} value={network.value}>
                {network.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Webhook Type</label>
          <select
            value={localData.webhookType ?? 'enhanced'}
            onChange={(e) => handleChange('webhookType', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {WEBHOOK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Auth Header (Optional)</label>
        <input
          type="text"
          value={localData.authHeader ?? ''}
          onChange={(e) => handleChange('authHeader', e.target.value)}
          placeholder="Custom authorization header for verification"
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">ℹ️ How It Works</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Step 1:</strong> Get your free API key from <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">helius.dev</a></li>
          <li>• <strong>Step 2:</strong> Add the API key to Credential Manager</li>
          <li>• <strong>Step 3:</strong> Enter Solana addresses you want to monitor</li>
          <li>• <strong>Step 4:</strong> Select what types of transactions to track</li>
          <li>• <strong>Step 5:</strong> Run the flow - Helius will automatically notify your backend when transactions happen!</li>
        </ul>
        <div className="mt-2 pt-2 border-t border-green-500/20">
          <p className="text-xs font-medium text-green-400">✨ No webhook configuration needed - it's automatic!</p>
        </div>
      </div>
    </div>
  );
}
