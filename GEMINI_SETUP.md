# 🚀 Google Gemini API Setup (FREE!)

Google Gemini offers **FREE API access** through Google AI Studio, making it perfect for testing and development!

## ✨ Why Gemini?

- ✅ **Completely FREE** (with generous rate limits)
- ✅ **No credit card required**
- ✅ **Fast model (gemini-1.5-flash)**
- ✅ **State-of-the-art AI capabilities**
- ✅ **Easy to get API key**

## 📝 How to Get Your FREE Gemini API Key

### Step 1: Visit Google AI Studio

Go to: **https://aistudio.google.com/**

### Step 2: Sign in with Google Account

- Use any Google account (Gmail)
- No payment information required

### Step 3: Get API Key

1. Click on **"Get API Key"** button in the left sidebar
2. Click **"Create API key"**
3. Select **"Create API key in new project"** or use existing project
4. Copy your API key (starts with `AIza...`)

**⚠️ Important:** Keep your API key secure! Don't share it publicly.

## 🔧 Add Gemini to ChainFlow

### Step 1: Open Credential Manager

1. Go to Dashboard
2. Click **"🔑 Credentials"** button in the top right

### Step 2: Add Google Gemini Credential

1. Click **"+ Add Credential"**
2. Select **"Google Gemini (FREE)"** from the type dropdown
3. Enter a name: `My Gemini API`
4. Paste your API key in the **API Key** field
5. Click **"Save"**

✅ Your Gemini credential is now securely encrypted and stored!

## 🎯 Use Gemini in AI Node

### Step 1: Add AI Node to Canvas

1. Drag **"AI"** node from the node palette
2. Click on the node to open configuration

### Step 2: Configure AI Node

1. **API Credential**: Select your Gemini credential
2. **Provider**: Select **"Google Gemini"**
3. **Model**: Choose from:
   - `gemini-1.5-pro` - Most capable (best quality)
   - `gemini-1.5-flash` - **Fastest (recommended)** ⚡
   - `gemini-1.0-pro` - Stable version

4. **System Prompt**: Set AI behavior
   ```
   You are a helpful assistant for Solana blockchain automation.
   ```

5. **User Goal**: What you want the AI to do
   ```
   Analyze the transaction data and provide insights.
   ```

6. **Temperature**: 0.7 (creativity level, 0-1)
7. **Max Tokens**: 2048 (response length)

### Step 3: Connect and Run

1. Connect input nodes (e.g., Schedule, HTTP Request)
2. Connect output nodes (e.g., Telegram, Email)
3. Save flow
4. Click **"Run"** to test!

## 📊 Available Gemini Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| gemini-1.5-flash | ⚡⚡⚡ Fastest | ⭐⭐⭐ Good | Quick responses, high volume |
| gemini-1.5-pro | ⚡⚡ Fast | ⭐⭐⭐⭐⭐ Best | Complex reasoning, analysis |
| gemini-1.0-pro | ⚡⚡ Fast | ⭐⭐⭐⭐ Great | General purpose |

## 💡 Example Use Cases

### 1. Crypto Price Analysis
```
System Prompt: You are a crypto market analyst.
User Goal: Analyze the current price data and provide trading insights.
```

### 2. Smart Contract Explainer
```
System Prompt: You are a Solana blockchain expert.
User Goal: Explain what this transaction does in simple terms.
```

### 3. Alert Generator
```
System Prompt: You are a financial alert system.
User Goal: Generate a concise alert message for this price movement.
```

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
2. **Use environment variables** for production
3. **Rotate keys regularly** (every 90 days)
4. **Use API key restrictions** in Google AI Studio:
   - Set IP restrictions
   - Set API restrictions to only "Generative Language API"

## 📈 Rate Limits (FREE Tier)

- **Gemini 1.5 Flash**: 15 requests per minute (RPM)
- **Gemini 1.5 Pro**: 2 RPM
- **Daily quota**: Generous (check Google AI Studio dashboard)

For higher limits, you can upgrade to paid tier, but free tier is perfect for development!

## 🆚 Comparison with Other Providers

| Provider | Free Tier | Speed | Quality | Setup |
|----------|-----------|-------|---------|-------|
| **Google Gemini** | ✅ YES | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Easy |
| OpenAI | ❌ Paid | ⚡⚡ | ⭐⭐⭐⭐⭐ | Easy |
| Anthropic | ❌ Paid | ⚡⚡ | ⭐⭐⭐⭐⭐ | Easy |
| OpenRouter | ✅ Credits | ⚡⚡ | ⭐⭐⭐⭐ | Medium |

## 🐛 Troubleshooting

### Error: "API key not valid"
- Check if you copied the full key (starts with `AIza`)
- Verify the API key in Google AI Studio
- Make sure "Generative Language API" is enabled

### Error: "Quota exceeded"
- Wait a minute and try again
- Check rate limits in Google AI Studio dashboard
- Consider using gemini-1.5-flash for higher RPM

### Error: "Model not found"
- Use exact model names: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-1.0-pro`
- Check spelling and capitalization

## 📚 Additional Resources

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing & Quotas**: https://ai.google.dev/pricing
- **Model Card**: https://ai.google.dev/models/gemini

## 🎉 You're Ready!

You now have **FREE AI capabilities** in your ChainFlow workflows! 

Try building:
- 🤖 Automated crypto alerts
- 📊 Transaction analyzers
- 💬 Smart chatbots
- 🔍 Data processors

Happy automating! 🚀
