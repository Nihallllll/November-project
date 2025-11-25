# 🧠 Mem0 AI Memory Setup Guide

## What is Mem0?

Mem0 is a memory layer for AI agents that provides:
- **Semantic memory search** - Find relevant context, not just recent messages
- **Automatic deduplication** - No redundant memories
- **Memory decay** - Old irrelevant memories fade away
- **User/session scoping** - Separate memories per user

## 🚀 Quick Setup

### Step 1: Get API Key

1. Visit [https://app.mem0.ai/](https://app.mem0.ai/)
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Create new API key
5. Copy the key

### Step 2: Configure Environment

Add to your `.env` file:
```env
MEM0_API_KEY=m0-xxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test Mem0 Node

Create a test flow:
```
Schedule → Mem0 (add) → Mem0 (search) → Telegram
```

## 📋 Mem0 Node Configuration

### Action: `add`
**Purpose:** Store new memories from conversation

**Configuration:**
```json
{
  "action": "add",
  "messages": [
    { "role": "user", "content": "What's the price of Bitcoin?" },
    { "role": "assistant", "content": "Bitcoin is currently $87,610" }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "action": "add",
  "memory_id": "mem_abc123",
  "memories": [...],
  "timestamp": "2025-11-25T..."
}
```

---

### Action: `search`
**Purpose:** Find relevant memories using semantic search

**Configuration:**
```json
{
  "action": "search",
  "query": "Bitcoin price"
}
```

**Output:**
```json
{
  "success": true,
  "action": "search",
  "query": "Bitcoin price",
  "memories": [
    {
      "id": "mem_abc123",
      "content": "Bitcoin is currently $87,610",
      "score": 0.95,
      "created_at": "2025-11-25T..."
    }
  ],
  "count": 1,
  "timestamp": "2025-11-25T..."
}
```

---

### Action: `get_all`
**Purpose:** Retrieve all memories for current user

**Configuration:**
```json
{
  "action": "get_all"
}
```

**Output:**
```json
{
  "success": true,
  "action": "get_all",
  "memories": [...],
  "count": 15,
  "timestamp": "2025-11-25T..."
}
```

---

### Action: `delete`
**Purpose:** Remove specific memory by ID

**Configuration:**
```json
{
  "action": "delete",
  "memory_id": "mem_abc123"
}
```

**Output:**
```json
{
  "success": true,
  "action": "delete",
  "memory_id": "mem_abc123",
  "timestamp": "2025-11-25T..."
}
```

## 🎯 Example Workflows

### 1. AI with Persistent Memory
```
Schedule → HTTP Request → AI Agent → Mem0 (add) → Telegram
                            ↑
                            └─ Mem0 (search)
```

The AI can:
1. Search previous memories before responding
2. Store new conversation context
3. Build long-term knowledge

### 2. Multi-Flow Memory Sharing
```
Flow A: Webhook → Mem0 (add)
Flow B: Schedule → Mem0 (search) → AI → Email
```

Memories persist across flows for the same user!

### 3. Smart Price Alerts
```
Pyth Price → Mem0 (search "last price") → Condition (changed?) → Telegram
               ↓
           Mem0 (add current price)
```

Only alert when price significantly changes by checking memory.

## 🔥 Best Practices

1. **Store structured data:**
   ```json
   {
     "role": "system",
     "content": "Bitcoin price: $87,610 at 2025-11-25T12:00:00Z"
   }
   ```

2. **Use descriptive queries:**
   - ❌ Bad: `"price"`
   - ✅ Good: `"What was Bitcoin's price yesterday?"`

3. **Clean old memories:**
   - Use `delete` action to remove outdated info
   - Mem0 auto-decays but manual cleanup helps

4. **Scope by user:**
   - Mem0 automatically uses `context.userId`
   - Each user gets isolated memories

## 📊 Pricing

- **Free Tier:** 1,000 API calls/month
- **Pro:** $29/month - 100,000 calls
- **Enterprise:** Custom pricing

Check latest pricing: [https://mem0.ai/pricing](https://mem0.ai/pricing)

## 🐛 Troubleshooting

### Error: "MEM0_API_KEY not found"
- Check `.env` file has `MEM0_API_KEY=...`
- Restart backend server after adding key

### Error: "401 Unauthorized"
- Verify API key is correct
- Check if key is expired/revoked in Mem0 dashboard

### Error: "Rate limit exceeded"
- You've hit the free tier limit (1,000 calls/month)
- Upgrade to Pro plan or wait for monthly reset

## 🆚 Mem0 vs PostgresDB Memory

| Feature | Mem0 | PostgresDB |
|---------|------|------------|
| **Semantic Search** | ✅ Yes | ❌ No |
| **Auto Deduplication** | ✅ Yes | ❌ No |
| **Memory Decay** | ✅ Yes | ❌ No |
| **Setup Complexity** | 🟢 Easy | 🟡 Medium |
| **Cost** | 💰 Free/Paid | 🆓 Free |
| **Data Ownership** | ☁️ Cloud | 🏠 Self-hosted |

**Recommendation:** Use **Mem0** for AI memory, **PostgresDB** for structured data storage.

## 📚 Resources

- **Mem0 Docs:** [https://docs.mem0.ai/](https://docs.mem0.ai/)
- **API Reference:** [https://docs.mem0.ai/api-reference](https://docs.mem0.ai/api-reference)
- **Dashboard:** [https://app.mem0.ai/](https://app.mem0.ai/)
- **Discord:** [https://discord.gg/mem0](https://discord.gg/mem0)

---

Happy building with persistent AI memory! 🧠✨
