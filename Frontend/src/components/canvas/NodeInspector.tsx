import { X } from 'lucide-react';
import { Node } from 'reactflow';
import AINodeConfig from './configs/AINodeConfig';
import ConditionNodeConfig from './configs/ConditionNodeConfig';
import WalletBalanceNodeConfig from './configs/WalletBalanceNodeConfig';
import ScheduleNodeConfig from './configs/ScheduleNodeConfig';
import TelegramNodeConfig from './configs/TelegramNodeConfig';
import EmailNodeConfig from './configs/EmailNodeConfig';
import PostgresDBNodeConfig from './configs/PostgresDBNodeConfig';
import {
  PythPriceNodeConfig,
  JupiterNodeConfig,
  HTTPRequestNodeConfig,
  WebhookNodeConfig,
  HeliusIndexerNodeConfig,
  WatchWalletNodeConfig,
  SolanaRPCNodeConfig,
  TokenProgramNodeConfig,
  DelayNodeConfig,
  LogNodeConfig,
  MergeNodeConfig,
} from './configs/SimpleConfigs';

interface NodeInspectorProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeInspector({ selectedNode, onClose, onUpdate }: NodeInspectorProps) {
  if (!selectedNode) return null;

  const handleUpdate = (data: any) => {
    onUpdate(selectedNode.id, data);
  };

  const renderConfig = () => {
    switch (selectedNode.type) {
      case 'ai':
        return <AINodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'condition':
        return <ConditionNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'merge':
        return <MergeNodeConfig />;
      case 'schedule':
        return <ScheduleNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'wallet_balance':
        return <WalletBalanceNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'pyth_price':
        return <PythPriceNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'jupiter':
        return <JupiterNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'telegram':
        return <TelegramNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'email':
        return <EmailNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'postgres_db':
        return <PostgresDBNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'http_request':
        return <HTTPRequestNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'webhook':
        return <WebhookNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'helius_indexer':
        return <HeliusIndexerNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'watch_wallet':
        return <WatchWalletNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'solana_rpc':
        return <SolanaRPCNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'token_program':
        return <TokenProgramNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'delay':
        return <DelayNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      case 'log':
        return <LogNodeConfig node={selectedNode} onUpdate={handleUpdate} />;
      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            No configuration available for this node type
          </div>
        );
    }
  };

  return (
    <div className="w-80 glass border-l border-border/50 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-foreground">Node Configuration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedNode.type?.replace(/_/g, ' ').toUpperCase()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Configuration Form - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {renderConfig()}
      </div>
    </div>
  );
}
