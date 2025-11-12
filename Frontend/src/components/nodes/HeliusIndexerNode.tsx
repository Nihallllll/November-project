import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Radio } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px]
        bg-blue-600 text-white shadow-lg transition-all
        ${selected ? 'ring-4 ring-blue-300 scale-105' : 'hover:scale-102'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Radio className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">Helius Indexer</div>
          {data.transactionTypes && (
            <div className="text-xs opacity-90 mt-1">
              {data.transactionTypes.length} types
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-800 border-2 border-white"
      />
    </div>
  );
});
