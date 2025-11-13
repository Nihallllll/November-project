import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Zap, Database } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  const model = data.model || 'GPT-4';
  const hasMemory = data.memory || false;
  
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[280px]
        bg-gradient-to-br from-purple-500 to-purple-700
        text-white shadow-lg
        transition-all duration-200
        ${selected ? 'ring-4 ring-purple-300 ring-opacity-50 scale-105' : 'hover:scale-102'}
      `}
      style={{
        boxShadow: selected
          ? '0 0 30px rgba(168, 85, 247, 0.6)'
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* LEFT HANDLE - INPUT */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: '50%', background: '#3b82f6' }}
        className="w-3 h-3 border-2 border-white"
      />
      <div className="absolute -left-20 top-[47%] text-xs text-muted-foreground whitespace-nowrap">
        Data In
      </div>

      {/* BOTTOM HANDLE - DATABASE INPUT */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="database"
        style={{ left: '50%', background: '#8b5cf6' }}
        className="w-3 h-3 border-2 border-white"
      />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
        Database
      </div>

      {/* Node Content */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <Brain className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg flex items-center gap-2">
            AI Agent
            {hasMemory && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-900/50 rounded text-xs">
                <Database className="w-3 h-3" />
                Memory
              </div>
            )}
          </div>
          
          <div className="text-sm opacity-90 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {model}
          </div>

          {data.prompt && (
            <div className="mt-2 text-xs opacity-75 line-clamp-2 bg-white/10 rounded px-2 py-1">
              {data.prompt}
            </div>
          )}

          {data.tools && data.tools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {data.tools.map((tool: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-purple-900/50 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT HANDLE - OUTPUT */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: '50%', background: '#10b981' }}
        className="w-3 h-3 border-2 border-white"
      />
      <div className="absolute -right-20 top-[47%] text-xs text-muted-foreground whitespace-nowrap">
        Output
      </div>

      {/* Status Indicator */}
      {data.status && (
        <div className="absolute -top-2 -right-2">
          <div
            className={`
              w-4 h-4 rounded-full border-2 border-white
              ${data.status === 'running' ? 'bg-yellow-500 animate-pulse' : ''}
              ${data.status === 'success' ? 'bg-green-500' : ''}
              ${data.status === 'error' ? 'bg-red-500' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
});
