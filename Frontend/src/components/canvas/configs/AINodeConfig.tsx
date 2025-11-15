import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { credentialsApi, type Credential } from '../../../api/credentials';
import { toast } from 'sonner';

interface AINodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function AINodeConfig({ node, onUpdate }: AINodeConfigProps) {
  const [credentialId, setCredentialId] = useState(node.data.credentialId || '');
  const [provider, setProvider] = useState(node.data.provider || 'openai');
  const [modelName, setModelName] = useState(node.data.modelName || 'gpt-4');
  const [systemPrompt, setSystemPrompt] = useState(node.data.systemPrompt || '');
  const [userGoal, setUserGoal] = useState(node.data.userGoal || '');
  const [temperature, setTemperature] = useState(node.data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(node.data.maxTokens || 2048);
  const [useUserDBForMemory, setUseUserDBForMemory] = useState(node.data.useUserDBForMemory || false);
  const [memoryTableName, setMemoryTableName] = useState(node.data.memoryTableName || '');
  const [memoryDBCredentialId, setMemoryDBCredentialId] = useState(node.data.memoryDBCredentialId || '');
  
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [dbCredentials, setDbCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'demo-user';
      const allCreds = await credentialsApi.list(userId);
      
      // Filter AI credentials (Only OpenAI and Google Gemini)
      const aiCreds = allCreds.filter(c => 
        ['openai', 'google', 'gemini'].includes(c.type)
      );
      setCredentials(aiCreds);
      
      // Filter database credentials
      const dbCreds = allCreds.filter(c => c.type === 'postgres_db');
      setDbCredentials(dbCreds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoadingCreds(false);
    }
  };

  // Latest models as of November 2024
  const models = {
    openai: [
      'gpt-5.1',             // Latest reasoning model
      'gpt-5-mini',          // Fast GPT-5
      'gpt-5-nano',          // Fastest GPT-5
      'o3',                  // Advanced reasoning
      'o4-mini',             // Fast reasoning
      'gpt-4.1',             // Smartest non-reasoning
      'gpt-4o',              // Previous generation
      'gpt-4o-mini',         // Previous fast model
    ],
    google: [
      'gemini-2.5-pro',      // Most advanced (FREE)
      'gemini-2.5-flash',    // Best price-performance (FREE)
      'gemini-2.5-flash-lite', // Ultra fast (FREE)
      'gemini-2.0-flash',    // Second gen workhorse
    ],
    gemini: [
      'gemini-2.5-pro',      // Most advanced (FREE)
      'gemini-2.5-flash',    // Best price-performance (FREE)
      'gemini-2.5-flash-lite', // Ultra fast (FREE)
      'gemini-2.0-flash',    // Second gen workhorse
    ],
  };

  // Update model when provider changes
  useEffect(() => {
    const providerModels = models[provider as keyof typeof models];
    if (providerModels && !providerModels.includes(modelName)) {
      setModelName(providerModels[0]);
    }
  }, [provider]);

  useEffect(() => {
    onUpdate({
      ...node.data,
      credentialId,
      provider,
      modelName,
      systemPrompt,
      userGoal,
      temperature,
      maxTokens,
      useUserDBForMemory,
      memoryTableName,
      memoryDBCredentialId,
    });
  }, [credentialId, provider, modelName, systemPrompt, userGoal, temperature, maxTokens, useUserDBForMemory, memoryTableName, memoryDBCredentialId]);

  return (
    <div className="space-y-4">
      {/* API Credential Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          API Credential *
        </label>
        {loadingCreds ? (
          <div className="text-sm text-muted-foreground">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              No AI API credentials found. Please add one in Credential Manager.
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={credentialId}
              onChange={(e) => {
                setCredentialId(e.target.value);
                const cred = credentials.find(c => c.id === e.target.value);
                if (cred) setProvider(cred.type);
              }}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select API credential</option>
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

      {/* Provider & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="openai">OpenAI (GPT-5, o3)</option>
            <option value="google">Google Gemini 2.5 (FREE)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Model</label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {models[provider as keyof typeof models]?.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful AI assistant specialized in blockchain and crypto..."
          rows={4}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* User Goal */}
      <div>
        <label className="block text-sm font-medium mb-2">User Goal</label>
        <textarea
          value={userGoal}
          onChange={(e) => setUserGoal(e.target.value)}
          placeholder="Analyze wallet transactions and provide insights..."
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          What the AI should accomplish in this workflow
        </p>
      </div>

      {/* Temperature & Max Tokens */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            min="256"
            max="8192"
            step="256"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Memory Configuration */}
      <div className="p-4 bg-accent/30 rounded-lg border border-border/50 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useUserDBForMemory}
            onChange={(e) => setUseUserDBForMemory(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Enable Vector Memory (RAG)</span>
        </label>

        {useUserDBForMemory && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Memory Database
              </label>
              <select
                value={memoryDBCredentialId}
                onChange={(e) => setMemoryDBCredentialId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select database credential</option>
                {dbCredentials.map((cred) => (
                  <option key={cred.id} value={cred.id}>
                    {cred.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Memory Table Name
              </label>
              <input
                type="text"
                value={memoryTableName}
                onChange={(e) => setMemoryTableName(e.target.value)}
                placeholder="ai_memories"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          AI will store and retrieve context from database for better memory
        </p>
      </div>

      {/* Help Text */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> Connect a PostgresDB node to the bottom handle for database-powered memory (RAG).
        </p>
      </div>
    </div>
  );
}
