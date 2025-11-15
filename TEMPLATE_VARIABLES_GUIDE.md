# 🔧 Template Variables Troubleshooting Guide

## 📋 Common Issues with {{input.fieldName}}

### Issue 1: Seeing Literal `{{input.data}}` in Messages

**Problem:** Your Telegram/Email shows `{{input.data}}` instead of actual values.

**Root Causes:**
1. **Wrong field name** - The field doesn't exist in the input data
2. **No data from previous node** - Previous node didn't execute or returned empty
3. **Wrong syntax** - Typo in template variable

**Solution:**

1. **Check what data is available** (look at backend logs):
   ```
   telegram: input data keys: price, coinId, timestamp
   ```

2. **Use correct field names**:
   ```
   ✅ Correct: {{input.price}}
   ✅ Correct: {{input.coinId}}
   ❌ Wrong: {{input.data}}  (unless previous node returns 'data' field)
   ```

3. **Check node output structure**:
   
   **Pyth Price Node outputs:**
   ```json
   {
     "coinId": "bitcoin",
     "symbol": "BITCOIN",
     "price": 45000,
     "timestamp": "2025-11-14..."
   }
   ```
   **Use:** `{{input.price}}`, `{{input.coinId}}`
   
   **AI Node outputs:**
   ```json
   {
     "status": "success",
     "response": "AI analysis here...",
     "provider": "google",
     "model": "gemini-1.5-flash"
   }
   ```
   **Use:** `{{input.response}}`, `{{input.status}}`

---

## 📝 Template Variable Syntax

### Basic Usage
```
{{input.fieldName}}
```

### Nested Objects
```
{{input.data.price}}
{{input.result.value}}
```

### Examples by Node Type

#### From Pyth Price Node → Telegram
```
Template:
🚨 Price Alert!

Coin: {{input.coinId}}
Price: ${{input.price}}
Time: {{input.timestamp}}

Result in Telegram:
🚨 Price Alert!

Coin: bitcoin
Price: $45000
Time: 2025-11-14T05:30:00.000Z
```

#### From AI Node → Telegram
```
Template:
🤖 AI Analysis

{{input.response}}

Status: {{input.status}}
Model: {{input.model}}

Result in Telegram:
🤖 AI Analysis

Based on the current price movement, Bitcoin shows bullish momentum...

Status: success
Model: gemini-1.5-flash
```

#### Chained: Schedule → Pyth → AI → Telegram
The AI node receives Pyth's output as input, so AI sees:
```json
{
  "coinId": "bitcoin",
  "price": 45000,
  "timestamp": "..."
}
```

AI node outputs its own structure:
```json
{
  "status": "success",
  "response": "Analysis based on price...",
  "provider": "google"
}
```

Telegram receives AI's output, so use:
```
{{input.response}}  ✅
{{input.price}}     ❌ (not available, was in AI's input, not output)
```

---

## 🔍 Debugging Template Variables

### Step 1: Check Backend Logs

When Telegram node runs, look for these logs:
```
telegram: input data keys: status, response, provider, model
telegram: template: Price: {{input.price}}
telegram: replacing {{input.price}} with: [not found]
```

This tells you:
- What keys are available: `status, response, provider, model`
- What template you're using
- What values were found/not found

### Step 2: Match Available Keys

If logs show: `input data keys: status, response, provider, model`

Then you can only use:
- `{{input.status}}`
- `{{input.response}}`
- `{{input.provider}}`
- `{{input.model}}`

### Step 3: Fix Template

**Before (wrong):**
```
Bitcoin price: ${{input.price}}
```

**After (correct):**
```
AI Analysis: {{input.response}}
```

---

## 💡 Pro Tips

### 1. Test Each Node Individually

Don't build complex flows immediately. Test nodes one by one:

**Step 1:** Schedule → Telegram
```
Template: Test message
```

**Step 2:** Schedule → Pyth → Telegram
```
Template: Bitcoin: ${{input.price}}
```

**Step 3:** Schedule → Pyth → AI → Telegram
```
Template: {{input.response}}
```

### 2. Use Log Node for Debugging

Insert a Log node before Telegram to see what data is available:

```
Schedule → Pyth → Log → Telegram
```

Check backend logs for Log node output showing exact data structure.

