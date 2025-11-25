import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Brain, Info } from 'lucide-react';

interface Mem0NodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function Mem0NodeConfig({ node, onUpdate }: Mem0NodeConfigProps) {
  const [action, setAction] = useState(node.data.action || 'search');
  const [query, setQuery] = useState(node.data.query || '');
  const [messages, setMessages] = useState(node.data.messages || '');
  const [memoryId, setMemoryId] = useState(node.data.memory_id || '');

  useEffect(() => {
    onUpdate({
      action,
      query: query.trim() || undefined,
      messages: messages.trim() ? parseMessages(messages) : undefined,
      memory_id: memoryId.trim() || undefined,
    });
  }, [action, query, messages, memoryId]);

  const parseMessages = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      // If not valid JSON, treat as simple text
      return [{ role: 'user', content: text }];
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Brain className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold">Mem0 AI Memory</h3>
      </div>

      {/* Action Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="search">🔍 Search Memories</option>
          <option value="add">➕ Add Memory</option>
          <option value="get_all">📚 Get All Memories</option>
          <option value="delete">🗑️ Delete Memory</option>
        </select>
      </div>

      {/* Action-specific fields */}
      {action === 'search' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Search Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What was Bitcoin's price yesterday?"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Semantic search - finds relevant memories by meaning, not exact match
          </p>
        </div>
      )}

      {action === 'add' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Messages (JSON)
          </label>
          <textarea
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            placeholder={`[\n  {"role": "user", "content": "What's Bitcoin price?"},\n  {"role": "assistant", "content": "Bitcoin is $87,610"}\n]`}
            rows={6}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            JSON array of conversation messages to store
          </p>
        </div>
      )}

      {action === 'delete' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Memory ID
          </label>
          <input
            type="text"
            value={memoryId}
            onChange={(e) => setMemoryId(e.target.value)}
            placeholder="mem_abc123"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The ID of the memory to delete
          </p>
        </div>
      )}

      {action === 'get_all' && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400">
            This action retrieves all memories for the current user. No additional configuration needed.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Mem0</strong> provides semantic AI memory with automatic deduplication and relevance scoring.</p>
            <p className="mt-2">
              <strong>Setup:</strong> Add <code className="bg-blue-900/30 px-1 rounded">MEM0_API_KEY</code> to your backend .env file.
            </p>
          </div>
        </div>
      </div>

      {/* Action Descriptions */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <p><strong>Search:</strong> Find memories by semantic similarity</p>
        <p><strong>Add:</strong> Store new conversation context</p>
        <p><strong>Get All:</strong> Retrieve complete memory history</p>
        <p><strong>Delete:</strong> Remove specific memory by ID</p>
      </div>
    </div>
  );
}
