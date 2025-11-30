# AI Frontend Development Prompt: Solana Workflow Automation Platform

## Project Overview
Build a **stunning, modern web application** for visual workflow automation on Solana blockchain. This is a no-code/low-code platform where users create automated workflows by dragging and connecting nodes in a visual canvas. The platform integrates AI agents, blockchain operations, smart contracts (multisig, voting, escrow), and various data sources.

---

## 🎨 Design Philosophy

### Visual Excellence Requirements
You have **complete creative freedom** to design the most stunning, modern, professional Web3 platform. Make it look exceptional - the kind of design that makes users say "Wow!" when they first see it.

**Your Design Goals**:
- **Premium & Professional**: This should look like a top-tier SaaS platform (think Vercel, Linear, Stripe quality)
- **Modern & Cutting-Edge**: Use contemporary design trends - 3D effects, depth, layering, smooth animations
- **Blockchain/Crypto Aesthetic**: Should feel like a Web3 product but not cliché
- **Dark Mode Optimized**: Primary theme should be dark with excellent contrast and readability
- **Consistent Design Language**: All pages should feel cohesive with shared visual patterns

**Visual Elements to Include** (you choose how):
- **Depth & Dimension**: Use shadows, blur effects, layering, transforms to create 3D depth
- **Glass/Frosted Effects**: Modern glassmorphism where appropriate
- **Gradient Usage**: Multi-color gradients for visual interest (you pick the colors)
- **Particle/Ambient Effects**: Floating elements, subtle animations in backgrounds
- **Glow/Neon Accents**: Subtle glows on interactive elements
- **Smooth Animations**: Page transitions, hover effects, micro-interactions (use Framer Motion)
- **Loading States**: Skeleton loaders, spinners, progress indicators
- **Visual Feedback**: Toast notifications, success animations, error states

**Color Palette** (Your Choice):
- Choose a modern color scheme that works well for a blockchain/crypto automation platform
- Ensure excellent contrast for accessibility (WCAG 2.1 AA minimum)
- Consider using 3-4 core colors (primary, secondary, accent, neutral)
- Make sure colors work well for both light backgrounds and dark themes
- Colors should convey: trust, innovation, technology, professionalism

**Typography** (Your Choice):
- Select modern, readable fonts
- Clear hierarchy: headlines, body text, labels, captions
- Consider using different font weights for emphasis

**Component Styling** (Your Choice):
- Buttons: Design primary, secondary, and destructive variants
- Cards: How should containers look? (borders, shadows, backgrounds)
- Inputs: Style for text fields, dropdowns, textareas
- Modals/Dialogs: Overlay effects, positioning, animations
- Navigation: Headers, sidebars, breadcrumbs

Make every design decision with intention - this should be portfolio-quality work.

---

## 📱 Application Structure

### Tech Stack
```json
{
  "framework": "React 18 + TypeScript + Vite",
  "styling": "Tailwind CSS + shadcn/ui components",
  "icons": "Lucide React",
  "animations": "Framer Motion + TypeAnimation",
  "canvas": "ReactFlow (drag-drop workflow builder)",
  "blockchain": "Solana Web3.js + Wallet Adapter (Phantom, Solflare)",
  "state": "Zustand",
  "notifications": "Sonner (toast)",
  "forms": "React Hook Form + Zod validation",
  "dates": "date-fns"
}
```

### File Structure
```
Frontend/src/
├── pages/
│   ├── LandingPage.tsx          # Marketing homepage
│   ├── LoginPage.tsx            # Authentication
│   ├── SignUpPage.tsx           # Registration
│   ├── DashboardPage.tsx        # Flow management
│   ├── CanvasPage.tsx           # Visual workflow builder
│   └── sign/                    # Public signing portals
│       ├── MultisigSigningPage.tsx
│       ├── VotingPage.tsx
│       └── EscrowPage.tsx
├── components/
│   ├── landing/                 # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── UseCases.tsx
│   │   ├── Stats.tsx
│   │   ├── Pricing.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── canvas/                  # Canvas components
│   │   ├── NodePalette.tsx     # Left sidebar with nodes
│   │   ├── NodeInspector.tsx   # Right sidebar for config
│   │   ├── CustomEdge.tsx      # Connection lines
│   │   ├── CredentialManager.tsx
│   │   └── configs/            # Node configuration panels
│   │       ├── MultisigNodeConfig.tsx
│   │       ├── VotingNodeConfig.tsx
│   │       ├── EscrowNodeConfig.tsx
│   │       └── [15+ other configs]
│   ├── nodes/                   # Node visual components
│   │   ├── AINode.tsx
│   │   ├── ScheduleNode.tsx
│   │   ├── WebhookNode.tsx
│   │   └── [19+ other nodes]
│   └── SolanaWalletProvider.tsx # Wallet context
└── api/
    ├── flowsApi.ts
    └── credentialsApi.ts
```

---

## 🎯 Page-by-Page Requirements

### 1️⃣ Landing Page (`LandingPage.tsx`)

**Purpose**: Convert visitors into users with stunning visuals and clear value proposition

#### Sections (in order):

