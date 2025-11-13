import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface ScheduleNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function ScheduleNodeConfig({ node, onUpdate }: ScheduleNodeConfigProps) {
  const [scheduleType, setScheduleType] = useState(node.data.scheduleType || 'interval');
  const [interval, setInterval] = useState(node.data.interval || '5m');
  const [cronExpression, setCronExpression] = useState(node.data.cronExpression || '*/5 * * * *');
  const [customInterval, setCustomInterval] = useState('');
  const [customUnit, setCustomUnit] = useState('m');

  useEffect(() => {
    const data = {
      scheduleType,
      interval: scheduleType === 'interval' ? interval : undefined,
      cronExpression: scheduleType === 'cron' ? cronExpression : undefined,
    };
    onUpdate(data);
  }, [scheduleType, interval, cronExpression]);

  const handleIntervalChange = (value: string) => {
    setInterval(value);
  };

  const handleCustomInterval = () => {
    if (customInterval && customUnit) {
      const newInterval = `${customInterval}${customUnit}`;
      setInterval(newInterval);
      setCustomInterval('');
    }
  };

  const intervalPresets = [
    { label: 'Every 30 seconds', value: '30s' },
    { label: 'Every minute', value: '1m' },
    { label: 'Every 5 minutes', value: '5m' },
    { label: 'Every 15 minutes', value: '15m' },
    { label: 'Every 30 minutes', value: '30m' },
    { label: 'Every hour', value: '1h' },
    { label: 'Every 6 hours', value: '6h' },
    { label: 'Every 12 hours', value: '12h' },
    { label: 'Every 24 hours', value: '24h' },
  ];

  const cronPresets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every 30 minutes', value: '*/30 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every day at 9 AM', value: '0 9 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  ];

  return (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="glass p-3 rounded-lg border border-border/50">
        <div className="text-xs text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">⏰ Schedule Trigger</div>
          <p>Configure when this workflow should automatically run.</p>
        </div>
      </div>

      {/* Schedule Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Schedule Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setScheduleType('interval')}
            className={`p-3 rounded-lg border-2 transition-all ${
              scheduleType === 'interval'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-xl mb-1">⏱️</div>
            <div className="text-xs font-medium">Interval</div>
            <div className="text-xs text-muted-foreground">Every X time</div>
          </button>
          <button
            onClick={() => setScheduleType('cron')}
            className={`p-3 rounded-lg border-2 transition-all ${
              scheduleType === 'cron'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-xl mb-1">📅</div>
            <div className="text-xs font-medium">Cron</div>
            <div className="text-xs text-muted-foreground">Advanced</div>
          </button>
        </div>
      </div>

      {/* Interval Configuration */}
      {scheduleType === 'interval' && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Interval</label>
          <select
            value={interval}
            onChange={(e) => handleIntervalChange(e.target.value)}
            className="w-full px-3 py-2 glass border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            {intervalPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>

          {/* Custom Interval */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Or create custom interval</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Value"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                className="flex-1 px-3 py-2 glass border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="px-3 py-2 glass border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="s">Seconds</option>
                <option value="m">Minutes</option>
                <option value="h">Hours</option>
              </select>
              <button
                onClick={handleCustomInterval}
                disabled={!customInterval}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Set
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="glass p-3 rounded-lg border border-border/50">
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">Current Setting:</div>
              <div className="font-mono">{interval}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cron Configuration */}
      {scheduleType === 'cron' && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Cron Expression</label>
          <select
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            className="w-full px-3 py-2 glass border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            {cronPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>

          {/* Custom Cron */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Or enter custom cron expression</label>
            <input
              type="text"
              placeholder="*/5 * * * *"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              className="w-full px-3 py-2 glass border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
            />
          </div>

          {/* Cron Format Help */}
          <div className="glass p-3 rounded-lg border border-border/50">
            <div className="text-xs space-y-1">
              <div className="font-semibold text-foreground mb-2">Cron Format:</div>
              <div className="font-mono text-muted-foreground">* * * * *</div>
              <div className="font-mono text-muted-foreground">│ │ │ │ │</div>
              <div className="font-mono text-muted-foreground">│ │ │ │ └─ Day of Week (0-6)</div>
              <div className="font-mono text-muted-foreground">│ │ │ └─── Month (1-12)</div>
              <div className="font-mono text-muted-foreground">│ │ └───── Day of Month (1-31)</div>
              <div className="font-mono text-muted-foreground">│ └─────── Hour (0-23)</div>
              <div className="font-mono text-muted-foreground">└───────── Minute (0-59)</div>
            </div>
          </div>

          {/* Preview */}
          <div className="glass p-3 rounded-lg border border-border/50">
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">Current Expression:</div>
              <div className="font-mono">{cronExpression}</div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          <div className="font-semibold mb-1">ℹ️ Note:</div>
          <ul className="space-y-1 ml-4 list-disc">
            <li>This node triggers the workflow automatically</li>
            <li>Schedule is saved with the workflow</li>
            <li>Requires the scheduler service to be running</li>
            <li>This must be a start node (no incoming connections)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
