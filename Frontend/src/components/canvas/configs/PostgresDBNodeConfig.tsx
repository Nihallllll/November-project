import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface PostgresDBNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function PostgresDBNodeConfig({ node, onUpdate }: PostgresDBNodeConfigProps) {
  const [credentialId, setCredentialId] = useState(node.data.credentialId || '');
  const [mode, setMode] = useState(node.data.mode || 'READ');
  const [action, setAction] = useState(node.data.action || 'query');
  const [query, setQuery] = useState(node.data.query || '');
  const [table, setTable] = useState(node.data.table || '');
  const [operation, setOperation] = useState(node.data.operation || 'INSERT');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'demo-user';
      const allCreds = await credentialsApi.list(userId);
      const dbCreds = allCreds.filter(c => c.type === 'postgres_db');
      setCredentials(dbCreds);
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
      mode,
      action,
      query,
      table,
      operation,
    });
  }, [credentialId, mode, action, query, table, operation]);

  return (
    <div className="space-y-4">
      {/* Credential Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          PostgreSQL Database *
        </label>
        {loadingCreds ? (
          <div className="text-sm text-muted-foreground">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              No database credentials found. Please add one in Credential Manager.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Required: PostgreSQL connection URL
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select database</option>
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

      {/* Mode & Action */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="READ">Read Only</option>
            <option value="WRITE">Write Only</option>
            <option value="BOTH">Read & Write</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="introspect">Introspect Schema</option>
            <option value="query">Execute Query</option>
            <option value="write">Write Operation</option>
          </select>
        </div>
      </div>

      {/* Query Action */}
      {action === 'query' && (
        <div>
          <label className="block text-sm font-medium mb-2">SQL Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM users WHERE email = $1"
            rows={6}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use $1, $2, etc. for parameterized queries
          </p>
        </div>
      )}

      {/* Write Action */}
      {action === 'write' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Table Name</label>
            <input
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="users"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="INSERT">Insert</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </>
      )}

      {/* Help */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Introspect:</strong> Get database schema (tables, columns)
          <br />
          <strong>Query:</strong> Read data from database
          <br />
          <strong>Write:</strong> Insert, update, or delete data
        </p>
      </div>
    </div>
  );
}
