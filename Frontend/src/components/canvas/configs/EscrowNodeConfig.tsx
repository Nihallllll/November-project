import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { AlertCircle } from 'lucide-react';

interface EscrowNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function EscrowNodeConfig({ node, onUpdate }: EscrowNodeConfigProps) {
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
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [action, buyer, seller, arbitrator, amount, description, disputeWindowDays, escrowAddress, disputeReason, winnerIsBuyer, notifyOnMilestone, milestoneEvents, notificationMessage]);

  const toggleMilestone = (event: string) => {
    if (milestoneEvents.includes(event)) {
      setMilestoneEvents(milestoneEvents.filter(e => e !== event));
    } else {
      setMilestoneEvents([...milestoneEvents, event]);
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
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              After seller marks delivered, buyer has {disputeWindowDays} days to approve or dispute.
              If no action, funds auto-release to seller.
            </p>
          </div>
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
