import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative px-4 py-3 min-w-[200px]
        bg-yellow-500 text-white
        rounded-lg border-2 border-yellow-600
        shadow-lg transition-all
        ${selected ? 'ring-4 ring-yellow-300 scale-105' : 'hover:scale-102'}
      `}
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        padding: '30px 20px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-700 border-2 border-white"
      />

      <div className="flex flex-col items-center text-center">
        <GitBranch className="w-6 h-6 mb-2" />
        <div className="font-semibold">Condition</div>
        {data.expression && (
          <div className="text-xs mt-1 opacity-90 font-mono">
            {data.expression}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%', background: '#10b981' }}
        className="w-3 h-3 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%', background: '#ef4444' }}
        className="w-3 h-3 border-2 border-white"
      />
    </div>
  );
});
