import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Database } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  const action = data.action || 'search';
  
  const actionIcons: Record<string, string> = {
    add: '➕',
    search: '🔍',
    get_all: '📚',
    delete: '🗑️',
  };

  const actionColors: Record<string, string> = {
    add: 'from-green-600 to-green-700',
    search: 'from-blue-600 to-blue-700',
    get_all: 'from-purple-600 to-purple-700',
    delete: 'from-red-600 to-red-700',
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px]
        bg-gradient-to-br ${actionColors[action] || 'from-indigo-600 to-indigo-700'} 
        text-white shadow-lg transition-all
        ${selected ? 'ring-4 ring-indigo-300 scale-105' : 'hover:scale-102'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-indigo-800 border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <Brain className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg flex items-center gap-2">
            Mem0 Memory
            <span className="text-xl">{actionIcons[action]}</span>
          </div>
          
          <div className="text-sm opacity-90 mt-1 flex items-center gap-1">
            <Database className="w-3 h-3" />
            {action.replace('_', ' ')}
          </div>

          {data.query && (
            <div className="mt-2 text-xs opacity-75 line-clamp-1 bg-white/10 rounded px-2 py-1">
              {data.query}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-800 border-2 border-white"
      />
    </div>
  );
});