**A. Hero Section** (`Hero.tsx`)
- **Layout**: Full viewport height, centered content
- **Background**: Design an impressive animated background (consider: gradient meshes, particles, geometric patterns, or subtle motion)
- **Content**:
  - **Logo/Brand**: Top-left (design the logo treatment)
  - **Headline**: Large, impactful text with TypeAnimation rotating through:
    ```
    "Automate Your Crypto" + rotating phrases:
    - "with Visual Workflows"
    - "with AI-Powered Agents"
    - "with No-Code Builder"
    ```
  - **Subheadline**: "Build powerful Solana automations without writing code. Drag, drop, and deploy workflows in minutes."
  - **Trust Badges**: 3 small badges showing key features (🔒 Secure, ⚡ Fast, 🤖 AI-Powered) - style them beautifully
  - **CTA Buttons**: 
    - Primary: "Get Started Free" (make this stand out - it's the main action)
    - Secondary: "Watch Demo" (complementary styling)
  - **Visual Element**: Optional - add an illustration, mockup preview, or animated graphic if it enhances the hero

**B. Features Section** (`Features.tsx`)
- **Layout**: Grid layout (3 columns on desktop, responsive for mobile)
- **Features** (6 total) - design beautiful feature cards:
  1. **Visual Workflow Builder** (icon: Layout)
     - Drag-and-drop interface
     - Real-time preview
     - Connection validation
  2. **AI Integration** (icon: Brain)
     - GPT-4, Claude, Llama support
     - Natural language processing
     - Memory & context management
  3. **Blockchain Native** (icon: Wallet)
     - Solana RPC operations
     - Token transfers
     - Smart contract interactions
  4. **Smart Contract Automation** (icon: FileCode)
     - Multisig proposals
     - Voting systems
     - Escrow management
  5. **Multi-Source Data** (icon: Database)
     - HTTP APIs
     - Postgres databases
     - Webhook triggers
  6. **Enterprise Security** (icon: Shield)
     - Encrypted credentials
     - Role-based access
     - Audit logs
- **Card Design**: Each card should have an icon, title, and bullet points. Make them visually appealing with hover effects.
- **Animations**: Add entrance animations (stagger effect as user scrolls)

**C. Use Cases Section** (`UseCases.tsx`)
- **Layout**: Grid or horizontal scroll (your choice)
- **Use Cases** (4-6 example cards):
  1. **DeFi Automation**: "Auto-compound yields when APY > 10%"
  2. **NFT Operations**: "Mint collection & notify buyers via email"
  3. **DAO Governance**: "Create multisig proposals with automated voting"
  4. **Trading Bots**: "Buy token when price drops 5% + AI sentiment check"
  5. **Treasury Management**: "Escrow payments with milestone tracking"
  6. **Social Alerts**: "Send Telegram when wallet balance changes"
- **Card Design**: Include icon/image, title, description, optional "Learn More" link. Make them engaging.
- **Visual**: Consider adding mockup screenshots or workflow previews if it helps

**D. Stats Section** (`Stats.tsx`)
- **Layout**: Horizontal row of 4 stat cards (centered)
- **Stats** with animated counters (count up on scroll):
  - **10,000+** Workflows Created
  - **$50M+** Volume Processed
  - **99.9%** Uptime
  - **500+** Active Users
- **Design**: Make numbers prominent with labels below. Add subtle animations.

**E. Pricing Section** (`Pricing.tsx`)
- **Layout**: 3 pricing cards side-by-side
- **Tiers**:
  1. **Free**: 10 flows, 1,000 executions/mo, community support
  2. **Pro** ($29/mo): Unlimited flows, 50,000 executions/mo, priority support, custom nodes (mark as "Most Popular")
  3. **Enterprise**: Custom pricing, dedicated infrastructure, SLA, white-label
- **Card Design**: Each card shows plan name, price, feature list with checkmarks, and CTA button. Style the "Pro" tier to stand out.

**F. CTA Section** (`CTA.tsx`)
- **Layout**: Full-width section with centered content
- **Content**: 
  - Headline: "Ready to Automate Your Crypto?"
  - Subtext: "Join 500+ users building the future of Web3 automation"
  - Button: "Start Building Now" (make it prominent)
- **Background**: Design an eye-catching background (gradients, patterns, particles - your choice)

**G. Footer** (`Footer.tsx`)
- **Layout**: 4 column layout (Product, Resources, Company, Social)
- **Links**: 
  - Product: Features, Pricing, Docs, API
  - Resources: Blog, Tutorials, Community, Support
  - Company: About, Careers, Terms, Privacy
  - Social: Twitter, Discord, GitHub, YouTube
- **Additional**: Newsletter signup form
- **Bottom**: Copyright text, logo, "Built with ❤️ on Solana"
- **Design**: Style appropriately for footer (typically darker, more subdued)

#### Technical Requirements:
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl
- **Performance**: Lazy load images, code-split sections
- **SEO**: Meta tags, OpenGraph, structured data
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

### 2️⃣ Dashboard Page (`DashboardPage.tsx`)

**Purpose**: Manage all user workflows (create, edit, run, delete)

#### Layout:
- **Header**: 
  - Left: Logo + "My Flows"
  - Center: Search bar (filter flows)
  - Right: Theme toggle + Credential Manager button + User avatar dropdown
- **Body**: Grid of flow cards (3 columns desktop, responsive)
- **Footer**: Pagination if > 20 flows

#### Flow Card Design:
Design beautiful cards for each workflow. Each card should include:
- **Top Section**: 
  - Flow name (editable inline)
  - Status badge (Active vs Paused - use appropriate visual indicators)
- **Middle Section**:
  - Description (truncated to 2 lines)
  - Node count badge ("12 nodes")
  - Last run timestamp (relative: "2 hours ago")
- **Bottom Section**: Action buttons row
  - **Edit** (pencil icon): Navigate to canvas
  - **Run** (play icon): Execute flow immediately
  - **Pause/Resume** (pause/play toggle): Toggle active state
  - **Delete** (trash icon): Confirm modal → delete
- **Interactions**: Add appropriate hover effects and transitions

#### Empty State:
- **No Flows Yet**: 
  - Large icon (Workflow)
  - Text: "Create your first automation"
  - Button: "New Flow" (gradient, large)
  - Quick Start Guide link

#### Credential Manager Modal:
- **Trigger**: Button in header
- **Content**: 
  - List of saved credentials (OpenAI API, Postgres, SMTP, etc.)
  - Add new credential form
  - Edit/Delete existing credentials
- **Design**: Glass modal with backdrop blur, form inputs with validation

#### Technical Requirements:
- **Real-time Updates**: Poll or websocket for flow status changes
- **Optimistic UI**: Instant feedback on actions, rollback on error
- **Batch Actions**: Select multiple flows → bulk pause/delete
- **Sorting/Filtering**: By status, last run, name, creation date

---

### 3️⃣ Canvas Page (`CanvasPage.tsx`)

**Purpose**: Visual workflow builder (drag-drop nodes, connect, configure, save/run)

#### Layout:
**Three-Panel Design**:
1. **Left Panel** (`NodePalette.tsx`): Node library (width: 256px)
2. **Center Panel**: ReactFlow canvas (flex-1)
3. **Right Panel** (`NodeInspector.tsx`): Node configuration (width: 320px, shows on node select)

#### Top Toolbar:
- **Left**: Back to Dashboard button, Flow name (editable)
- **Center**: Zoom controls, Fit view, Toggle minimap
- **Right**: Save button, Run button (gradient, glow), Delete selected, Theme toggle

#### Background:
Design an impressive canvas background (consider: gradient meshes, subtle patterns, particles, or animated elements - whatever looks best)

#### Node Palette (Left Sidebar):
**Purpose**: Draggable node library organized by category (width: ~256px)

**Header**: "Nodes" title + "Drag to canvas" subtitle

**Search Bar**: Filter nodes by name (include search icon)

**Categories** (collapsible, expanded by default) - 7 categories total:
1. **🎯 Triggers** - Assign appropriate color
   - Schedule (⏰)
   - Webhook (🔔)
   - Helius Indexer (📡)
   - Watch Wallet (👀)

2. **🤖 AI & Logic** - Assign appropriate color
   - AI Agent (🧠)
   - Condition (🔀)
   - Merge (🔗)

3. **⛓️ Blockchain** - Assign appropriate color
   - Wallet Balance (💰)
   - Pyth Price (📊)
   - Jupiter Swap (🔄)
   - Solana RPC (⚡)
   - Token Program (🪙)

4. **📋 Smart Contracts** - Assign appropriate color
   - Multisig (🔐)
   - Voting (🗳️)
   - Escrow (🤝)

5. **💾 Data** - Assign appropriate color
   - Postgres DB (🗄️)
   - HTTP Request (🌐)

6. **📢 Notifications** - Assign appropriate color
   - Telegram (✈️)
   - Email (📧)

7. **🛠️ Utilities** - Assign appropriate color
   - Delay (⏰)
   - Log (📝)

**Node Card Design**: 
Each draggable node card should have:
- Icon (emoji shown above) with styled background
- Node label
- Visual indication it's draggable
- Hover effects (your design choice)

#### Canvas (Center):
**ReactFlow Configuration**:
- **Node Types**: Custom components for each node type (see below)
- **Edge Types**: Custom edge with delete button on hover
- **Connection Rules**: 
  - Trigger nodes: No input handles
  - AI Agent: Input + database input (bottom) + output
  - Action nodes: Input + output (if applicable)
  - Utilities: Input + output
- **Drag & Drop**: Accept nodes from palette
- **Multi-Select**: Shift + click or drag box
- **Delete**: Backspace/Delete key or toolbar button
- **Auto-Layout**: Snap to grid (optional)

**Node Visual Design** (applies to all 22 node types):
Design beautiful node components. Each node should have:
- **Shape**: Rounded rectangle with border
- **Background**: Styled appropriately (consider using different colors/gradients per node category)
- **Content**: 
  - Icon + Label at top
  - Key config summary in middle (e.g., "Every 5 minutes", "GPT-4", "Send to wallet ABC...")
  - Status indicator at bottom (if node was executed)
- **Connection Handles**: 
  - Input handle: Left side
  - Output handle: Right side
  - Database handle: Bottom (only for AI Agent node)
- **States**:
  - Default state
  - Selected state (should be visually obvious)
  - Error state (indicate with styling + optional animation)

**Example Node Content**:
- **Schedule Node**: "⏰ Schedule", shows frequency like "Every 5 mins"
- **AI Agent Node**: "🧠 AI Agent", shows model like "GPT-4 • Memory ON"
- **Webhook Node**: "🔔 Webhook", shows endpoint like "POST /trigger/abc123"
- **Multisig Node**: "🔐 Multisig", shows config like "3/5 owners"
- **Voting Node**: "🗳️ Voting", shows config like "4 choices • Public"
- **Escrow Node**: "🤝 Escrow", shows config like "1.5 SOL • 7d window"

**Edge Design** (connection lines between nodes):
- **Appearance**: Curved paths with arrows at target end
- **Hover**: Show delete button (X icon) at midpoint
- **Running State**: Animated effect when flow is executing
- **Selected State**: Visual emphasis when selected

**MiniMap** (bottom-right corner):
- Small overview of entire canvas
- Nodes shown as colored rectangles
- Viewport indicator
- Draggable to pan main canvas
- Style to match overall design

**Controls** (bottom-left corner):
- Zoom In (+) button
- Zoom Out (-) button
- Fit View (⊡) button
- Style consistently with other UI controls

#### Node Inspector (Right Sidebar):
**Purpose**: Configure selected node's settings

**Header**: Node type icon + label, Close button (X)

**Content** (dynamic based on node type):
- **Common Fields**:
  - Node Label (editable text input)
  - Description (textarea, optional)

- **Type-Specific Configs**:
  
  **Schedule Node**:
  - Frequency: Dropdown (Every minute, 5 min, 15 min, 30 min, 1 hour, Custom cron)
  - Cron Expression: Text input (if Custom selected)
  - Timezone: Dropdown
  
  **AI Agent Node**:
  - Model: Dropdown (GPT-4, GPT-3.5-turbo, Claude 3.5 Sonnet, Llama 3 70B)
  - System Prompt: Textarea with syntax highlighting
  - Temperature: Slider (0-1)
  - Max Tokens: Number input
  - Memory: Toggle + memory key input
  - Credential: Select OpenAI API key
  
  **Webhook Node**:
  - Webhook URL: Display generated URL (copy button)
  - Authentication: Dropdown (None, API Key, HMAC)
  - Expected Payload Schema: JSON editor
  
  **Multisig Node**:
  - Owners: List of public keys (min 2, max 10, add/remove buttons)
  - Threshold: Number input (must be ≤ owners count)
  - Description: Textarea
  - Expiry: Datetime picker (optional)
  - Notification Threshold: Number input (notify when X owners approve)
  - Send Notification: Toggle + Telegram/Email node selector
  
  **Voting Node**:
  - Choices: List of text inputs (min 2, max 10, add/remove buttons)
  - Voting Type: Radio (Public / Restricted)
  - Allowed Voters: List of public keys (if Restricted)
  - Expiry: Datetime picker (optional)
  - Winner Notification: Toggle + Email/Telegram node selector
  
  **Escrow Node**:
  - Buyer Public Key: Text input
  - Seller Public Key: Text input
  - Arbitrator Public Key: Text input
  - Amount (SOL): Number input
  - Dispute Window (days): Number input
  - Milestone Notifications: Toggle + node selectors for delivered/disputed/resolved events
  
  **HTTP Request Node**:
  - Method: Dropdown (GET, POST, PUT, DELETE, PATCH)
  - URL: Text input with dynamic variables
  - Headers: Key-value pairs (add/remove)
  - Body: JSON editor (if POST/PUT/PATCH)
  - Authentication: Credential selector
  
  **Postgres DB Node**:
  - Credential: Select saved Postgres connection
  - Query: SQL editor with syntax highlighting
  - Parameters: Dynamic variables from previous nodes
  
  **Email Node**:
  - Credential: SMTP credential selector
  - To: Text input (dynamic variables)
  - Subject: Text input (dynamic variables)
  - Body: Rich text editor / HTML editor toggle
  - Attachments: File references from previous nodes
  
  **Telegram Node**:
  - Bot Token: Credential selector
  - Chat ID: Text input
  - Message: Textarea with Markdown support + dynamic variables
  - Parse Mode: Dropdown (Markdown, HTML, None)

**Dynamic Variables**:
- Show available variables from previous nodes
- Syntax: `{{nodeName.output.field}}`
- Autocomplete dropdown
- Example: `{{schedule1.timestamp}}`, `{{aiAgent1.response}}`

**Footer**:
- Save Changes button (primary, gradient)
- Reset button (secondary)
- Test Node button (sends test data through node, shows result in modal)

#### Toolbar Actions:

**Save Flow**:
- Save nodes, edges, positions to database
- Toast notification: "Flow saved successfully"
- Visual feedback: Brief green glow on Save button

**Run Flow**:
- Validation: Check if all required fields configured
- Confirmation modal if trigger node is missing
- Execute flow immediately
- Show execution logs modal:
  - Node-by-node progress
  - Output data preview
  - Errors highlighted in red
  - Execution time per node
- Toast: "Flow execution started" → "Flow completed in 3.2s"

**Delete Selected**:
- Confirm modal: "Delete X nodes?"
- Remove from canvas + update edges

#### Technical Requirements:
- **Auto-Save**: Save canvas state every 30 seconds
- **Undo/Redo**: Cmd+Z / Cmd+Shift+Z (store canvas history)
- **Keyboard Shortcuts**: 
  - Cmd+S: Save
  - Cmd+Enter: Run
  - Delete: Delete selected
  - Cmd+A: Select all
  - Cmd+D: Duplicate selected
- **Connection Validation**: Prevent invalid connections (e.g., Schedule → Schedule)
- **Error Handling**: Show validation errors inline on nodes
- **Performance**: Virtualize large canvases (>100 nodes)

---

### 4️⃣ Signing Portal Pages (Public, No Auth Required for Viewing)

#### A. Multisig Signing Page (`/sign/multisig/:id`)

**Purpose**: Public page where multisig owners approve/reject proposals

**Layout**:
- **Header**: Logo, "Multisig Proposal", Wallet Connect button (right)
- **Body**: Proposal card (centered, max-width 800px)
- **Background**: Gradient mesh + particles

**Proposal Card**:
Design an elegant proposal card (centered, max-width ~800px) with:
- **Status Banner** (if applicable):
  - **Executed**: Success banner "✓ This proposal has been executed"
  - **Expired**: Warning banner "⏰ This proposal has expired"
- **Content**:
  - **Title**: Proposal description
  - **Progress Bar**: 
    - "X / Y owners approved"
    - Visual bar with gradient fill
    - Percentage text
  - **Details Grid**:
    - Created: Timestamp
    - Expires: Countdown timer or "No expiry"
    - Threshold: "3 out of 5"
  - **Owners List**:
    - Each owner: Avatar (generated from pubkey) + shortened pubkey + status badge
    - Status: "✓ Approved" (green), "✗ Rejected" (red), "⏳ Pending" (gray)
    - Current user highlighted (if wallet connected)
  - **Transaction Details** (if applicable):
    - Target program
    - Instruction data (hex or decoded)
    - Amount (if transfer)

**Wallet Connection Flow**:
1. **Not Connected**: 
   - Show proposal details (read-only)
   - "Connect Wallet to Vote" button (gradient, large)
2. **Connected but Not Owner**:
   - Banner: "⚠️ You are not an owner of this multisig"
   - Actions disabled
3. **Connected and Owner**:
   - If already voted: Show your vote (badge) + "Change Vote" button
   - If not voted: Show action buttons:
     - **Approve** (green, gradient): Confirm modal → sign transaction
     - **Reject** (red, gradient): Confirm modal → sign transaction

**Actions**:
- **Approve**: 
  - Toast: "Approving proposal..."
  - Sign Solana transaction
  - On success: Update UI + toast "✓ Proposal approved"
  - On error: Toast "Failed to approve: [error]"
- **Reject**: Same flow as Approve but for rejection

**Real-time Updates**:
- Poll API every 5 seconds for status changes
- Show toast when another owner votes: "John Smith approved"

#### B. Voting Page (`/vote/:id`)

**Purpose**: Public voting portal for proposals

**Layout**: Similar to Multisig page

**Voting Card**:
- **Status Banner**:
  - **Finalized**: "🏆 Voting has ended. Winner: Option A"
  - **Expired**: "⏰ Voting period has ended"
- **Content**:
  - **Title**: Voting question/proposal
  - **Details**:
    - Created: Timestamp
    - Expires: Countdown
    - Type: "Public" or "Restricted"
    - Total Votes: Count
  - **Choices** (cards):
    - Each choice in separate card with:
      - Choice text
      - Vote count + percentage
      - Progress bar (gradient fill)
      - Radio button (if not voted)
      - Checkmark icon (if user voted for this)
    - Winner highlighted (gold border, glow) if finalized

**Wallet Connection Flow**:
1. **Not Connected**:
   - Show live results
   - "Connect to Vote" button
2. **Connected but Not Allowed** (if restricted):
   - Banner: "⚠️ You are not eligible to vote"
3. **Connected and Allowed**:
   - If already voted: Show which choice you voted for (highlighted) + "Change Vote" button
   - If not voted: Select choice → "Cast Vote" button appears

**Actions**:
- **Cast Vote**:
  - Select choice (radio button)
  - Click "Cast Vote" (gradient button)
  - Confirm modal: "Vote for [Choice]?"
  - Sign transaction
  - On success: Update UI + confetti animation + toast "✓ Vote recorded"

**Real-time Results**:
- Poll every 3 seconds
- Animate progress bars on update
- Show "New vote cast" toast when total count changes

#### C. Escrow Page (`/escrow/:id`)

**Purpose**: Escrow management with role-based actions

**Layout**: Similar structure

**Escrow Card**:
- **Role Badge** (top): 
  - "You are the **Buyer**" (blue)
  - "You are the **Seller**" (green)
  - "You are the **Arbitrator**" (purple)
  - (If not any role: Read-only view)
- **Status Banner**:
  - States: Created, Delivered, Disputed, Resolved
- **Amount Display**:
  - Large SOL amount (e.g., "1.5 SOL")
  - USD equivalent (using Pyth price)
  - Lamports (small text)
- **Timeline** (visual):
  - ✓ Created (timestamp)
  - ⏳ Delivered (grayed if not delivered)
  - ⏳ Disputed (grayed if not disputed)
  - ⏳ Resolved (grayed if not resolved)
  - Each step with icon + label + timestamp (if applicable)
- **Participants**:
  - Buyer: Avatar + shortened pubkey
  - Seller: Avatar + shortened pubkey
  - Arbitrator: Avatar + shortened pubkey
- **Dispute Window**:
  - "7 days remaining" (countdown)
  - Progress bar
- **Dispute Reason** (if disputed):
  - Text area content from buyer

**Actions** (role-based):

**Seller** (when state = Created):
- **Mark as Delivered** button (green gradient)
  - Click → Confirm modal → Sign transaction
  - Updates state to Delivered

**Buyer** (when state = Delivered):
- **Approve** button (green): Release funds to seller
- **Raise Dispute** button (red): Opens modal with textarea for reason

**Arbitrator** (when state = Disputed):
- **Buyer Wins** button (blue): Release funds to buyer + fee to arbitrator
- **Seller Wins** button (green): Release funds to seller + fee to arbitrator

**Anyone** (when dispute window expired & state = Delivered):
- **Auto-Release** button: Automatically release to seller (no dispute raised)

**Real-time Updates**:
- Poll every 5 seconds
- Toast on state changes: "Seller marked as delivered"
- Confetti on resolution

---

### 5️⃣ Authentication Pages

#### Login Page (`LoginPage.tsx`)
- **Background**: Design an attractive background
- **Form Card** (centered):
  - Logo at top
  - Headline: "Welcome Back"
  - Email input (with icon)
  - Password input (with show/hide toggle)
  - "Forgot Password?" link (right-aligned)
  - "Log In" button (primary style, full-width, loading state)
  - Divider: "or"
  - "Demo Login" button (secondary style)
  - "Don't have an account? Sign Up" link at bottom
- **Demo Login**: Automatically logs in as `demo@example.com` (creates account if needed)

#### Sign Up Page (`SignUpPage.tsx`)
- Similar layout and design as Login page
- Additional fields:
  - Name input
  - Confirm Password input
  - Terms & Privacy checkboxes
- "Create Account" button (primary style)
- "Already have an account? Log In" link

---

## 🎨 Design System Components

### shadcn/ui Components (use these as base):
Design beautiful, consistent versions of these components:
- **Button**: Primary, Secondary, and Destructive variants with appropriate styling
- **Input**: Text fields with icons, focus states, validation states
- **Textarea**: Auto-resize, optional character count
- **Select/Dropdown**: Styled dropdowns with icons
- **Modal/Dialog**: Overlay dialogs with backdrop, entrance animations
- **Toast**: Notifications (typically top-right) with icons, messages, optional action buttons
- **Tooltip**: Hover tooltips with helpful information
- **Tabs**: Tab navigation with active state indicator
- **Badge**: Small labels/pills for status indicators
- **Card**: Container components with consistent styling
- **Avatar**: User avatars (circle) with fallback to initials
- **Skeleton**: Loading placeholders with animation
- **Switch**: Toggle switches with smooth animation
- **Slider**: Range inputs with styled track
- **Progress Bar**: Linear progress indicators
- **Alert**: Info/Success/Warning/Error banners with icons
- **Accordion**: Collapsible sections with smooth expand/collapse

### Visual Effects to Implement:

**Glass/Frosted Effects**: Use backdrop-blur and semi-transparent backgrounds where appropriate

**Gradient Text**: Apply gradient fills to important text (headlines, CTAs)

**Floating/Ambient Particles**: Consider adding subtle animated background elements where it enhances the design

**Gradient Backgrounds**: Use multi-color gradients for visual interest in backgrounds, buttons, or accents

**Glow/Shine Effects**: Add subtle glows to interactive elements on hover or active states

---

## 🚀 Node Types Reference (22 Total)

### Triggers (4)
1. **Schedule** (⏰, orange): Cron-based triggers
2. **Webhook** (🔔, blue): HTTP POST endpoints
3. **Helius Indexer** (📡, purple): Solana transaction monitoring
4. **Watch Wallet** (👀, yellow): Balance/activity tracking

### AI & Logic (3)
5. **AI Agent** (🧠, purple): LLM integration (GPT-4, Claude, Llama)
6. **Condition** (🔀, indigo): If-else branching
7. **Merge** (🔗, violet): Combine multiple inputs

### Blockchain (5)
8. **Wallet Balance** (💰, green): Check SOL/SPL token balance
9. **Pyth Price** (📊, blue): Real-time price feeds
10. **Jupiter Swap** (🔄, orange): Token swaps
11. **Solana RPC** (⚡, cyan): Generic RPC calls
12. **Token Program** (🪙, yellow): SPL token operations

### Smart Contracts (3)
13. **Multisig** (🔐, cyan): Create/approve/reject proposals
14. **Voting** (🗳️, cyan): Create polls and record votes
15. **Escrow** (🤝, cyan): Create and manage escrow accounts

### Data (2)
16. **Postgres DB** (🗄️, emerald): SQL queries
17. **HTTP Request** (🌐, blue): REST API calls

### Notifications (2)
18. **Telegram** (✈️, sky): Send messages to Telegram
19. **Email** (📧, red): Send emails via SMTP

### Utilities (2)
20. **Delay** (⏰, orange): Wait for X seconds/minutes
21. **Log** (📝, gray): Console logging for debugging

---

## 🛠️ Technical Implementation Notes

### State Management (Zustand):
```typescript
// Canvas store
interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  // ... other actions
}

// Auth store
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

### API Client (Axios):
```typescript
// src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Solana Wallet Integration:
```typescript
// src/components/SolanaWalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Change to mainnet-beta for production
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Framer Motion Page Transitions:
```typescript
// src/App.tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route
      path="/"
      element={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LandingPage />
        </motion.div>
      }
    />
    {/* ... other routes */}
  </Routes>
</AnimatePresence>
```

### Form Validation (Zod + React Hook Form):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Toast Notifications (Sonner):
```typescript
import { toast } from 'sonner';

// Success
toast.success('Flow saved successfully', {
  description: 'Your workflow is now active',
});

// Error
toast.error('Failed to save flow', {
  description: error.message,
  action: {
    label: 'Retry',
    onClick: () => handleSave(),
  },
});

// Loading
const toastId = toast.loading('Executing flow...');
// Later...
toast.success('Flow completed', { id: toastId });
```

---

## 🎯 User Flows

### 1. New User Onboarding:
1. Land on homepage → See hero with value proposition
2. Click "Get Started Free" → Sign up page
3. Create account → Redirect to dashboard (empty state)
4. Click "New Flow" → Canvas page opens
5. See node palette → Drag Schedule node to canvas
6. Select node → Inspector shows config → Set "Every 5 minutes"
7. Drag HTTP Request node → Connect Schedule to HTTP Request
8. Configure HTTP Request (API endpoint)
9. Drag Email node → Connect HTTP Request to Email
10. Configure Email (recipient, subject, body)
11. Click Save → Toast: "Flow saved"
12. Click Run → Execution modal shows progress → Toast: "Flow completed"
13. Go back to Dashboard → See flow card with status

### 2. Multisig Proposal Flow:
1. User drags Multisig node to canvas
2. Configures owners (5 public keys), threshold (3), description, expiry
3. Optionally connects Telegram node for notifications
4. Saves flow and runs it
5. Backend creates on-chain multisig proposal
6. Generates signing URL: `/sign/multisig/abc123`
7. User shares URL with owners
8. Owner opens URL → Sees proposal details
9. Clicks "Connect Wallet" → Phantom modal appears
10. Approves/rejects → Signs transaction
11. Page updates in real-time as other owners vote
12. When threshold reached → Status changes to "Executed"
13. If notification enabled → Telegram message sent

### 3. Escrow Payment Flow:
1. User drags Escrow node to canvas
2. Configures: buyer/seller/arbitrator pubkeys, amount (1.5 SOL), dispute window (7 days)
3. Connects milestone notification nodes (Email for delivered, Telegram for disputed)
4. Runs flow → Backend creates on-chain escrow account
5. Generates URL: `/escrow/xyz789`
6. Shares with participants
7. **Seller** opens URL → Clicks "Mark as Delivered"
8. **Buyer** receives email notification → Opens URL → Sees "Delivered" status
9. **Buyer** clicks "Approve" → Funds released to seller
10. **Seller** receives Telegram notification: "Payment received: 1.5 SOL"

---

## ✅ Quality Requirements

### Performance:
- **Initial Load**: < 2s (code splitting, lazy loading)
- **Page Transitions**: < 300ms (Framer Motion)
- **Canvas Rendering**: 60fps (React Flow optimizations)
- **API Calls**: < 500ms (loading states for longer)

### Accessibility (WCAG 2.1 AA):
- **Keyboard Navigation**: All interactive elements focusable
- **Screen Readers**: ARIA labels on icons, buttons, inputs
- **Contrast**: 4.5:1 minimum for text, 3:1 for UI components
- **Focus Indicators**: Visible rings on focus (not just outline: none)
- **Alt Text**: All images/icons have descriptive alt text

### Responsive Design:
- **Mobile** (320px - 768px): Single column, collapsible sidebars, bottom sheets for config
- **Tablet** (768px - 1024px): 2-column layouts, side panels collapse on demand
- **Desktop** (1024px+): Full 3-panel canvas, all features visible

### Browser Support:
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Error Handling:
- **Network Errors**: Retry button + toast
- **Validation Errors**: Inline field errors (red text below input)
- **API Errors**: User-friendly messages (not raw error codes)
- **Fallbacks**: Skeleton loaders while loading, empty states when no data

---

## 🎨 Animation Guidelines

Use Framer Motion for smooth, professional animations throughout:

### Page Transitions:
Implement entrance/exit animations for page navigation (fade, slide, or your creative choice)

### Hover Effects:
Add appropriate hover effects to interactive elements:
- **Buttons**: Scale up, shadow/glow effects, color transitions
- **Cards**: Subtle lift/scale, border effects, shadow depth
- **Nodes**: Indicate interactivity with scale or shadow

### Loading States:
- **Skeleton Loaders**: Shimmer/pulse animation while content loads
- **Spinners**: Rotating loader for async operations (use Lucide Loader2 icon)
- **Progress Bars**: Smooth fill animation

### Success/Completion Animations:
- **Confetti**: Optional celebration effect for major actions (flow executed, vote cast, escrow resolved)
- **Checkmark**: Animate checkmarks on success
- **Visual Feedback**: Brief highlight or glow on successful actions

### Micro-Interactions:
Add subtle animations to enhance UX:
- **Button Click**: Slight press effect on mousedown
- **Input Focus**: Smooth transition when focused
- **Toggle/Switch**: Smooth slide animation
- **Scroll Animations**: Elements fade/slide in as they enter viewport

---

## 📦 Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "reactflow": "^11.10.0",
    "@solana/web3.js": "^1.87.0",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.26",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "sonner": "^1.2.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "react-type-animation": "^3.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 🎯 Final Checklist

Before considering the frontend complete, ensure:

- [ ] **Landing Page**: All 7 sections implemented with 3D effects, particles, gradients
- [ ] **Dashboard**: Flow cards with CRUD actions, credential manager, theme toggle
- [ ] **Canvas**: 22 node types, drag-drop, connections, save/run, node configs
- [ ] **Signing Portals**: 3 pages (multisig, voting, escrow) with wallet integration
- [ ] **Auth Pages**: Login, sign up, demo login working
- [ ] **Design System**: Glass morphism, gradients, particles, glows consistent across all pages
- [ ] **Responsive**: Mobile/tablet/desktop layouts tested
- [ ] **Accessibility**: Keyboard nav, ARIA labels, contrast ratios compliant
- [ ] **Performance**: Lazy loading, code splitting, optimized renders
- [ ] **Error Handling**: All API calls wrapped in try-catch, user-friendly error messages
- [ ] **Loading States**: Skeletons, spinners, disabled buttons during async ops
- [ ] **Animations**: Framer Motion page transitions, hover effects, success animations
- [ ] **Real-time**: Polling/websockets for signing portals, dashboard updates
- [ ] **Testing**: Manual testing of all user flows, edge cases handled

---

## 🚀 Deployment Notes

### Environment Variables (.env):
```
VITE_API_URL=https://api.yourplatform.com
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

### Build Command:
```bash
npm run build
# Output: dist/ folder
```

### Hosting Recommendations:
- **Vercel**: Auto-deploy from Git, edge functions
- **Netlify**: Similar to Vercel, easy setup
- **Cloudflare Pages**: Fast CDN, worker support

---

## 🎨 Design Inspiration

For reference (but make your own creative decisions):
- **Modern SaaS Platforms**: Vercel, Linear, Stripe, Supabase - study their premium design quality
- **Glass Morphism**: Apple UI, iOS design language
- **Node Editors**: Figma plugins, Blender node editor, Unreal Engine Blueprints
- **Web3 Platforms**: Look at successful crypto/blockchain platforms for aesthetic inspiration
- **Design Trends**: Contemporary web design trends, 3D effects, depth, motion

---

## 💎 Pro Tips for Implementation

1. **Design System First**: Create reusable Button, Card, Input components with consistent styling
2. **Tailwind Configuration**: Set up custom colors, animations, and utilities in tailwind.config.js based on your chosen design
3. **Component Library**: Use shadcn/ui as foundation for complex components (modals, dropdowns, etc.)
4. **Type Safety**: Define TypeScript interfaces for all API responses, node data, store state
5. **Code Splitting**: Lazy load pages with React.lazy() and Suspense for performance
6. **Image Optimization**: Use WebP format, implement lazy loading
7. **SEO**: Add meta tags, OpenGraph images, proper page titles
8. **Error Boundaries**: Wrap routes in error boundaries for graceful error handling
9. **Consistency**: Maintain consistent spacing, sizing, border radius, shadows throughout
10. **Polish**: Pay attention to details - animations, loading states, empty states, error messages

---

## 🎯 User Experience Goals

- **Delight**: Users should say "Wow!" when they see the landing page
- **Clarity**: Every action should have clear feedback (toast, animation, state change)
- **Speed**: Feel fast even if backend is slow (optimistic UI updates)
- **Guidance**: First-time users should understand how to build a flow without docs
- **Trust**: Professional design instills confidence in security/reliability
- **Accessibility**: Everyone can use the platform regardless of ability

---

## 🏁 Summary

Build a **visually stunning, highly functional** Solana workflow automation platform with:
- **Beautiful Landing Page**: Modern hero section with animations, feature showcase, use cases, stats, pricing, and CTA
- **Powerful Canvas**: Drag-drop workflow builder with 22 node types across 7 categories (Triggers, AI & Logic, Blockchain, Smart Contracts, Data, Notifications, Utilities)
- **Smart Contract Integration**: Multisig, voting, escrow with public signing portals (wallet authentication, role-based actions)
- **Exceptional UX**: Smooth animations, real-time updates, intuitive flows, excellent feedback
- **Enterprise Quality**: Type-safe, accessible, responsive, performant, well-tested

**Your Creative Freedom**:
- Choose the perfect color palette for a blockchain/crypto platform
- Design the visual style (modern, professional, trustworthy)
- Decide on effects and animations that enhance UX
- Create consistent, beautiful components throughout
- Make it portfolio-quality work that you'd be proud to show

**Target Audience**: Crypto developers, DAO operators, DeFi users, NFT projects, Web3 builders

**Core Value**: Automate complex Solana workflows visually without writing code

**Key Requirement**: Make every page, component, and interaction beautiful and professional. This should look like a premium SaaS platform that users trust with their crypto operations.

---

**Now go build the most beautiful Web3 automation platform! Use your design expertise to create something exceptional. 🚀✨**
