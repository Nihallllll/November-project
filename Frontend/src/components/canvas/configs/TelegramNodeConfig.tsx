import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface TelegramNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function TelegramNodeConfig({ node, onUpdate }: TelegramNodeConfigProps) {
  const [credentialId, setCredentialId] = useState(node.data.credentialId || '');
  const [message, setMessage] = useState(node.data.message || '');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'demo-user';
      const allCreds = await credentialsApi.list(userId);
      const telegramCreds = allCreds.filter(c => c.type === 'telegram');
      setCredentials(telegramCreds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    onUpdate({
      ...node.data,
      credentialId,
      message,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [credentialId, message]);

  return (
    <div className="space-y-4">
      {/* Credential Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Telegram Bot Credential *
        </label>
        {loadingCreds ? (
          <div className="text-sm text-muted-foreground">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              No Telegram credentials found. Please add one in Credential Manager.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Required: Bot Token and Chat ID
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Telegram bot</option>
              {credentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.name}
                </option>
              ))}
            </select>
            <button
              onClick={loadCredentials}
              className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              title="Refresh credentials"
            >
              ↻
            </button>
          </div>
        )}
      </div>

      {/* Message Template */}
      <div>
        <label className="block text-sm font-medium mb-2">Message Template *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message here...&#10;&#10;Use {{input.fieldName}} to insert data from previous nodes"
          rows={8}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
        <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Template Variables:
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><code className="bg-background px-1 py-0.5 rounded">{'{{input.price}}'}</code> - From Pyth Price node</p>
            <p><code className="bg-background px-1 py-0.5 rounded">{'{{input.coinId}}'}</code> - From Pyth Price node</p>
            <p><code className="bg-background px-1 py-0.5 rounded">{'{{input.response}}'}</code> - From AI node</p>
            <p><code className="bg-background px-1 py-0.5 rounded">{'{{input.status}}'}</code> - From AI node</p>
            <p className="text-xs italic mt-1">Use nested paths like {'{{input.data.field}}'} for complex data</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {message && (
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div className="p-3 bg-accent/30 rounded-lg border border-border/50">
            <pre className="text-sm whitespace-pre-wrap break-words">
              {message}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
