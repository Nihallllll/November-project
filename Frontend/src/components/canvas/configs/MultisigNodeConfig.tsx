import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Plus, X, AlertCircle, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import api from '../../../api/client';

interface MultisigNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function MultisigNodeConfig({ node, onUpdate }: MultisigNodeConfigProps) {
  const { publicKey, connected } = useWallet();
  
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

  // Proposal creation states
  const [proposalUrl, setProposalUrl] = useState(node.data.proposalUrl || '');
  const [proposalId, setProposalId] = useState(node.data.proposalId || '');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyTelegram, setNotifyTelegram] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

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
      proposalUrl,
      proposalId,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [action, owners, threshold, description, expiresIn, multisigAddress, notifyOnThreshold, notificationMessage, proposalUrl, proposalId]);

  const validateFields = (): boolean => {
    const validOwners = owners.filter(o => o.trim());
    if (validOwners.length < 2) {
      toast.error('At least 2 owners required');
      return false;
    }
    if (threshold < 1 || threshold > validOwners.length) {
      toast.error('Invalid threshold value');
      return false;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return false;
    }
    return true;
  };

  const handleCreateProposal = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateFields()) {
      return;
    }

    setCreating(true);
    try {
      const validOwners = owners.filter(o => o.trim());
      const response = await api.post('/proposals/multisig', {
        flowId: node.id,
        creator: publicKey.toString(),
        owners: validOwners,
        threshold,
        description,
        expiresIn,
        notifyEmail: notifyEmail.trim() || undefined,
        notifyTelegram: notifyTelegram.trim() || undefined,
      });

      const { proposal } = response.data;
      setProposalUrl(proposal.signingUrl);
      setProposalId(proposal.id);
      
      toast.success('Multisig proposal created successfully!');
      if (notifyEmail.trim() || notifyTelegram.trim()) {
        toast.info('Notifications sent to recipients');
      }
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      toast.error(error.response?.data?.error || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyUrl = () => {
    if (proposalUrl) {
      navigator.clipboard.writeText(proposalUrl);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          disabled={!!proposalUrl}
        >
          <option value="create">Create New Multisig</option>
          <option value="approve">Approve Proposal</option>
          <option value="reject">Reject Proposal</option>
          <option value="check_status">Check Status</option>
        </select>
      </div>

      {action === 'create' ? (
        <>
          {/* Wallet Connection (only show if no proposal created yet) */}
          {!proposalUrl && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                Connect Wallet to Create Proposal
              </p>
              <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-lg !px-4 !py-2 !text-sm" />
            </div>
          )}

          {/* Show URL if proposal created */}
          {proposalUrl && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Proposal Created Successfully!
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-2 text-muted-foreground">
                  Signing URL (Share with owners)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={proposalUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
                    title="Copy URL"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(proposalUrl, '_blank')}
                    className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Share this URL with all owners to collect signatures. Each owner needs to approve/reject using their wallet.
              </p>
            </div>
          )}

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
                    disabled={!!proposalUrl}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-50"
                  />
                  {owners.length > 1 && (
                    <button
                      onClick={() => removeOwner(index)}
                      disabled={!!proposalUrl}
                      className="p-2 border border-border rounded-lg hover:bg-destructive/10 hover:border-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove owner"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              {owners.length < 10 && !proposalUrl && (
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
                disabled={!!proposalUrl}
                className="w-20 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center disabled:opacity-50"
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
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
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
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value={3600}>1 hour</option>
              <option value={21600}>6 hours</option>
              <option value={86400}>24 hours</option>
              <option value={259200}>3 days</option>
              <option value={604800}>7 days</option>
            </select>
          </div>

          {/* Notification Recipients */}
          {!proposalUrl && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium">Notification Recipients (Optional)</p>
              
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={notifyTelegram}
                  onChange={(e) => setNotifyTelegram(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your chat ID from @userinfobot on Telegram
                </p>
              </div>
            </div>
          )}

          {/* Create Proposal Button */}
          {!proposalUrl && connected && (
            <button
              onClick={handleCreateProposal}
              disabled={creating || !validateFields()}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {creating ? 'Creating Proposal...' : 'Create Proposal & Generate URL'}
            </button>
          )}
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
