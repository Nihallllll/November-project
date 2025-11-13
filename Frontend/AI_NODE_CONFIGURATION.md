# AI Node Handle Configuration

## Visual Layout

```
                    ┌─────────────────────┐
                    │                     │
    Input ────────► │                     │ ────────► Output
    (left)          │      AI Agent       │           (right)
                    │                     │
                    │      GPT-4          │
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                          Database
                          (bottom)
                    Only PostgresDB ✓
```

## Handle Details

### Input Handle (Left Side)
- **ID**: `input`
- **Position**: Left, centered (50%)
- **Accepts**: Any data type
- **Purpose**: Main data input for AI processing
- **Color**: Blue (#3b82f6)

### Database Handle (Bottom)
- **ID**: `database`
- **Position**: Bottom, centered (50%)
- **Accepts**: ONLY PostgresDB nodes
- **Purpose**: Vector database/memory storage
- **Color**: Purple (#8b5cf6)
- **Validation**: Enforced via `acceptsFrom: ['postgresDB']`

### Output Handle (Right Side)
- **ID**: `output`
- **Position**: Right, centered (50%)
- **Outputs**: AI context/response data
- **Purpose**: Send results to next node
- **Color**: Green (#10b981)

## Connection Rules

### ✅ Valid Connections TO AI Node:

**Input Handle (Left):**
- Schedule trigger
- Webhook trigger
- Watch Wallet trigger
- HTTP Request
- Solana RPC
- Any data source
- Condition outputs
- Merge output
- Other AI nodes

**Database Handle (Bottom):**
- PostgresDB ONLY ✓

### ✅ Valid Connections FROM AI Node:

**Output Handle (Right):**
- Other AI nodes
- Condition node
- Merge node
- Delay node
- Jupiter (swap)
- Token Program
- Telegram notification
- Email notification
- Log output

## Example Workflows

### Example 1: AI with Database Memory
```
Schedule
   │
   ▼
PostgresDB ──► AI Agent ──► Telegram
   (database)     │
                  ▼
              (stores context)
```

### Example 2: Multi-Step AI Chain
```
Webhook
   │
   ▼
HTTP Request ──► AI Agent #1 ──► AI Agent #2 ──► Email
                     │               │
                     ▼               ▼
                PostgresDB      PostgresDB
                (database)      (database)
```

### Example 3: Conditional AI Processing
```
Watch Wallet
   │
   ▼
PostgresDB ──► AI Agent ──► Condition
   (database)     │            │
                  │            ├─ True ──► Jupiter (swap)
                  │            │
                  │            └─ False ──► Telegram
                  ▼
              (analyzes data)
```

### Example 4: Merged Input
```
HTTP Request ──┐
               │
Solana RPC ────┼──► Merge ──► AI Agent ──► Log
               │                  │
Pyth Price ────┘                  ▼
                             PostgresDB
                             (database)
```

## Benefits of New Design

### Visual Clarity
- Distinct input types (data vs database)
- Clear left-to-right flow
- Database connection obvious from position

### Enforced Architecture
- Database must be PostgresDB (validation)
- Prevents incorrect connections
- Matches backend execution logic

### Simplified Configuration
- Reduced from 5 handles to 3
- Easier to understand
- More intuitive connections

### Backend Compatibility
- Matches executor.service.ts logic
- Database input used for RAG/memory
- Output handles success/error internally

## Implementation Details

### React Flow Handle Props

```typescript
// Input Handle (Left)
<Handle
  type="target"
  position={Position.Left}
  id="input"
  style={{ top: '50%', background: '#3b82f6' }}
  className="w-3 h-3 border-2 border-white"
/>

// Database Handle (Bottom)
<Handle
  type="target"
  position={Position.Bottom}
  id="database"
  style={{ left: '50%', background: '#8b5cf6' }}
  className="w-3 h-3 border-2 border-white"
/>

// Output Handle (Right)
<Handle
  type="source"
  position={Position.Right}
  id="output"
  style={{ top: '50%', background: '#10b981' }}
  className="w-3 h-3 border-2 border-white"
/>
```

### Validation Configuration

```typescript
ai: {
  category: 'ai',
  inputs: [
    { 
      id: 'input', 
      type: 'target', 
      position: 'left', 
      label: 'Data In',
      dataType: [DataTypes.ANY],
    },
    { 
      id: 'database', 
      type: 'target', 
      position: 'bottom', 
      label: 'Database',
      dataType: [DataTypes.DATABASE],
      acceptsFrom: ['postgresDB'],  // CRITICAL: Only PostgresDB!
    },
  ],
  outputs: [
    { 
      id: 'output', 
      type: 'source', 
      position: 'right', 
      dataType: [DataTypes.AI_CONTEXT, DataTypes.ANY] 
    }
  ],
}
```

## Error Messages

### Invalid Connections:
- **WalletWatch → AI (database)**: "Database only accepts connections from: postgresDB"
- **HTTPRequest → AI (database)**: "Database only accepts connections from: postgresDB"
- **AI → AI (database)**: "Database only accepts connections from: postgresDB"

### Valid Connections:
- **PostgresDB → AI (database)**: ✓ "Connection created"
- **Schedule → AI (input)**: ✓ "Connection created"
- **AI → Telegram (input)**: ✓ "Connection created"

## Migration Notes

### For Existing Flows:
- Old AI nodes with 3 left inputs still load
- Will need re-connection for database input
- Output connections remain valid
- No breaking changes to workflow execution

### For New Workflows:
- Use bottom handle for database
- Use left handle for data input
- Use right handle for output
- Validation prevents incorrect connections

## Testing Scenarios

### Test 1: Database Connection
1. Drag PostgresDB node
2. Connect PostgresDB output → AI database input (bottom)
3. ✅ Should succeed with green toast

### Test 2: Invalid Database Connection
1. Drag WatchWallet node
2. Try to connect WatchWallet → AI database input (bottom)
3. ❌ Should fail with error: "Database only accepts connections from: postgresDB"

### Test 3: Data Input Connection
1. Drag Schedule trigger
2. Connect Schedule → AI input (left)
3. ✅ Should succeed with green toast

### Test 4: Chaining AI Nodes
1. Create AI #1 with database
2. Create AI #2 with database
3. Connect AI #1 output → AI #2 input
4. ✅ Should succeed (both data connections)

### Test 5: Complex Workflow
1. Schedule → HTTPRequest → AI (input) → Condition
2. PostgresDB → AI (database)
3. Condition true → Telegram
4. Condition false → Email
5. ✅ All connections should succeed

## Summary

The new AI node configuration:
- ✅ Has 3 handles (input left, database bottom, output right)
- ✅ Enforces PostgresDB for database input
- ✅ Maintains workflow flexibility
- ✅ Matches backend execution logic
- ✅ Provides clear visual distinction
- ✅ Improves user experience
- ✅ Prevents invalid connections
- ✅ Enables complex AI workflows
