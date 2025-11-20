import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Plus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MultisigNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function MultisigNodeConfig({ node, onUpdate }: MultisigNodeConfigProps) {
  const [action, setAction] = useState(node.data.action || 'create');
  const [owners, setOwners] = useState<string[]>(node.data.owners || ['']);
  const [threshold, setThreshold] = useState(node.data.threshold || 1);
  const [description, setDescription] = useState(node.data.description || '');
  const [expiresIn, setExpiresIn] = useState(node.data.expiresIn || 3600); // Default 1 hour
  
  // For approve/reject/check_status actions
  const [multisigAddress, setMultisigAddress] = useState(node.data.multisigAddress || '');
  
  // Threshold notification settings
  const [notifyOnThreshold, setNotifyOnThreshold] = useState(node.data.notifyOnThreshold || false);
  const [notificationMessage, setNotificationMessage] = useState(
    node.data.notificationMessage || 'Multisig proposal {{multisigAddress}} has reached threshold!'
  );

  useEffect(() => {
    onUpdate({
      ...node.data,
      action,
      owners: action === 'create' ? owners.filter(o => o.trim()) : undefined,
      threshold: action === 'create' ? threshold : undefined,
      description: action === 'create' ? description : undefined,
      expiresIn: action === 'create' ? expiresIn : undefined,
      multisigAddress: action !== 'create' ? multisigAddress : undefined,
      notifyOnThreshold,
      notificationMessage,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [action, owners, threshold, description, expiresIn, multisigAddress, notifyOnThreshold, notificationMessage]);

  const addOwner = () => {
    if (owners.length >= 10) {
      toast.error('Maximum 10 owners allowed');
      return;
    }
    setOwners([...owners, '']);
  };

  const removeOwner = (index: number) => {
    if (owners.length <= 1) {
      toast.error('At least one owner required');
      return;
    }
    setOwners(owners.filter((_, i) => i !== index));
  };

  const updateOwner = (index: number, value: string) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  return (
    <div className="space-y-4">
      {/* Action Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Action *</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="create">Create New Multisig</option>
          <option value="approve">Approve Proposal</option>
          <option value="reject">Reject Proposal</option>
          <option value="check_status">Check Status</option>
        </select>
      </div>

      {action === 'create' ? (
        <>
          {/* Owners List */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Owners (Solana Public Keys) *
              <span className="text-xs text-muted-foreground ml-2">(2-10 owners)</span>
            </label>
            <div className="space-y-2">
              {owners.map((owner, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => updateOwner(index, e.target.value)}
                    placeholder="e.g., 8FqG8...9kL2x"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  />
                  {owners.length > 1 && (
                    <button
                      onClick={() => removeOwner(index)}
                      className="p-2 border border-border rounded-lg hover:bg-destructive/10 hover:border-destructive transition-colors"
                      title="Remove owner"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              {owners.length < 10 && (
                <button
                  onClick={addOwner}
                  className="w-full px-3 py-2 border border-dashed border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Owner
                </button>
              )}
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Approval Threshold *
              <span className="text-xs text-muted-foreground ml-2">
                (How many approvals needed)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={owners.filter(o => o.trim()).length || 1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
              />
              <span className="text-sm text-muted-foreground">
                of {owners.filter(o => o.trim()).length || 1} owners
              </span>
            </div>
            {threshold > owners.filter(o => o.trim()).length && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Threshold cannot exceed number of owners
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
              <span className="text-xs text-muted-foreground ml-2">(max 512 chars)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 512))}
              placeholder="Describe what this multisig proposal is for..."
              rows={4}
              maxLength={512}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/512 characters
            </p>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Expires In (seconds) *
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={3600}>1 hour</option>
              <option value={21600}>6 hours</option>
              <option value={86400}>24 hours</option>
              <option value={259200}>3 days</option>
              <option value={604800}>7 days</option>
            </select>
          </div>
        </>
      ) : (
        <>
          {/* Multisig Address (for approve/reject/check_status) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Multisig Proposal Address *
            </label>
            <input
              type="text"
              value={multisigAddress}
              onChange={(e) => setMultisigAddress(e.target.value)}
              placeholder="PDA address of the multisig proposal"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{{input.multisigAddress}}'} from previous node
            </p>
          </div>
        </>
      )}

      {/* Threshold Notification Settings */}
      {action === 'create' && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="notifyOnThreshold"
              checked={notifyOnThreshold}
              onChange={(e) => setNotifyOnThreshold(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="notifyOnThreshold" className="text-sm font-medium">
              Notify when threshold reached
            </label>
          </div>

          {notifyOnThreshold && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Notification Message Template
              </label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Template for notification..."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
              />
              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                <p className="text-blue-600 dark:text-blue-400 mb-1">Available variables:</p>
                <p className="text-muted-foreground">
                  <code className="bg-background px-1 py-0.5 rounded">{'{{multisigAddress}}'}</code>,{' '}
                  <code className="bg-background px-1 py-0.5 rounded">{'{{threshold}}'}</code>,{' '}
                  <code className="bg-background px-1 py-0.5 rounded">{'{{description}}'}</code>
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Connect a notification node (Telegram/Email) to receive alerts
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm space-y-2">
        <p className="font-medium text-blue-600 dark:text-blue-400">
          {action === 'create' ? '🔐 Multisig Setup' : '✍️ Multisig Action'}
        </p>
        <p className="text-xs text-muted-foreground">
          {action === 'create' && 'Creates a new multisig proposal. Each owner will receive a signing link to approve or reject.'}
          {action === 'approve' && 'Approves a multisig proposal. Requires signer to be one of the owners.'}
          {action === 'reject' && 'Rejects a multisig proposal. Requires signer to be one of the owners.'}
          {action === 'check_status' && 'Retrieves current status of a multisig proposal (approvals, rejections, execution status).'}
        </p>
      </div>
    </div>
  );
}
