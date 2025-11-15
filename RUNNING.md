# ChainFlow - Running the Application

## Prerequisites

1. **Bun** - Backend runtime ([Install Bun](https://bun.sh))
2. **Node.js & npm** - Frontend dependencies ([Install Node](https://nodejs.org))
3. **Docker** - For Redis ([Install Docker](https://www.docker.com))
4. **PostgreSQL** - Database (using Neon cloud database via DATABASE_URL in .env)

## Quick Start

### Option 1: Using PowerShell Script (Recommended)

Run the automated startup script:

```powershell
.\start-all.ps1
```

This will:
- ✅ Check and start Redis container
- ✅ Start Backend Server (port 3000)
- ✅ Start Worker Process
- ✅ Start Scheduler Process
- ✅ Start Frontend (port 5173)

### Option 2: Manual Start

#### 1. Start Redis

```powershell
docker run -d -p 6379:6379 --name redis redis:alpine
```

Or if container already exists:
```powershell
docker start redis
```

#### 2. Start Backend Services (3 separate terminals)

**Terminal 1 - API Server:**
```powershell
cd Backend
bun run server.ts
```

**Terminal 2 - Job Worker:**
```powershell
cd Backend
bun run worker.ts
```

**Terminal 3 - Scheduler:**
```powershell
cd Backend
bun run scheduler.ts
```

#### 3. Start Frontend

```powershell
cd Frontend
npm run dev
```

## Service URLs

- **Frontend UI**: http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API**: http://localhost:3000
- **API Base Path**: http://localhost:3000/api/v1
- **Redis**: localhost:6379

## Architecture

```
┌─────────────┐
│  Frontend   │ ← React + Vite (Port 5173)
│  (React)    │
└──────┬──────┘
       │
       ↓ HTTP/REST
┌─────────────┐
│   Backend   │ ← Express + Bun (Port 3000)
│   Server    │
└──────┬──────┘
       │
       ├──→ PostgreSQL (Neon Cloud)
       │
       ↓
┌─────────────┐
│    Redis    │ ← Job Queue (Port 6379)
└──────┬──────┘
       │
       ├──→ Worker (processes jobs)
       │
       └──→ Scheduler (checks scheduled flows)
```

## Key Features

### Flow Management
- ✅ Create, edit, delete flows
- ✅ Visual node-based editor
- ✅ Save and load flows
- ✅ **Pause/Resume flows** - Control flow execution
- ✅ Manual flow execution
- ✅ Scheduled flow execution

### Authentication
- ✅ JWT-based auth
- ✅ User registration and login
- ✅ Protected routes
- ✅ Demo mode available

### Credential Management
- ✅ Encrypted credential storage (AES-256-GCM)
- ✅ Support for API keys, database connections
- ✅ Secure credential handling in flows

### Supported Nodes

**Triggers:**
- Schedule (cron/interval)
- Webhook
- Watch Wallet

**Actions:**
- HTTP Request
- Telegram
- Email
- AI (Claude/GPT/**Gemini FREE!** ⭐)
- Solana RPC
- Token Program
- Jupiter (Swap)
- Postgres DB
- Helius Indexer

**Logic:**
- Condition
- Delay
- Merge
- Log

**🆕 New: Google Gemini Support (FREE!)**
- Get free API key at https://aistudio.google.com/
- No credit card required
- See GEMINI_SETUP.md for detailed setup guide
- Recommended for beginners and testing

## Troubleshooting

### Redis Connection Error
```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis if not running
docker start redis
```

### Port Already in Use
```bash
# Backend (3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Frontend (5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Database Connection Issues
- Verify `DATABASE_URL` in `Backend/.env`
- Ensure Neon database is accessible
- Run Prisma migration: `cd Backend && bunx prisma migrate dev`

### Worker Not Processing Jobs
- Check Redis connection
- Verify worker.ts is running
- Check backend logs for errors

## Development Notes

### UI Zoom Setting
The application is optimized for 90% zoom (`style={{ zoom: 0.9 }}`). This provides:
- Better spacing on the canvas
- More readable node configuration panel
- Optimal layout for node palette

### Pause/Resume Flow
- Click **Pause** button to set flow status to `INACTIVE`
- Click **Resume** button to set flow status to `ACTIVE`
- Only `ACTIVE` flows will be executed by the scheduler
- Status badge updates in real-time

### Node Configuration Panel
- **Width**: 384px (w-96)
- **Padding**: 20px (p-5)
- **Scrollable**: Content area auto-scrolls
- **Responsive**: Adapts to node type

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
ENCRYPTION_KEY="your-32-char-key"
JWT_SECRET="your-secret"
REDIS_URL="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## API Endpoints

### Auth
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user

### Flows
- GET `/api/v1/flows` - List all flows
- POST `/api/v1/flows` - Create flow
- GET `/api/v1/flows/:id` - Get flow details
- PUT `/api/v1/flows/:id` - Update flow
- **PATCH `/api/v1/flows/:id/toggle`** - Pause/Resume flow ⭐
- DELETE `/api/v1/flows/:id` - Delete flow
- POST `/api/v1/flows/:id/run` - Execute flow

### Credentials
- GET `/api/v1/users/:userId/credentials` - List credentials
- POST `/api/v1/users/:userId/credentials` - Create credential
- DELETE `/api/v1/users/:userId/credentials/:id` - Delete credential

## License

MIT
