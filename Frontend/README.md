# Crypto Workflow Automation - Frontend

A beautiful ReactFlow-based visual workflow builder for creating and managing crypto automation workflows.

## 🚀 Features

- **Visual Workflow Canvas**: Drag-and-drop interface powered by ReactFlow
- **18 Custom Nodes**: Blockchain operations, AI agents, triggers, notifications, and utilities
- **Special AI Node**: Multiple connection points (3 inputs, 2 outputs) with memory support
- **Beautiful UI**: Tailwind CSS with light/dark mode toggle
- **Real-time Execution**: Run workflows and see live status updates
- **Auto-save**: Automatic saving to backend and localStorage
- **Responsive Design**: Works on desktop and tablet devices

## 📦 Tech Stack

- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **ReactFlow 11.11.0** - Visual workflow canvas
- **Tailwind CSS 3.4.0** - Styling
- **Zustand 4.5.0** - State management
- **Axios 1.7.0** - HTTP client
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Beautiful icons
- **Framer Motion** - Animations
- **Sonner** - Toast notifications

## 🎨 Available Nodes

### Triggers
- 🔔 **Webhook** - HTTP webhook triggers
- 📡 **Helius Indexer** - Solana blockchain event indexing
- 👁️ **Watch Wallet** - Monitor wallet activity

### AI & Logic
- 🤖 **AI Agent** - GPT-4 powered agent with tools and memory (4 connection points)
- ◆ **Condition** - Conditional branching (diamond shape)
- ⊃ **Merge** - Wait for multiple inputs

### Blockchain
- 💰 **Wallet Balance** - Check SOL/token balances
- 💵 **Pyth Price** - Real-time price feeds
- 🪐 **Jupiter Swap** - Token swapping
- ⚡ **Solana RPC** - Direct RPC calls
- 🪙 **Token Program** - SPL token operations

### Data
- 🐘 **Postgres DB** - Database operations
- 🌐 **HTTP Request** - External API calls

### Notifications
- ✈️ **Telegram** - Send Telegram messages
- 📧 **Email** - Send emails

### Utilities
- ⏰ **Delay** - Add delays
- 📝 **Log** - Debug logging

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Backend API running on `http://localhost:3000`

### Installation

\`\`\`bash
cd Frontend
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5173/`

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 📁 Project Structure

\`\`\`
Frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance
│   │   └── flows.ts      # Flow CRUD operations
│   ├── components/
│   │   ├── canvas/       # Canvas-specific components
│   │   │   └── NodePalette.tsx
│   │   ├── nodes/        # 18 custom ReactFlow nodes
│   │   │   ├── AINode.tsx          (Special - 4 handles)
│   │   │   ├── ConditionNode.tsx   (Diamond shape)
│   │   │   ├── MergeNode.tsx
│   │   │   └── ... (15 more)
│   │   ├── ui/           # Reusable UI components
│   │   └── ThemeProvider.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Flow list/management
│   │   └── CanvasPage.tsx       # Workflow builder
│   ├── types/
│   │   └── flow.types.ts        # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
\`\`\`

## 🎯 Key Features

### AI Node (Special)
The AI node has unique features:
- **3 Input Handles**:
  - Data In (top-left, blue)
  - Memory In (middle-left, purple)
  - Merge In (bottom-left, pink)
- **2 Output Handles**:
  - Success (top-right, green)
  - Error (bottom-right, red)
- Purple gradient with glow effect
- Shows model, memory status, prompt preview, and active tools

### Condition Node
- Diamond shape for visual clarity
- Two outputs: true (green) and false (red)
- Displays the condition expression

### Theme Support
- Light/dark mode toggle in navbar
- Persisted to localStorage
- Smooth transitions

### Auto-save (Planned)
- Saves to backend every 30 seconds
- Saves to localStorage every 1 second
- Toast notifications for save status

## 🔌 API Integration

All API calls go through the centralized Axios client:

\`\`\`typescript
// Get all flows
const flows = await flowsApi.list();

// Get single flow
const flow = await flowsApi.get(id);

// Create flow
const newFlow = await flowsApi.create({ name, json, isActive });

// Update flow
await flowsApi.update(id, { name, json });

// Delete flow
await flowsApi.delete(id);

// Run flow
await flowsApi.run(id);
\`\`\`

## 🎨 Customization

### Adding a New Node

1. Create the node component in `src/components/nodes/`:

\`\`\`tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default memo(({ data, selected }: NodeProps) => {
  return (
    <div className="px-4 py-3 rounded-lg bg-blue-500 text-white">
      <Handle type="target" position={Position.Left} />
      {/* Node content */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
\`\`\`

2. Register it in `src/components/nodes/index.ts`:

\`\`\`typescript
import MyNode from './MyNode';

export const nodeTypes = {
  // ... existing nodes
  my_node: MyNode,
};
\`\`\`

3. Add to palette in `src/components/canvas/NodePalette.tsx`

## 🐛 Known Issues

- None yet! 🎉

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

Built with ❤️ using React, TypeScript, and ReactFlow
