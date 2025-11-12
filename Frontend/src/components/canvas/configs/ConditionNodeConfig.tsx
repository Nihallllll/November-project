import { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface ConditionNodeConfigProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export default function ConditionNodeConfig({ node, onUpdate }: ConditionNodeConfigProps) {
  const [expression, setExpression] = useState(node.data.expression || '');
  const [operator, setOperator] = useState(node.data.operator || '==');
  const [leftValue, setLeftValue] = useState(node.data.leftValue || '');
  const [rightValue, setRightValue] = useState(node.data.rightValue || '');

  useEffect(() => {
    // Build expression from simple fields
    const expr = `${leftValue} ${operator} ${rightValue}`;
    onUpdate({
      ...node.data,
      expression: expr,
      operator,
      leftValue,
      rightValue,
    });
  }, [operator, leftValue, rightValue]);

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
        <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
          Conditional Logic
        </p>
        <p className="text-xs text-muted-foreground">
          Define when this branch should execute
        </p>
      </div>

      {/* Left Value */}
      <div>
        <label className="block text-sm font-medium mb-2">Variable / Value</label>
        <input
          type="text"
          value={leftValue}
          onChange={(e) => setLeftValue(e.target.value)}
          placeholder="e.g., data.balance, 100"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use dot notation for nested values: data.price
        </p>
      </div>

      {/* Operator */}
      <div>
        <label className="block text-sm font-medium mb-2">Operator</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="==">Equal (==)</option>
          <option value="!=">Not Equal (!=)</option>
          <option value=">">Greater Than (&gt;)</option>
          <option value=">=">Greater or Equal (&gt;=)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value="<=">Less or Equal (&lt;=)</option>
          <option value="&&">And (&amp;&amp;)</option>
          <option value="||">Or (||)</option>
        </select>
      </div>

      {/* Right Value */}
      <div>
        <label className="block text-sm font-medium mb-2">Compare To</label>
        <input
          type="text"
          value={rightValue}
          onChange={(e) => setRightValue(e.target.value)}
          placeholder="e.g., 100, 'SOL', true"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Expression Preview */}
      <div>
        <label className="block text-sm font-medium mb-2">Expression Preview</label>
        <div className="px-3 py-2 bg-muted border border-border rounded-lg font-mono text-sm">
          {leftValue || rightValue ? `${leftValue} ${operator} ${rightValue}` : 'Enter values above'}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
        <p className="font-medium">Examples:</p>
        <p className="text-muted-foreground">• data.balance &gt; 1000</p>
        <p className="text-muted-foreground">• data.token == 'SOL'</p>
        <p className="text-muted-foreground">• data.price &lt;= 100</p>
      </div>
    </div>
  );
}
