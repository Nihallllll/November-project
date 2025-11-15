# 📋 Node Configuration Guide

This guide explains how to properly configure each node type in ChainFlow.

## 🤖 AI Node

**Purpose:** Use LLM (Large Language Models) for text processing, analysis, and generation.

**Supported Providers:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- **Google Gemini (FREE!)** ⭐ Recommended for beginners
- OpenRouter (Multi-model)

**Configuration:**
1. **API Credential** (required): Select your AI API credential
2. **Provider**: Choose AI provider (Google Gemini is free!)
3. **Model**: Select specific model
4. **System Prompt**: Define AI behavior and personality
5. **User Goal**: What you want the AI to do with the input
6. **Temperature** (0-1): Creativity level (0.7 recommended)
7. **Max Tokens**: Maximum response length (2048 default)

**Example:**
```
System Prompt: "You are a crypto market analyst"
User Goal: "Analyze the price data and provide insights"
```

---

## 💰 Pyth Price Node

**Purpose:** Fetch real-time cryptocurrency prices from CoinGecko API.

**Configuration:**
1. **Coin ID** (required): CoinGecko coin identifier
   - Examples: `bitcoin`, `ethereum`, `solana`, `cardano`
   - Find IDs at: https://api.coingecko.com/api/v3/coins/list

**Common Coin IDs:**
- Bitcoin: `bitcoin`
- Ethereum: `ethereum`
- Solana: `solana`
- Cardano: `cardano`
- Polygon: `matic-network`
- BNB: `binancecoin`

**Output:**
```json
{
  "coinId": "solana",
  "symbol": "SOLANA",
  "price": 123.45,
  "timestamp": "2025-11-14T..."
}
```

---

## 💬 Telegram Node

**Purpose:** Send messages to Telegram chats via bot.

**Configuration:**
1. **Telegram Bot Credential** (required): Select bot credential
2. **Message Template** (required): Message text with variable support

**Template Variables:**
- `{{input.fieldName}}` - Insert data from previous nodes
- `{{input.price}}` - Example: Insert price from Pyth node
- `{{input.coinId}}` - Example: Insert coin name

**Example Message:**
```
🚨 Price Alert!

{{input.coinId}} is now ${{input.price}}

Time: {{input.timestamp}}
```

**Setting Up Telegram Bot:**
1. Message @BotFather on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token
4. Add bot to your channel/group
5. Get chat ID using @userinfobot

---

## 📧 Email Node

**Purpose:** Send emails using various email services.

**Supported Services:**
- Gmail OAuth2
- SendGrid
- Resend
- SMTP (any provider)

**Configuration:**
1. **Email Credential** (required): Select email service credential
2. **To** (required): Recipient email address
3. **Subject** (required): Email subject line
4. **Body** (required): Email content (supports HTML)

**Example:**
```
To: alerts@example.com
Subject: Crypto Alert - {{input.coinId}}
Body: 
The price of {{input.coinId}} has changed to ${{input.price}}.
View more at our dashboard.
```

---

## 🗄️ PostgreSQL Database Node

**Purpose:** Read from or write to PostgreSQL databases.

**Configuration:**
1. **Database Credential** (required): Select PostgreSQL connection
2. **Operation**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
3. **SQL Query** (required): SQL statement to execute

**Example Queries:**

**Read (SELECT):**
```sql
SELECT * FROM users WHERE email = 'user@example.com'
```

**Write (INSERT):**
```sql
INSERT INTO prices (coin, price, timestamp) 
VALUES ('{{input.coinId}}', {{input.price}}, NOW())
```

**Update:**
```sql
UPDATE alerts SET triggered = true 
WHERE coin = '{{input.coinId}}'
```

---

## 🌐 HTTP Request Node

**Purpose:** Make HTTP requests to external APIs.

**Configuration:**
1. **Method** (required): `GET`, `POST`, `PUT`, `DELETE`
2. **URL** (required): Full API endpoint URL
3. **Request Body** (optional): JSON payload for POST/PUT

**Example GET:**
```
Method: GET
URL: https://api.example.com/data
```

**Example POST:**
```
Method: POST
URL: https://api.example.com/webhook
Body:
{
  "coin": "{{input.coinId}}",
  "price": {{input.price}}
}
```

---

## 🔄 Condition Node

**Purpose:** Branch flow based on conditions (if-then-else logic).

**Configuration:**
1. **Condition** (required): JavaScript expression that returns true/false

**Example Conditions:**

**Price threshold:**
```javascript
input.price > 100
```

**String comparison:**
```javascript
input.coinId === 'bitcoin'
```

**Multiple conditions:**
```javascript
input.price > 100 && input.coinId === 'solana'
```

