import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px]
        bg-cyan-500 text-white shadow-lg transition-all
        ${selected ? 'ring-4 ring-cyan-300 scale-105' : 'hover:scale-102'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-cyan-700 border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">Postgres DB</div>
          {data.operation && (
            <div className="text-xs opacity-90 mt-1">
              {data.operation.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-cyan-700 border-2 border-white"
      />
    </div>
  );
});
