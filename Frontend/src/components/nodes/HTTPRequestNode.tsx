import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px]
        bg-cyan-600 text-white shadow-lg transition-all
        ${selected ? 'ring-4 ring-cyan-300 scale-105' : 'hover:scale-102'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-cyan-800 border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">HTTP Request</div>
          {data.method && (
            <div className="text-xs opacity-90 mt-1">
              {data.method} {data.url?.slice(0, 20)}...
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-cyan-800 border-2 border-white"
      />
    </div>
  );
});
