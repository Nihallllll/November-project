# 🚀 ChainFlow Quick Start Guide

## 🎯 In 5 Minutes

### 1. Get FREE Gemini AI (Recommended!)
```
1. Visit: https://aistudio.google.com/
2. Click "Get API Key" → "Create API key"
3. Copy your key (starts with AIza...)
```

### 2. Start ChainFlow
```powershell
# Option 1: Use startup script
.\start-all.ps1

# Option 2: Manual start
cd Backend
bun run server.ts    # Terminal 1
bun run worker.ts    # Terminal 2
bun run scheduler.ts # Terminal 3

cd Frontend
npm run dev          # Terminal 4
```

### 3. Add Your Gemini Credential
```
1. Open http://localhost:5173
2. Login or register
3. Click "🔑 Credentials" button
4. Click "+ Add Credential"
5. Type: "Google Gemini (FREE)"
6. Name: "My Gemini"
7. API Key: Paste your key
8. Click "Save"
```

### 4. Create Your First Flow
```
1. Click "+ New Flow" on dashboard
2. Name it: "My First AI Flow"
3. Drag nodes from left panel:
   - Schedule Node (trigger)
   - Pyth Price Node (get crypto price)
   - AI Node (analyze with Gemini)
   - Telegram Node (send alert)
4. Connect nodes with arrows
5. Configure each node
6. Click "💾 Save Flow"
7. Click "▶️ Run" to test
```

---

## 📱 Essential Nodes

### 🤖 AI Node (Gemini)
**Get FREE AI analysis!**
```
Credential: Select "My Gemini"
Provider: Google Gemini
Model: gemini-1.5-flash (fastest)
System Prompt: "You are a crypto analyst"
User Goal: "Analyze this price data"
```

### 💰 Pyth Price Node
**Get crypto prices**
```
Coin ID: bitcoin  (or ethereum, solana, etc.)

Find more: https://api.coingecko.com/api/v3/coins/list
```

### 💬 Telegram Node
**Send notifications**
```
1. Message @BotFather on Telegram
2. Send: /newbot
3. Copy bot token
4. Add credential with token + chat ID
5. Use in node with message template
```

### ⏱️ Schedule Node
**Run automatically**
```
Interval Examples:
- 1m = Every minute
- 5m = Every 5 minutes
- 1h = Every hour
- 1d = Every day

Cron Examples:
- * * * * * = Every minute
- 0 * * * * = Every hour
- 0 9 * * * = Daily at 9 AM
```

---

## 🎨 Example Workflows

### 1️⃣ Price Alert Bot (Easiest!)
```
Schedule (1m) → Pyth Price (bitcoin) → Telegram
```
**Result:** Get Bitcoin price every minute via Telegram

### 2️⃣ AI Analysis Bot
```
Schedule (5m) → Pyth Price (solana) → AI (Gemini) → Telegram
```
**Result:** Get AI analysis of Solana price every 5 minutes

### 3️⃣ Multi-Coin Dashboard
```
Schedule (1h) → [Pyth (bitcoin), Pyth (ethereum)] → Merge → Telegram
```
**Result:** Hourly summary of BTC and ETH prices

### 4️⃣ Smart Alert
```
Schedule (1m) → Pyth Price (bitcoin) → Condition (>45000?) → Telegram
```
**Result:** Alert only when Bitcoin > $45,000

---

## 🔧 Node Configuration Tips

### Using Variables
Insert data from previous nodes:
```
Message: Bitcoin is now ${{input.price}}!
Subject: Price Alert - {{input.coinId}}
```

### AI Prompts
**Good:**
```
System: "You are a crypto market analyst with 10 years experience"
Goal: "Analyze this price data and provide actionable insights"
```

**Bad:**
```
System: "You are AI"
Goal: "Do something"
```

### Coin IDs
**Common ones:**
- Bitcoin: `bitcoin`
- Ethereum: `ethereum`  
- Solana: `solana`
- Cardano: `cardano`
- Polygon: `matic-network`
- BNB: `binancecoin`

---

## 🎛️ Dashboard Controls

### Flow Actions
- **▶️ Run** - Execute flow immediately
- **⏸️ Pause** - Stop scheduled execution
- **▶️ Resume** - Restart scheduled execution
- **⚙️ Edit** - Open in canvas
- **🗑️ Delete** - Remove flow

### Status Badge
- **● Active** (green) - Flow is running on schedule
- **○ Paused** (gray) - Flow is stopped

---

## 💡 Pro Tips

### 1. Start Simple
```
Don't build complex flows immediately!
Test each node individually first.
```

### 2. Use Gemini (It's Free!)
```
No need to pay for OpenAI/Claude
Gemini is FREE with great quality
Perfect for learning and testing
```

### 3. Check Logs
```
Run flows manually first
Check backend terminal for errors
Use Log node to debug data
```

### 4. Template Variables
```
Always use {{input.fieldName}} syntax
Test with simple messages first
Check what data previous node returns
```

### 5. Gradual Complexity
```
Start: Schedule → Pyth → Telegram
Then add: AI analysis
Then add: Conditions
Then add: Database storage
```

---

## 🐛 Quick Troubleshooting

### "Failed to save flow"
✅ Fill all required fields  
✅ Connect trigger node (Schedule/Webhook)  
✅ Check node configurations

### "Credential not found"
✅ Refresh credentials button (↻)  
✅ Add credential in Credential Manager  
✅ Select correct credential type

### "Invalid coin ID"
✅ Use lowercase: `bitcoin` not `Bitcoin`  
✅ Check list: https://api.coingecko.com/api/v3/coins/list  
✅ Try common ones first

### "Telegram failed"
✅ Verify bot token (from @BotFather)  
✅ Add bot to your chat  
✅ Get correct chat ID (@userinfobot)

### "AI not responding"
✅ Check API key is correct  
✅ Try gemini-1.5-flash first  
✅ Reduce max tokens if too long

---

## 📚 Learn More

- **Gemini Setup:** See `GEMINI_SETUP.md`
- **All Nodes:** See `NODE_CONFIGURATION_GUIDE.md`
- **Running Guide:** See `RUNNING.md`
- **Latest Changes:** See `CHANGELOG_NOV_14_2025.md`

---

## 🎯 Your First 3 Flows

### Day 1: Basic Price Check
```
Schedule (5m) → Pyth Price (bitcoin) → Telegram
```

### Day 2: Add AI Analysis  
```
Schedule (5m) → Pyth Price (solana) → AI (Gemini) → Telegram
```

### Day 3: Smart Conditional Alert
```
Schedule (1m) → Pyth Price (ethereum) → Condition (>2000?) → Telegram
```

---

## 🆘 Need Help?

1. Check documentation files
2. Test nodes individually
3. Check backend logs
4. Verify credentials
5. Try simpler flow first

---

**Remember:** 
- 🆓 Gemini is FREE!
- 🚀 Start simple, add complexity gradually
- 🧪 Test everything manually first
- 📝 Use template variables for dynamic data
- 💾 Save your flows often!

Happy automating! 🎉