**Range check:**
```javascript
input.price >= 50 && input.price <= 150
```

---

## ⏱️ Schedule Node

**Purpose:** Trigger flow execution on a schedule.

**Configuration:**
1. **Interval** (option 1): Simple time interval
   - Examples: `1m`, `5m`, `1h`, `1d`
   
2. **Cron Expression** (option 2): Advanced scheduling
   - Examples:
     - `* * * * *` - Every minute
     - `0 * * * *` - Every hour
     - `0 9 * * *` - Daily at 9 AM
     - `0 9 * * 1` - Every Monday at 9 AM

**Cron Format:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sunday = 0 or 7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

---

## ⏳ Delay Node

**Purpose:** Pause execution for a specified duration.

**Configuration:**
1. **Duration** (required): Milliseconds to delay
   - 1000 = 1 second
   - 60000 = 1 minute
   - 3600000 = 1 hour

**Example:** Delay 5 seconds between API calls
```
Duration: 5000
```

---

## 🔀 Merge Node

**Purpose:** Combine outputs from multiple nodes.

**Configuration:**
- No configuration needed
- Automatically merges all incoming connections

**Use Case:** Combine data from multiple APIs before processing

---

## 📝 Log Node

**Purpose:** Log data for debugging.

**Configuration:**
1. **Message** (optional): Custom log message

**Use Case:** Debug flows by logging intermediate data

---

## 🪙 Solana RPC Node

**Purpose:** Interact with Solana blockchain.

**Configuration:**
1. **RPC Method** (required): Method name
   - `getAccountInfo`
   - `getBalance`
   - `getTokenAccountBalance`
   - etc.

2. **Parameters** (required): JSON array of parameters

**Example:**
```
Method: getBalance
Parameters: ["7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"]
```

---

## 🎯 Jupiter Node

**Purpose:** Swap tokens on Solana using Jupiter aggregator.

**Configuration:**
1. **Input Token Mint** (required): Source token address
2. **Output Token Mint** (required): Destination token address
3. **Amount** (required): Amount to swap

---

## 🔗 Webhook Node

**Purpose:** Receive HTTP webhooks to trigger flows.

**Configuration:**
1. **Webhook Path** (required): Custom URL path
   - Example: `/webhook/my-flow`
   - Full URL: `http://your-domain.com/webhook/my-flow`

---

## 👀 Watch Wallet Node

**Purpose:** Monitor Solana wallet for activity.

**Configuration:**
1. **Wallet Address** (required): Solana wallet to monitor
2. **Check Interval** (required): Seconds between checks (60 default)

---

## 🔍 Helius Indexer Node

**Purpose:** Query Solana transaction data via Helius.

**Configuration:**
1. **Account Address** (required): Solana account to query
2. **Transaction Types** (optional): Filter by type
   - `ANY`, `NFT_SALE`, `TRANSFER`, etc.

---

## 📊 Token Program Node

**Purpose:** Interact with SPL Token program on Solana.

**Configuration:**
1. **Instruction** (required): `transfer`, `mint`, `burn`
2. **Token Mint** (required): SPL token address
3. **Amount** (required): Number of tokens

---

## 💡 Best Practices

### Variable Usage
Always use `{{input.fieldName}}` syntax to reference data from previous nodes.

### Error Handling
- Test nodes individually before connecting them
- Check logs for error messages
- Verify credentials are correctly configured

### Performance
- Use appropriate delay between API calls
- Choose efficient cron schedules
- Use Gemini Flash model for faster responses

### Security
- Never hardcode API keys in node configurations
- Use Credential Manager for all sensitive data
- Rotate credentials regularly

---

## 🐛 Common Issues

### "Failed to save flow"
- Check all required fields are filled
- Verify node connections are valid
- Ensure flow has at least one trigger node

### "Credential not found"
- Refresh credentials in node configuration
- Verify credential exists in Credential Manager
- Check credential type matches node type

### "Invalid coin ID"
- Verify coin ID exists on CoinGecko
- Use lowercase names: `bitcoin` not `Bitcoin`
- Check https://api.coingecko.com/api/v3/coins/list

### "Telegram message failed"
- Verify bot token is correct
- Ensure bot is added to chat
- Check chat ID is correct (use @userinfobot)

---

## 🚀 Example Workflows

### 1. Price Alert Bot
```
Schedule Node → Pyth Price Node → Condition Node → Telegram Node
```

### 2. AI Analysis
```
HTTP Request → AI Node (Gemini) → Email Node
```

### 3. Database Logger
```
Schedule → Pyth Price → PostgreSQL Node
```

### 4. Multi-Source Alert
```
Pyth Price ─┐
            ├→ Merge Node → AI Analysis → Telegram
Jupiter ────┘
```

Happy building! 🎉