### 3. Start Simple, Then Add Variables

**Phase 1:** Hardcoded message
```
Bitcoin alert!
```

**Phase 2:** Add one variable
```
Bitcoin: ${{input.price}}
```

**Phase 3:** Add more variables
```
Bitcoin is ${{input.price}} at {{input.timestamp}}
```

### 4. Remember Data Flow

```
Node A → Node B → Node C
```

- Node B receives output of Node A
- Node C receives output of Node B (NOT Node A!)
- Each node only sees output of its direct parent

---

## 🎯 Common Patterns

### Pattern 1: Price Alert
```
Flow: Schedule → Pyth Price → Telegram

Telegram Template:
🚨 {{input.coinId}} Price Alert

Current Price: ${{input.price}}
Symbol: {{input.symbol}}
Updated: {{input.timestamp}}
```

### Pattern 2: AI Analysis
```
Flow: Schedule → Pyth Price → AI → Telegram

AI Node:
- System Prompt: "You are a crypto analyst"
- User Goal: "Analyze this price data: {{input.price}} for {{input.coinId}}"

Telegram Template:
🤖 AI Market Analysis

{{input.response}}

Powered by {{input.provider}} ({{input.model}})
```

### Pattern 3: Conditional Alert
```
Flow: Schedule → Pyth → Condition → Telegram

Condition: input.price > 45000

Telegram Template:
⚠️ PRICE THRESHOLD EXCEEDED!

{{input.coinId}} has reached ${{input.price}}
This is above our $45,000 threshold.
```

---

## 🐛 Error Messages Explained

### "{{input.data}}" appears literally

**Cause:** Field 'data' doesn't exist in input

**Fix:** Check backend logs for available keys, use correct field name

### "undefined" appears in message

**Cause:** Field exists but value is undefined/null

**Fix:** 
- Ensure previous node completed successfully
- Check if field is optional
- Add fallback in template: `{{input.price || 'N/A'}}`

### Nested object shows "[object Object]"

**Cause:** Trying to display object without accessing specific field

**Fix:** Access specific field or the object will be stringified as JSON

**Before:**
```
Data: {{input.quote}}  // Shows: [object Object]
```

**After:**
```
Input Amount: {{input.quote.inputAmount}}
Output Amount: {{input.quote.outputAmount}}
```

---

## 📚 Node Output Reference

### Schedule Node
```json
{}  // Empty, just triggers the flow
```

### Pyth Price Node
```json
{
  "coinId": "bitcoin",
  "symbol": "BITCOIN",
  "price": 45000.00,
  "timestamp": "2025-11-14T..."
}
```

### AI Node (Success)
```json
{
  "status": "success",
  "response": "AI generated text...",
  "provider": "google",
  "model": "gemini-1.5-flash",
  "toolsUsed": 0,
  "toolResults": [],
  "tokensUsed": {
    "input": 150,
    "output": 300
  }
}
```

### AI Node (Error)
```json
{
  "status": "error",
  "error": "API key invalid",
  "provider": "google",
  "modelName": "gemini-1.5-flash"
}
```

### HTTP Request Node
```json
{
  "status": 200,
  "data": { ... },  // Response body
  "headers": { ... }
}
```

### Condition Node
Passes through input unchanged:
```json
// Whatever it received from previous node
```

---

## ✅ Quick Checklist

Before asking "why isn't {{input.field}} working?":

- [ ] Check backend logs for "input data keys"
- [ ] Verify field name spelling (case-sensitive!)
- [ ] Ensure previous node executed successfully
- [ ] Test with hardcoded message first
- [ ] Use Log node to debug data structure
- [ ] Remember: each node only sees output of previous node
- [ ] Check node output reference above

---

## 🆘 Still Not Working?

1. **Copy the backend log** showing:
   ```
   telegram: input data keys: ...
   ```

2. **Copy your template**:
   ```
   Your message with {{input.something}}
   ```

3. **Check if field exists** in the keys list

4. **If field doesn't exist**, trace back:
   - What node comes before Telegram?
   - What does that node output?
   - Use correct field from that node's output

---

**Remember:** Template variables work by replacing `{{input.fieldName}}` with the actual value from the previous node's output. The key is knowing what fields are available!

Happy automating! 🚀
