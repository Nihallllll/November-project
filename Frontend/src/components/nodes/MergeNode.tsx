import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Merge } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[180px]
        bg-gray-600 text-white shadow-lg transition-all
        ${selected ? 'ring-4 ring-gray-300 scale-105' : 'hover:scale-102'}
      `}
    >
      {/* Single input handle that accepts multiple connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: '50%' }}
        className="w-4 h-4 bg-gray-800 border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
          <Merge className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold">Merge</div>
          <div className="text-xs opacity-75">Combine all inputs</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 bg-gray-800 border-2 border-white"
      />
    </div>
  );
});
