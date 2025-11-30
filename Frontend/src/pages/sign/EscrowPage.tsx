import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, Loader2, 
  Package, DollarSign, Shield, User, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format, addDays, differenceInDays } from 'date-fns';
import { 
  markDeliveredTransaction, 
  buyerApproveTransaction, 
  raiseDisputeTransaction, 
  resolveDisputeTransaction, 
  autoReleaseTransaction,
  fetchEscrowAccount 
} from '../../utils/transactions/escrowTransactions';

interface EscrowAccount {
  id: string;
  buyer: string;
  seller: string;
  arbitrator: string | null;
  amount: string;
  description: string;
  disputeWindowDays: number;
  status: string;
  sellerDelivered: boolean;
  sellerDeliveredAt: string | null;
  buyerApproved: boolean;
  disputed: boolean;
  disputeRaisedAt: string | null;
  disputeReason: string | null;
  winner: string | null;
  decidedAt: string | null;
  createdAt: string;
  seed?: string;
  onChain?: boolean;
}

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

export default function EscrowPage() {
  const { id } = useParams<{ id: string }>();
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  
  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [onChainData, setOnChainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEscrow();
    }
  }, [id]);

  // Fetch on-chain data when wallet connects
  useEffect(() => {
    if (id && anchorWallet) {
      fetchOnChainData();
    }
  }, [id, anchorWallet]);

  const fetchEscrow = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/escrow/${id}`);
      setEscrow(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch escrow:', err);
      // Don't set error here - we'll check on-chain data too
    } finally {
      setLoading(false);
    }
  };

  const fetchOnChainData = async () => {
    if (!anchorWallet || !id) return;
    try {
      const data = await fetchEscrowAccount(id, anchorWallet);
      if (data) {
        console.log('On-chain escrow data:', data);
        setOnChainData(data);
        setError(null); // Clear error if we got on-chain data
      }
    } catch (err) {
      console.log('No on-chain data found (may be database-only escrow)');
    }
  };

  const handleMarkDelivered = async () => {
    if (!publicKey || !anchorWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    const dataSource = onChainData || escrow;
    if (!dataSource) {
      toast.error('Escrow data not available');
      return;
    }

    try {
      setSubmitting(true);
      
      // Always try on-chain
      toast.loading('Marking delivered on-chain...', { id: 'delivered' });
      
      const signature = await markDeliveredTransaction({
        wallet: anchorWallet,
        escrowPDA: id!,
        buyerPubkey: dataSource.buyer,
        seed: onChainData?.seed || escrow?.seed,
      });
      
      setTxSignature(signature);
      toast.success('Marked as delivered on-chain!', { id: 'delivered' });
      
      // Try to update database
      try {
        await axios.post(`${API_BASE_URL}/api/escrow/${id}/action`, {
          actor: publicKey.toString(),
          action: 'mark_delivered',
          txSignature: signature,
        });
      } catch (dbErr) {
        console.log('Database update skipped:', dbErr);
      }
      
      await fetchOnChainData();
      if (escrow) await fetchEscrow();
    } catch (err: any) {
      console.error('Failed to mark delivered:', err);
      if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected', { id: 'delivered' });
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to mark as delivered', { id: 'delivered' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!publicKey || !anchorWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    const dataSource = onChainData || escrow;
    if (!dataSource) {
      toast.error('Escrow data not available');
      return;
    }

    try {
      setSubmitting(true);
      
      // Always try on-chain
      toast.loading('Approving on-chain...', { id: 'approve' });
      
      const signature = await buyerApproveTransaction({
        wallet: anchorWallet,
        escrowPDA: id!,
        sellerPubkey: dataSource.seller,
      });
      
      setTxSignature(signature);
      toast.success('Approved! Funds released on-chain!', { id: 'approve' });
      
      // Try to update database
      try {
        await axios.post(`${API_BASE_URL}/api/escrow/${id}/action`, {
          actor: publicKey.toString(),
          action: 'buyer_approve',
          txSignature: signature,
        });
      } catch (dbErr) {
        console.log('Database update skipped:', dbErr);
      }
      
      await fetchOnChainData();
      if (escrow) await fetchEscrow();
    } catch (err: any) {
      console.error('Failed to approve:', err);
      if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected', { id: 'approve' });
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to approve', { id: 'approve' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (!publicKey || !anchorWallet) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!disputeReason.trim()) {
      toast.error('Please provide a dispute reason');
      return;
    }

    try {
      setSubmitting(true);
      
      // Always try on-chain
      toast.loading('Raising dispute on-chain...', { id: 'dispute' });
      
      const signature = await raiseDisputeTransaction({
        wallet: anchorWallet,
        escrowPDA: id!,
        reason: disputeReason,
      });
      
      setTxSignature(signature);
      toast.success('Dispute raised on-chain!', { id: 'dispute' });
      
      // Try to update database
      try {
        await axios.post(`${API_BASE_URL}/api/escrow/${id}/action`, {
          actor: publicKey.toString(),
          action: 'raise_dispute',
          reason: disputeReason,
          txSignature: signature,
        });
      } catch (dbErr) {
        console.log('Database update skipped:', dbErr);
      }
      
      await fetchOnChainData();
      if (escrow) await fetchEscrow();
      setDisputeReason('');
    } catch (err: any) {
      console.error('Failed to raise dispute:', err);
      if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected', { id: 'dispute' });
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to raise dispute', { id: 'dispute' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (buyerWins: boolean) => {
    if (!publicKey || !anchorWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    const dataSource = onChainData || escrow;
    if (!dataSource) {
      toast.error('Escrow data not available');
      return;
    }

    try {
      setSubmitting(true);
      
      // Always try on-chain
      toast.loading('Resolving dispute on-chain...', { id: 'resolve' });
      
      const winnerPubkey = buyerWins ? dataSource.buyer : dataSource.seller;
      
      const signature = await resolveDisputeTransaction({
        wallet: anchorWallet,
        escrowPDA: id!,
        winnerIsBuyer: buyerWins,
        winnerPubkey: winnerPubkey,
      });
      
      setTxSignature(signature);
      toast.success(`Resolved in favor of ${buyerWins ? 'buyer' : 'seller'}!`, { id: 'resolve' });
      
      // Try to update database
      try {
        await axios.post(`${API_BASE_URL}/api/escrow/${id}/action`, {
          actor: publicKey.toString(),
          action: 'resolve_dispute',
          winner: buyerWins ? 'buyer' : 'seller',
          txSignature: signature,
        });
      } catch (dbErr) {
        console.log('Database update skipped:', dbErr);
      }
      
      await fetchOnChainData();
      if (escrow) await fetchEscrow();
    } catch (err: any) {
      console.error('Failed to resolve:', err);
      if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected', { id: 'resolve' });
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to resolve dispute', { id: 'resolve' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoRelease = async () => {
    if (!anchorWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    const dataSource = onChainData || escrow;
    if (!dataSource) {
      toast.error('Escrow data not available');
      return;
    }

    try {
      setSubmitting(true);
      
      // Always try on-chain
      toast.loading('Auto-releasing on-chain...', { id: 'autorelease' });
      
      const signature = await autoReleaseTransaction({
        wallet: anchorWallet,
        escrowPDA: id!,
        sellerPubkey: dataSource.seller,
      });
      
      setTxSignature(signature);
      toast.success('Auto-released to seller on-chain!', { id: 'autorelease' });
      
      // Try to update database
      try {
        await axios.post(`${API_BASE_URL}/api/escrow/${id}/action`, {
          action: 'auto_release',
          txSignature: signature,
        });
      } catch (dbErr) {
        console.log('Database update skipped:', dbErr);
      }
      
      await fetchOnChainData();
      if (escrow) await fetchEscrow();
    } catch (err: any) {
      console.error('Failed to auto-release:', err);
      if (err.message?.includes('User rejected')) {
        toast.error('Transaction rejected', { id: 'autorelease' });
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to auto-release', { id: 'autorelease' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Wait for both loading to complete and check if we have any data
  if (loading && !onChainData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading escrow...</p>
        </div>
      </div>
    );
  }

  // Show error only if BOTH database and on-chain data are unavailable
  if (!escrow && !onChainData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="glass border border-destructive/50 rounded-lg p-6 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Escrow Not Found</h2>
            <p className="text-muted-foreground">
              {connected ? 'Invalid escrow ID or escrow does not exist' : 'Connect your wallet to load on-chain data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Use on-chain data as fallback
  const displayData = onChainData || escrow;
  const buyer = onChainData?.buyer || escrow?.buyer || '';
  const seller = onChainData?.seller || escrow?.seller || '';
  const arbitrator = onChainData?.arbitrator || escrow?.arbitrator || null;
  const amount = onChainData?.amount || escrow?.amount || '0';
  const description = onChainData?.description || escrow?.description || '';
  const status = onChainData?.status || escrow?.status || 'Created';
  const sellerDelivered = onChainData?.sellerDelivered || escrow?.sellerDelivered || false;
  const sellerDeliveredAt = escrow?.sellerDeliveredAt || null;
  const buyerApproved = onChainData?.buyerApproved || escrow?.buyerApproved || false;
  const disputed = onChainData?.disputed || escrow?.disputed || false;
  const disputeWindowDays = escrow?.disputeWindowDays || 7;

  const isBuyer = publicKey && buyer === publicKey.toString();
  const isSeller = publicKey && seller === publicKey.toString();
  const isArbitrator = publicKey && arbitrator === publicKey.toString();
  
  const disputeWindowEnd = sellerDeliveredAt 
    ? addDays(new Date(sellerDeliveredAt), disputeWindowDays)
    : null;
  const disputeWindowExpired = disputeWindowEnd && new Date() > disputeWindowEnd;
  const daysRemaining = disputeWindowEnd 
    ? Math.max(0, differenceInDays(disputeWindowEnd, new Date()))
    : null;

  const amountInSol = (Number(amount) / 1_000_000_000).toFixed(4);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Escrow Agreement</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isBuyer && 'You are the Buyer'}
              {isSeller && 'You are the Seller'}
              {isArbitrator && 'You are the Arbitrator'}
              {!isBuyer && !isSeller && !isArbitrator && 'View only'}
            </p>
          </div>
          <WalletMultiButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Status Banner */}
          {status === 'Resolved' && (
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-600 dark:text-green-400">Escrow Completed</p>
                <p className="text-sm text-muted-foreground">
                  Funds released to: {(escrow?.winner || onChainData?.winner)?.slice(0, 8)}...{(escrow?.winner || onChainData?.winner)?.slice(-6)}
                </p>
              </div>
            </div>
          )}

          {disputed && status !== 'Resolved' && (
            <div className="glass border border-yellow-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-400">Dispute Raised</p>
                <p className="text-sm text-muted-foreground">
                  Awaiting arbitrator resolution
                </p>
              </div>
            </div>
          )}

          {/* Escrow Details */}
          <div className="glass border border-border/50 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-foreground whitespace-pre-wrap">{description}</p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Amount</h3>
              </div>
              <p className="text-2xl font-bold">{amountInSol} SOL</p>
              <p className="text-sm text-muted-foreground">{amount} lamports</p>
            </div>
          </div>

          {/* Parties */}
          <div className="glass border border-border/50 rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-semibold mb-3">Parties</h2>
            
            <div className={`p-4 rounded-lg ${isBuyer ? 'bg-primary/10 border-2 border-primary' : 'bg-accent/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <p className="text-sm font-semibold">Buyer</p>
                {isBuyer && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">You</span>}
              </div>
              <code className="text-xs font-mono block break-all">{buyer}</code>
            </div>

            <div className={`p-4 rounded-lg ${isSeller ? 'bg-primary/10 border-2 border-primary' : 'bg-accent/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4" />
                <p className="text-sm font-semibold">Seller</p>
                {isSeller && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">You</span>}
              </div>
              <code className="text-xs font-mono block break-all">{seller}</code>
            </div>

            {arbitrator && (
              <div className={`p-4 rounded-lg ${isArbitrator ? 'bg-primary/10 border-2 border-primary' : 'bg-accent/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <p className="text-sm font-semibold">Arbitrator</p>
                  {isArbitrator && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">You</span>}
                </div>
                <code className="text-xs font-mono block break-all">{arbitrator}</code>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Escrow Created</p>
                  <p className="text-xs text-muted-foreground">{escrow?.createdAt ? format(new Date(escrow.createdAt), 'MMM dd, yyyy HH:mm') : 'On-chain'}</p>
                </div>
              </div>

              {/* Delivered */}
              {sellerDelivered && sellerDeliveredAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Seller Marked Delivered</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(sellerDeliveredAt), 'MMM dd, yyyy HH:mm')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dispute window: {disputeWindowDays} days 
                      {daysRemaining !== null && ` (${daysRemaining} days remaining)`}
                    </p>
                  </div>
                </div>
              )}

              {/* Disputed */}
              {disputed && escrow?.disputeRaisedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Dispute Raised</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(escrow.disputeRaisedAt), 'MMM dd, yyyy HH:mm')}</p>
                    {escrow.disputeReason && (
                      <p className="text-xs bg-yellow-500/10 p-2 rounded mt-2">{escrow.disputeReason}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolved */}
              {status === 'Resolved' && escrow?.decidedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Resolved</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(escrow.decidedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!connected ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to interact with escrow</p>
              <WalletMultiButton className="mx-auto" />
            </div>
          ) : status === 'Resolved' ? (
            <div className="glass border border-green-500/50 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-semibold">Escrow Completed</p>
            </div>
          ) : isSeller && status === 'Created' ? (
            <div className="glass border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Seller Action</h3>
              <button
                onClick={handleMarkDelivered}
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                Mark as Delivered
              </button>
            </div>
          ) : isBuyer && status === 'SellerDelivered' && !disputed ? (
            <div className="glass border border-border/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Buyer Action</h3>
              
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Approve & Release Funds
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why you're raising a dispute..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-2"
                />
                <button
                  onClick={handleDispute}
                  disabled={submitting || !disputeReason.trim() || !arbitrator}
                  className="w-full px-6 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
                  Raise Dispute
                </button>
                {!arbitrator && (
                  <p className="text-xs text-destructive mt-2 text-center">No arbitrator set - disputes cannot be raised</p>
                )}
              </div>
            </div>
          ) : isArbitrator && disputed ? (
            <div className="glass border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Arbitrator Resolution</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResolve(true)}
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Buyer Wins'}
                </button>
                <button
                  onClick={() => handleResolve(false)}
                  disabled={submitting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Seller Wins'}
                </button>
              </div>
            </div>
          ) : disputeWindowExpired && status === 'SellerDelivered' ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p className="font-semibold mb-2">Dispute Window Expired</p>
              <button
                onClick={handleAutoRelease}
                disabled={submitting}
                className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Auto-Release to Seller'}
              </button>
            </div>
          ) : (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">No action available for your role at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
