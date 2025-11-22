import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ShieldCheck } from 'lucide-react';

export default memo(({ data, selected }: NodeProps) => {
  const owners = data.owners || [];
  const threshold = data.threshold || 0;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[280px]
        bg-gradient-to-br from-cyan-500 to-cyan-700
        text-white shadow-lg
        transition-all duration-200
        ${selected ? 'ring-4 ring-cyan-300 ring-opacity-50 scale-105' : 'hover:scale-102'}
      `}
      style={{
        boxShadow: selected
          ? '0 0 30px rgba(6, 182, 212, 0.6)'
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* LEFT HANDLE - INPUT */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: '50%', background: '#0891b2' }}
        className="w-3 h-3 border-2 border-white"
      />

      {/* Node Content */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base">Multisig</div>
          <div className="text-xs opacity-90 mt-1">
            {threshold > 0 && owners.length > 0 ? (
              <span>🔐 {threshold}/{owners.length} owners</span>
            ) : (
              <span>Not configured</span>
            )}
          </div>
          {data.description && (
            <div className="text-xs opacity-75 mt-1 truncate">
              {data.description}
            </div>
          )}
          {data.proposalUrl && (
            <div className="text-xs opacity-90 mt-2 flex items-center gap-1">
              <span>🔗</span>
              <span className="truncate font-mono">
                {data.proposalUrl.length > 35 ? `${data.proposalUrl.slice(0, 35)}...` : data.proposalUrl}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT HANDLE - OUTPUT */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: '50%', background: '#06b6d4' }}
        className="w-3 h-3 border-2 border-white"
      />
    </div>
  );
});
