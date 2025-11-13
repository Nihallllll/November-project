import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface EmailNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function EmailNodeConfig({ node, onUpdate }: EmailNodeConfigProps) {
  const [credentialId, setCredentialId] = useState(node.data.credentialId || '');
  const [to, setTo] = useState(node.data.to || '');
  const [subject, setSubject] = useState(node.data.subject || '');
  const [body, setBody] = useState(node.data.body || '');
  const [html, setHtml] = useState(node.data.html || false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'demo-user';
      const allCreds = await credentialsApi.list(userId);
      const emailCreds = allCreds.filter(c => 
        ['gmail-oauth2', 'smtp', 'resend', 'sendgrid', 'postmark', 'microsoft-oauth2'].includes(c.type)
      );
      setCredentials(emailCreds);
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
      to,
      subject,
      body,
      html,
      userId: localStorage.getItem('user_id') || 'demo-user',
    });
  }, [credentialId, to, subject, body, html]);

  return (
    <div className="space-y-4">
      {/* Credential Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Provider Credential *
        </label>
        {loadingCreds ? (
          <div className="text-sm text-muted-foreground">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              No email credentials found. Please add one in Credential Manager.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: Gmail OAuth, SMTP, Resend, SendGrid, Postmark
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select email provider</option>
              {credentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.name} ({cred.type})
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

      {/* To Email */}
      <div>
        <label className="block text-sm font-medium mb-2">To *</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="user@example.com or {{input.email}}"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use comma-separated emails for multiple recipients
        </p>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-2">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject or {{input.title}}"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* HTML Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={html}
            onChange={(e) => setHtml(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Enable HTML</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1 ml-6">
          Send email as HTML instead of plain text
        </p>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Body *
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={html ? 
            "<h1>Hello!</h1>\n<p>Your data: {{input.data}}</p>" :
            "Hello!\n\nYour data: {{input.data}}"
          }
          rows={10}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
        <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Use <code className="bg-background px-1 py-0.5 rounded">{'{{input.fieldName}}'}</code> to insert data from previous nodes
          </p>
        </div>
      </div>
    </div>
  );
}
