import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface VotingNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function VotingNodeConfig({ node, onUpdate }: VotingNodeConfigProps) {
  const [action, setAction] = useState(node.data.action || 'create');
  const [title, setTitle] = useState(node.data.title || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [choices, setChoices] = useState<string[]>(node.data.choices || ['', '']);
  const [allowedVoters, setAllowedVoters] = useState<string[]>(node.data.allowedVoters || []);
  const [isPublic, setIsPublic] = useState(node.data.isPublic ?? true);
  const [expiresIn, setExpiresIn] = useState(node.data.expiresIn || 86400); // Default 24 hours
  
  // For other actions
  const [votingAddress, setVotingAddress] = useState(node.data.votingAddress || '');
  const [choiceIndex, setChoiceIndex] = useState(node.data.choiceIndex || 0);
  
  // Threshold notification settings
  const [notifyOnFinalize, setNotifyOnFinalize] = useState(node.data.notifyOnFinalize || false);
  const [notificationMessage, setNotificationMessage] = useState(
    node.data.notificationMessage || 'Voting {{title}} has been finalized! Winner: {{winnerChoice}}'
  );

  useEffect(() => {
    onUpdate({
      ...node.data,
      action,
      title: action === 'create' ? title : undefined,
      description: action === 'create' ? description : undefined,
      choices: action === 'create' ? choices.filter(c => c.trim()) : undefined,
      allowedVoters: action === 'create' && !isPublic ? allowedVoters.filter(v => v.trim()) : undefined,
      isPublic: action === 'create' ? isPublic : undefined,
      expiresIn: action === 'create' ? expiresIn : undefined,
      votingAddress: action !== 'create' ? votingAddress : undefined,
      choiceIndex: action === 'cast_vote' ? choiceIndex : undefined,
      notifyOnFinalize,
      notificationMessage,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [action, title, description, choices, allowedVoters, isPublic, expiresIn, votingAddress, choiceIndex, notifyOnFinalize, notificationMessage]);

  const addChoice = () => {
    if (choices.length >= 10) {
      toast.error('Maximum 10 choices allowed');
      return;
    }
    setChoices([...choices, '']);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) {
      toast.error('At least 2 choices required');
      return;
    }
    setChoices(choices.filter((_, i) => i !== index));
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value.slice(0, 64);
    setChoices(newChoices);
  };

  const addVoter = () => {
    setAllowedVoters([...allowedVoters, '']);
  };

  const removeVoter = (index: number) => {
    setAllowedVoters(allowedVoters.filter((_, i) => i !== index));
  };

  const updateVoter = (index: number, value: string) => {
    const newVoters = [...allowedVoters];
    newVoters[index] = value;
    setAllowedVoters(newVoters);
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
          <option value="create">Create New Voting</option>
          <option value="cast_vote">Cast Vote</option>
          <option value="finalize">Finalize Voting</option>
          <option value="check_results">Check Results</option>
        </select>
      </div>

      {action === 'create' ? (
        <>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Voting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Choose next feature to build"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and details about this vote..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Choices */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Voting Choices *
              <span className="text-xs text-muted-foreground ml-2">(2-10 choices, max 64 chars each)</span>
            </label>
            <div className="space-y-2">
              {choices.map((choice, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    placeholder={`Choice ${index + 1}`}
                    maxLength={64}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {choices.length > 2 && (
                    <button
                      onClick={() => removeChoice(index)}
                      className="p-2 border border-border rounded-lg hover:bg-destructive/10 hover:border-destructive transition-colors"
                      title="Remove choice"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              {choices.length < 10 && (
                <button
                  onClick={addChoice}
                  className="w-full px-3 py-2 border border-dashed border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Choice
                </button>
              )}
            </div>
          </div>

          {/* Public vs Restricted */}
          <div>
            <label className="block text-sm font-medium mb-2">Voter Access</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium">Public Voting</p>
                  <p className="text-xs text-muted-foreground">Anyone with the link can vote</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium">Restricted Voting</p>
                  <p className="text-xs text-muted-foreground">Only whitelisted addresses can vote</p>
                </div>
              </label>
            </div>
          </div>

          {/* Allowed Voters (if restricted) */}
          {!isPublic && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Allowed Voters (Solana Public Keys)
              </label>
              <div className="space-y-2">
                {allowedVoters.map((voter, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={voter}
                      onChange={(e) => updateVoter(index, e.target.value)}
                      placeholder="e.g., 8FqG8...9kL2x"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                    <button
                      onClick={() => removeVoter(index)}
                      className="p-2 border border-border rounded-lg hover:bg-destructive/10 hover:border-destructive transition-colors"
                      title="Remove voter"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addVoter}
                  className="w-full px-3 py-2 border border-dashed border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Voter
                </button>
              </div>
            </div>
          )}

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Voting Duration *
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
              <option value={2592000}>30 days</option>
            </select>
          </div>
        </>
      ) : (
        <>
          {/* Voting Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Voting Proposal Address *
            </label>
            <input
              type="text"
              value={votingAddress}
              onChange={(e) => setVotingAddress(e.target.value)}
              placeholder="PDA address of the voting proposal"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{{input.votingAddress}}'} from previous node
            </p>
          </div>

          {/* Choice Index (for cast_vote) */}
          {action === 'cast_vote' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Choice Index (0-based) *
              </label>
              <input
                type="number"
                min={0}
                value={choiceIndex}
                onChange={(e) => setChoiceIndex(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = first choice, 1 = second choice, etc.
              </p>
            </div>
          )}
        </>
      )}

      {/* Finalize Notification Settings */}
      {(action === 'create' || action === 'finalize') && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="notifyOnFinalize"
              checked={notifyOnFinalize}
              onChange={(e) => setNotifyOnFinalize(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="notifyOnFinalize" className="text-sm font-medium">
              Notify when voting finalized
            </label>
          </div>

          {notifyOnFinalize && (
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
                  <code className="bg-background px-1 py-0.5 rounded">{'{{title}}'}</code>,{' '}
                  <code className="bg-background px-1 py-0.5 rounded">{'{{winnerChoice}}'}</code>,{' '}
                  <code className="bg-background px-1 py-0.5 rounded">{'{{votingAddress}}'}</code>
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
          {action === 'create' ? '🗳️ Voting Setup' : '📊 Voting Action'}
        </p>
        <p className="text-xs text-muted-foreground">
          {action === 'create' && 'Creates a new voting proposal. Voters will receive a link to cast their vote.'}
          {action === 'cast_vote' && 'Casts a vote for a specific choice. Requires voter to be eligible.'}
          {action === 'finalize' && 'Finalizes voting and determines the winner. Can be called by creator or automatically after expiry.'}
          {action === 'check_results' && 'Retrieves current voting results including vote counts and percentages.'}
        </p>
      </div>
    </div>
  );
}
