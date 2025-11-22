import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { AlertCircle, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import api from '../../../api/client';

interface EscrowNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function EscrowNodeConfig({ node, onUpdate }: EscrowNodeConfigProps) {
  const { publicKey, connected } = useWallet();
  
  const [action, setAction] = useState(node.data.action || 'create');
  
  // For create action
  const [buyer, setBuyer] = useState(node.data.buyer || '');
  const [seller, setSeller] = useState(node.data.seller || '');
  const [arbitrator, setArbitrator] = useState(node.data.arbitrator || '');
  const [amount, setAmount] = useState(node.data.amount || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [disputeWindowDays, setDisputeWindowDays] = useState(node.data.disputeWindowDays || 7);
  
  // For other actions
  const [escrowAddress, setEscrowAddress] = useState(node.data.escrowAddress || '');
  const [disputeReason, setDisputeReason] = useState(node.data.disputeReason || '');
  const [winnerIsBuyer, setWinnerIsBuyer] = useState(node.data.winnerIsBuyer ?? true);
  
  // Threshold notification settings
  const [notifyOnMilestone, setNotifyOnMilestone] = useState(node.data.notifyOnMilestone || false);
  const [milestoneEvents, setMilestoneEvents] = useState<string[]>(
    node.data.milestoneEvents || ['funded', 'delivered', 'disputed', 'resolved']
  );
  const [notificationMessage, setNotificationMessage] = useState(
    node.data.notificationMessage || 'Escrow {{escrowAddress}} status: {{status}}'
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
      buyer: action === 'create' ? buyer : undefined,
      seller: action === 'create' ? seller : undefined,
      arbitrator: action === 'create' && arbitrator ? arbitrator : undefined,
      amount: action === 'create' ? amount : undefined,
      description: action === 'create' ? description : undefined,
      disputeWindowDays: action === 'create' ? disputeWindowDays : undefined,
      escrowAddress: action !== 'create' ? escrowAddress : undefined,
      disputeReason: action === 'dispute' ? disputeReason : undefined,
      winnerIsBuyer: action === 'resolve' ? winnerIsBuyer : undefined,
      notifyOnMilestone,
      milestoneEvents,
      notificationMessage,
      proposalUrl,
      proposalId,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [action, buyer, seller, arbitrator, amount, description, disputeWindowDays, escrowAddress, disputeReason, winnerIsBuyer, notifyOnMilestone, milestoneEvents, notificationMessage, proposalUrl, proposalId]);

  const toggleMilestone = (event: string) => {
    if (milestoneEvents.includes(event)) {
      setMilestoneEvents(milestoneEvents.filter(e => e !== event));
    } else {
      setMilestoneEvents([...milestoneEvents, event]);
    }
  };

  const validateFields = (): boolean => {
    if (!buyer.trim()) {
      toast.error('Buyer address is required');
      return false;
    }
    if (!seller.trim()) {
      toast.error('Seller address is required');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Valid amount is required');
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
      const response = await api.post('/proposals/escrow', {
        flowId: node.id,
        buyer,
        seller,
        arbitrator: arbitrator.trim() || undefined,
        amount: parseFloat(amount),
        description,
        disputeWindowDays,
        notifyEmail: notifyEmail.trim() || undefined,
        notifyTelegram: notifyTelegram.trim() || undefined,
      });

      const { proposal } = response.data;
      setProposalUrl(proposal.escrowUrl);
      setProposalId(proposal.id);
      
      toast.success('Escrow account created successfully!');
      if (notifyEmail.trim() || notifyTelegram.trim()) {
        toast.info('Notifications sent to recipients');
      }
    } catch (error: any) {
      console.error('Failed to create escrow:', error);
      toast.error(error.response?.data?.error || 'Failed to create escrow');
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

  return (
    <div className="space-y-4">
      {/* Action Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Action *</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          disabled={!!proposalUrl}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="create">Create New Escrow</option>
          <option value="mark_delivered">Mark as Delivered (Seller)</option>
          <option value="approve">Approve & Release Funds (Buyer)</option>
          <option value="dispute">Raise Dispute</option>
          <option value="resolve">Resolve Dispute (Arbitrator)</option>
          <option value="auto_release">Auto Release (After Window)</option>
          <option value="check_status">Check Status</option>
        </select>
      </div>

      {action === 'create' ? (
        <>
          {/* Wallet Connection */}
          {!proposalUrl && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                Connect Wallet to Create Escrow
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
                  Escrow Created Successfully!
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-2 text-muted-foreground">
                  Escrow URL (Share with parties)
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
                💡 Share this URL with buyer, seller, and arbitrator. They can track and interact with the escrow.
              </p>
            </div>
          )}

          {/* Buyer */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Buyer Public Key *
              <span className="text-xs text-muted-foreground ml-2">(Who pays)</span>
            </label>
            <input
              type="text"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="e.g., 8FqG8...9kL2x"
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-50"
            />
            {buyer === seller && buyer && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Buyer and seller cannot be the same
              </p>
            )}
          </div>

          {/* Seller */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Seller Public Key *
              <span className="text-xs text-muted-foreground ml-2">(Who delivers)</span>
            </label>
            <input
              type="text"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              placeholder="e.g., 9kL2x...8FqG8"
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-50"
            />
          </div>

          {/* Arbitrator (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Arbitrator Public Key
              <span className="text-xs text-muted-foreground ml-2">(Optional - resolves disputes)</span>
            </label>
            <input
              type="text"
              value={arbitrator}
              onChange={(e) => setArbitrator(e.target.value)}
              placeholder="e.g., 5xH3k...7LmN2 (leave empty if not needed)"
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-50"
            />
            {!arbitrator && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ⚠️ Without arbitrator, disputes cannot be resolved
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (in lamports) *
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 1000000000 (1 SOL = 1,000,000,000 lamports)"
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm disabled:opacity-50"
            />
            {amount && !isNaN(Number(amount)) && (
              <p className="text-xs text-muted-foreground mt-1">
                = {(Number(amount) / 1_000_000_000).toFixed(4)} SOL
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
              <span className="text-xs text-muted-foreground ml-2">(max 200 chars)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="What is being purchased/delivered..."
              rows={3}
              maxLength={200}
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/200 characters
            </p>
          </div>

          {/* Dispute Window */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dispute Window (days) *
              <span className="text-xs text-muted-foreground ml-2">(1-30 days)</span>
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={disputeWindowDays}
              onChange={(e) => setDisputeWindowDays(Number(e.target.value))}
              disabled={!!proposalUrl}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              After seller marks delivered, buyer has {disputeWindowDays} days to approve or dispute.
              If no action, funds auto-release to seller.
            </p>
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
                  placeholder="buyer@example.com"
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

          {/* Create Escrow Button */}
          {!proposalUrl && connected && (
            <button
              onClick={handleCreateProposal}
              disabled={creating || !validateFields()}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {creating ? 'Creating Escrow...' : 'Create Escrow & Generate URL'}
            </button>
          )}
        </>
      ) : (
        <>
          {/* Escrow Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Escrow Account Address *
            </label>
            <input
              type="text"
              value={escrowAddress}
              onChange={(e) => setEscrowAddress(e.target.value)}
              placeholder="PDA address of the escrow account"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{{input.escrowAddress}}'} from previous node
            </p>
          </div>

          {/* Dispute Reason (for dispute action) */}
          {action === 'dispute' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Dispute Reason *
                <span className="text-xs text-muted-foreground ml-2">(max 500 chars)</span>
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value.slice(0, 500))}
                placeholder="Explain why you're raising a dispute..."
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {disputeReason.length}/500 characters
              </p>
            </div>
          )}

          {/* Winner Selection (for resolve action) */}
          {action === 'resolve' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Resolve in Favor of *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <input
                    type="radio"
                    checked={winnerIsBuyer}
                    onChange={() => setWinnerIsBuyer(true)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Buyer Wins</p>
                    <p className="text-xs text-muted-foreground">Refund to buyer</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <input
                    type="radio"
                    checked={!winnerIsBuyer}
                    onChange={() => setWinnerIsBuyer(false)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Seller Wins</p>
                    <p className="text-xs text-muted-foreground">Release to seller</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </>
      )}

      {/* Milestone Notification Settings */}
      {action === 'create' && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="notifyOnMilestone"
              checked={notifyOnMilestone}
              onChange={(e) => setNotifyOnMilestone(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="notifyOnMilestone" className="text-sm font-medium">
              Notify on escrow milestones
            </label>
          </div>

          {notifyOnMilestone && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">
                  Notify on these events:
                </label>
                <div className="space-y-2">
                  {['funded', 'delivered', 'disputed', 'resolved'].map((event) => (
                    <label key={event} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={milestoneEvents.includes(event)}
                        onChange={() => toggleMilestone(event)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="capitalize">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                    <code className="bg-background px-1 py-0.5 rounded">{'{{escrowAddress}}'}</code>,{' '}
                    <code className="bg-background px-1 py-0.5 rounded">{'{{status}}'}</code>,{' '}
                    <code className="bg-background px-1 py-0.5 rounded">{'{{amount}}'}</code>,{' '}
                    <code className="bg-background px-1 py-0.5 rounded">{'{{winner}}'}</code>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Connect a notification node (Telegram/Email) to receive alerts
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm space-y-2">
        <p className="font-medium text-blue-600 dark:text-blue-400">
          {action === 'create' ? '💰 Escrow Setup' : '🔒 Escrow Action'}
        </p>
        <p className="text-xs text-muted-foreground">
          {action === 'create' && 'Creates a trustless escrow. Buyer funds escrow → Seller delivers → Buyer approves or disputes → Funds released.'}
          {action === 'mark_delivered' && 'Seller marks item/service as delivered. Starts buyer dispute window.'}
          {action === 'approve' && 'Buyer approves delivery. Funds released to seller immediately.'}
          {action === 'dispute' && 'Buyer or seller raises dispute. Requires arbitrator to resolve.'}
          {action === 'resolve' && 'Arbitrator decides winner and releases funds accordingly.'}
          {action === 'auto_release' && 'Auto-releases to seller after dispute window expires without buyer action.'}
          {action === 'check_status' && 'Retrieves current escrow status and details.'}
        </p>
      </div>

      {/* Role-Based Access Info */}
      {action !== 'create' && action !== 'check_status' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs">
          <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">
            🔐 Role-Based Access:
          </p>
          <p className="text-muted-foreground">
            {action === 'mark_delivered' && 'Only SELLER can mark as delivered'}
            {action === 'approve' && 'Only BUYER can approve and release funds'}
            {action === 'dispute' && 'Either BUYER or SELLER can raise dispute'}
            {action === 'resolve' && 'Only ARBITRATOR can resolve dispute'}
            {action === 'auto_release' && 'Anyone can trigger after window expires'}
          </p>
        </div>
      )}
    </div>
  );
}
