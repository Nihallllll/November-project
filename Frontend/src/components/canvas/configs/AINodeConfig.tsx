import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface AINodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function AINodeConfig({ node, onUpdate }: AINodeConfigProps) {
  const [model, setModel] = useState(node.data.model || 'gpt-4');
  const [prompt, setPrompt] = useState(node.data.prompt || '');
  const [temperature, setTemperature] = useState(node.data.temperature || 0.7);
  const [memory, setMemory] = useState(node.data.memory || false);
  const [tools, setTools] = useState<string[]>(node.data.tools || []);

  useEffect(() => {
    onUpdate({
      ...node.data,
      model,
      prompt,
      temperature,
      memory,
      tools,
    });
  }, [model, prompt, temperature, memory, tools]);

  const availableTools = [
    'web_search',
    'code_interpreter',
    'wallet_balance',
    'token_swap',
    'price_feed',
  ];

  const toggleTool = (tool: string) => {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">AI Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        </select>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">System Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="You are a helpful AI assistant..."
          rows={6}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Instructions for the AI agent
        </p>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Temperature: {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="2"
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

      {/* Memory */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={memory}
            onChange={(e) => setMemory(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Enable Memory</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1 ml-6">
          AI will remember context from previous conversations
        </p>
      </div>

      {/* Tools */}
      <div>
        <label className="block text-sm font-medium mb-2">Available Tools</label>
        <div className="space-y-2">
          {availableTools.map(tool => (
            <label
              key={tool}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-accent transition-colors"
            >
              <input
                type="checkbox"
                checked={tools.includes(tool)}
                onChange={() => toggleTool(tool)}
                className="rounded"
              />
              <span className="text-sm">{tool.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
