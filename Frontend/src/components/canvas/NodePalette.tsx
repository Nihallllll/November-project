import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface NodeCategory {
  name: string;
  nodes: {
    type: string;
    label: string;
    icon: string;
    color: string;
  }[];
}

const nodeCategories: NodeCategory[] = [
  {
    name: 'Triggers',
    nodes: [
      { type: 'webhook', label: 'Webhook', icon: '🔔', color: 'bg-blue-500' },
      { type: 'helius_indexer', label: 'Helius Indexer', icon: '📡', color: 'bg-blue-600' },
      { type: 'watch_wallet', label: 'Watch Wallet', icon: '👁️', color: 'bg-blue-700' },
    ],
  },
  {
    name: 'AI & Logic',
    nodes: [
      { type: 'ai', label: 'AI Agent', icon: '🤖', color: 'bg-purple-500' },
      { type: 'condition', label: 'Condition', icon: '◆', color: 'bg-yellow-500' },
      { type: 'merge', label: 'Merge', icon: '⊃', color: 'bg-gray-500' },
    ],
  },
  {
    name: 'Blockchain',
    nodes: [
      { type: 'wallet_balance', label: 'Wallet Balance', icon: '💰', color: 'bg-green-500' },
      { type: 'pyth_price', label: 'Pyth Price', icon: '💵', color: 'bg-green-600' },
      { type: 'jupiter', label: 'Jupiter Swap', icon: '🪐', color: 'bg-purple-600' },
      { type: 'solana_rpc', label: 'Solana RPC', icon: '⚡', color: 'bg-indigo-500' },
      { type: 'token_program', label: 'Token Program', icon: '🪙', color: 'bg-indigo-600' },
    ],
  },
  {
    name: 'Data',
    nodes: [
      { type: 'postgres_db', label: 'Postgres DB', icon: '🐘', color: 'bg-cyan-500' },
      { type: 'http_request', label: 'HTTP Request', icon: '🌐', color: 'bg-cyan-600' },
    ],
  },
  {
    name: 'Notifications',
    nodes: [
      { type: 'telegram', label: 'Telegram', icon: '✈️', color: 'bg-sky-500' },
      { type: 'email', label: 'Email', icon: '📧', color: 'bg-red-500' },
    ],
  },
  {
    name: 'Utilities',
    nodes: [
      { type: 'delay', label: 'Delay', icon: '⏰', color: 'bg-orange-500' },
      { type: 'log', label: 'Log', icon: '📝', color: 'bg-gray-600' },
    ],
  },
];

export default function NodePalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    nodeCategories.map(cat => cat.name)
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.nodes.length > 0);

  return (
    <div className="w-64 glass border-r border-border/50 flex flex-col flex-shrink-0 h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <h2 className="font-semibold text-foreground">Nodes</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag to canvas</p>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 glass border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Node Categories - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {filteredCategories.map(category => (
          <div key={category.name}>
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-primary/10 transition-colors text-xs font-medium text-muted-foreground mb-2"
            >
              <span>{category.name}</span>
              {expandedCategories.includes(category.name) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {expandedCategories.includes(category.name) && (
              <div className="space-y-1">
                {category.nodes.map(node => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="glass p-3 rounded-lg border border-border/30 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {node.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {node.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
