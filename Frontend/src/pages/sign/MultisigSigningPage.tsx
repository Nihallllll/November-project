import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CheckCircle2, XCircle, Clock, Users, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

interface MultisigProposal {
  id: string;
  creator: string;
  owners: string[];
  threshold: number;
  description: string;
  status: string;
  approvals: string[];
  rejections: string[];
  executed: boolean;
  expiresAt: string;
  createdAt: string;
}

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

export default function MultisigSigningPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const signerParam = searchParams.get('signer');
  
  const { publicKey, connected } = useWallet();
  const [proposal, setProposal] = useState<MultisigProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/multisig/${id}`);
      setProposal(response.data);
    } catch (err: any) {
      console.error('Failed to fetch proposal:', err);
      setError(err.response?.data?.message || 'Failed to load proposal');
      toast.error('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!publicKey || !proposal) return;

    if (!proposal.owners.includes(publicKey.toString())) {
      toast.error('You are not an owner of this proposal');
      return;
    }

    if (proposal.approvals.includes(publicKey.toString())) {
      toast.error('You have already approved this proposal');
      return;
    }

    if (proposal.rejections.includes(publicKey.toString())) {
      toast.error('You have already rejected this proposal');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.post(`${API_BASE_URL}/api/multisig/${id}/approve`, {
        signer: publicKey.toString(),
      });

      toast.success('Proposal approved successfully!');
      
      // Refresh proposal data
      await fetchProposal();
      
      if (response.data.thresholdMet) {
        toast.success('🎉 Threshold reached! Proposal executed.');
      }
    } catch (err: any) {
      console.error('Failed to approve:', err);
      toast.error(err.response?.data?.message || 'Failed to approve proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!publicKey || !proposal) return;

    if (!proposal.owners.includes(publicKey.toString())) {
      toast.error('You are not an owner of this proposal');
      return;
    }

    if (proposal.rejections.includes(publicKey.toString())) {
      toast.error('You have already rejected this proposal');
      return;
    }

    if (proposal.approvals.includes(publicKey.toString())) {
      toast.error('You have already approved this proposal');
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post(`${API_BASE_URL}/api/multisig/${id}/reject`, {
        signer: publicKey.toString(),
      });

      toast.success('Proposal rejected');
      
      // Refresh proposal data
      await fetchProposal();
    } catch (err: any) {
      console.error('Failed to reject:', err);
      toast.error(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = proposal && new Date(proposal.expiresAt) < new Date();
  const canVote = connected && publicKey && proposal?.owners.includes(publicKey.toString());
  const hasVoted = publicKey && (
    proposal?.approvals.includes(publicKey.toString()) ||
    proposal?.rejections.includes(publicKey.toString())
  );
  const userApproval = publicKey && proposal?.approvals.includes(publicKey.toString());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="glass border border-destructive/50 rounded-lg p-6 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold mb-2">Proposal Not Found</h2>
            <p className="text-muted-foreground">{error || 'Invalid proposal ID'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Multisig Proposal</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and sign the proposal</p>
          </div>
          <WalletMultiButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Status Banner */}
          {proposal.executed && (
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">Proposal Executed</p>
                <p className="text-sm text-muted-foreground">This proposal has reached threshold and been executed</p>
              </div>
            </div>
          )}

          {isExpired && !proposal.executed && (
            <div className="glass border border-yellow-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-400">Proposal Expired</p>
                <p className="text-sm text-muted-foreground">This proposal has expired and can no longer be signed</p>
              </div>
            </div>
          )}

          {/* Proposal Details */}
          <div className="glass border border-border/50 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-foreground whitespace-pre-wrap">{proposal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Threshold</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{proposal.threshold} of {proposal.owners.length}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expires</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{format(new Date(proposal.expiresAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Proposal Address</p>
              <code className="text-xs bg-accent/30 px-3 py-2 rounded block font-mono break-all">
                {proposal.id}
              </code>
            </div>
          </div>

          {/* Owners */}
          <div className="glass border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Owners ({proposal.owners.length})</h2>
            <div className="space-y-2">
              {proposal.owners.map((owner, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <code className="text-sm font-mono flex-1 mr-4 truncate">{owner}</code>
                  {proposal.approvals.includes(owner) && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Approved
                    </span>
                  )}
                  {proposal.rejections.includes(owner) && (
                    <span className="flex items-center gap-1 text-destructive text-sm">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}
                  {!proposal.approvals.includes(owner) && !proposal.rejections.includes(owner) && (
                    <span className="text-muted-foreground text-sm">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="glass border border-border/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Approval Progress</h2>
              <span className="text-sm font-semibold">
                {proposal.approvals.length} / {proposal.threshold}
              </span>
            </div>
            <div className="w-full bg-accent/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500"
                style={{ width: `${Math.min((proposal.approvals.length / proposal.threshold) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {proposal.threshold - proposal.approvals.length > 0
                ? `${proposal.threshold - proposal.approvals.length} more approval(s) needed`
                : 'Threshold reached!'}
            </p>
          </div>

          {/* Voting Actions */}
          {!connected ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to sign this proposal</p>
              <WalletMultiButton className="mx-auto" />
            </div>
          ) : !canVote ? (
            <div className="glass border border-destructive/50 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
              <p className="font-semibold mb-2">Unauthorized</p>
              <p className="text-sm text-muted-foreground">
                Your wallet ({publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-6)}) is not an owner of this proposal
              </p>
              {signerParam && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expected: {signerParam.slice(0, 8)}...{signerParam.slice(-6)}
                </p>
              )}
            </div>
          ) : hasVoted ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              {userApproval ? (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-semibold mb-2">You Approved This Proposal</p>
                  <p className="text-sm text-muted-foreground">Thank you for your signature</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
                  <p className="font-semibold mb-2">You Rejected This Proposal</p>
                  <p className="text-sm text-muted-foreground">Your rejection has been recorded</p>
                </>
              )}
            </div>
          ) : isExpired || proposal.executed ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-2">
                {isExpired ? 'Proposal Expired' : 'Proposal Already Executed'}
              </p>
              <p className="text-sm text-muted-foreground">No further action can be taken</p>
            </div>
          ) : (
            <div className="glass border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Your Action</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-6 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
