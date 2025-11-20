import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

interface VotingProposal {
  id: string;
  creator: string;
  title: string;
  description: string;
  choices: string[];
  voteCounts: number[];
  allowedVoters: string[] | null;
  voters: string[];
  finalized: boolean;
  winnerIndex: number | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

export default function VotingPage() {
  const { id } = useParams<{ id: string }>();
  const { publicKey, connected } = useWallet();
  
  const [proposal, setProposal] = useState<VotingProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
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
      const response = await axios.get(`${API_BASE_URL}/api/voting/${id}`);
      setProposal(response.data);
    } catch (err: any) {
      console.error('Failed to fetch proposal:', err);
      setError(err.response?.data?.message || 'Failed to load voting proposal');
      toast.error('Failed to load voting proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!publicKey || !proposal || selectedChoice === null) return;

    // Check if user is allowed to vote
    if (proposal.allowedVoters && !proposal.allowedVoters.includes(publicKey.toString())) {
      toast.error('You are not eligible to vote in this proposal');
      return;
    }

    if (proposal.voters.includes(publicKey.toString())) {
      toast.error('You have already voted');
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post(`${API_BASE_URL}/api/voting/${id}/vote`, {
        voter: publicKey.toString(),
        choiceIndex: selectedChoice,
      });

      toast.success('Vote cast successfully!');
      
      // Refresh proposal data
      await fetchProposal();
      setSelectedChoice(null);
    } catch (err: any) {
      console.error('Failed to vote:', err);
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = proposal && new Date(proposal.expiresAt) < new Date();
  const isRestricted = proposal?.allowedVoters && proposal.allowedVoters.length > 0;
  const canVote = connected && publicKey && (
    !isRestricted || proposal.allowedVoters!.includes(publicKey.toString())
  );
  const hasVoted = publicKey && proposal?.voters.includes(publicKey.toString());
  
  const totalVotes = proposal?.voteCounts.reduce((sum, count) => sum + count, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading voting...</p>
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
            <h2 className="text-xl font-bold mb-2">Voting Not Found</h2>
            <p className="text-muted-foreground">{error || 'Invalid voting ID'}</p>
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
            <h1 className="text-2xl font-bold text-gradient">{proposal.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Cast your vote</p>
          </div>
          <WalletMultiButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Status Banner */}
          {proposal.finalized && (
            <div className="glass border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-600 dark:text-green-400">Voting Finalized</p>
                <p className="text-sm text-muted-foreground">
                  Winner: {proposal.winnerIndex !== null ? proposal.choices[proposal.winnerIndex] : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {isExpired && !proposal.finalized && (
            <div className="glass border border-yellow-500/50 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-400">Voting Expired</p>
                <p className="text-sm text-muted-foreground">This voting period has ended</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="glass border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-foreground whitespace-pre-wrap">{proposal.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{totalVotes}</span>
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

            {isRestricted && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  This is a restricted vote - only whitelisted addresses can participate
                </p>
              </div>
            )}
          </div>

          {/* Voting Choices */}
          <div className="glass border border-border/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Choices</h2>
            <div className="space-y-3">
              {proposal.choices.map((choice, idx) => {
                const voteCount = proposal.voteCounts[idx];
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                const isWinner = proposal.finalized && proposal.winnerIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => !hasVoted && !proposal.finalized && !isExpired && setSelectedChoice(idx)}
                    className={`
                      relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer
                      ${selectedChoice === idx 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 bg-accent/30'
                      }
                      ${isWinner ? 'border-green-500 bg-green-500/10' : ''}
                      ${(hasVoted || proposal.finalized || isExpired) ? 'cursor-default' : ''}
                    `}
                  >
                    {/* Background progress bar */}
                    <div
                      className="absolute inset-0 bg-primary/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Content */}
                    <div className="relative p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{choice}</span>
                          {isWinner && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">
                              Winner
                            </span>
                          )}
                        </div>
                        {totalVotes > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {voteCount} votes ({percentage.toFixed(1)}%)
                          </p>
                        )}
                      </div>

                      {selectedChoice === idx && (
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voting Action */}
          {!connected ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to vote</p>
              <WalletMultiButton className="mx-auto" />
            </div>
          ) : !canVote ? (
            <div className="glass border border-destructive/50 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
              <p className="font-semibold mb-2">Not Eligible</p>
              <p className="text-sm text-muted-foreground">
                Your wallet ({publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-6)}) is not whitelisted for this vote
              </p>
            </div>
          ) : hasVoted ? (
            <div className="glass border border-green-500/50 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-semibold mb-2">Vote Recorded</p>
              <p className="text-sm text-muted-foreground">Thank you for participating!</p>
            </div>
          ) : isExpired || proposal.finalized ? (
            <div className="glass border border-border/50 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-2">
                {isExpired ? 'Voting Expired' : 'Voting Finalized'}
              </p>
              <p className="text-sm text-muted-foreground">No further votes can be cast</p>
            </div>
          ) : (
            <div className="glass border border-border/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Cast Your Vote</h3>
              {selectedChoice === null ? (
                <p className="text-muted-foreground text-center py-4">
                  Select a choice above to continue
                </p>
              ) : (
                <button
                  onClick={handleVote}
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Casting Vote...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Vote: {proposal.choices[selectedChoice]}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
