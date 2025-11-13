import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600
        border-2 transition-all min-w-[200px]
        ${selected ? 'ring-2 ring-primary ring-offset-2' : 'border-indigo-400'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl">
          ⏰
        </div>
        <div className="text-white font-semibold">Schedule Trigger</div>
      </div>
      
      <div className="text-xs text-white/80 space-y-1">
        {data.scheduleType === 'interval' && data.interval && (
          <div>⏱️ Every {data.interval}</div>
        )}
        {data.scheduleType === 'cron' && data.cronExpression && (
          <div>📅 {data.cronExpression}</div>
        )}
        {!data.scheduleType && (
          <div className="text-white/60">Not configured</div>
        )}
      </div>

      {/* Output handle - triggers start workflow */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-indigo-500"
      />
    </div>
  );
});
