import type { NodeHandler } from "./node-handler.interface";

/**
 * TELEGRAM NODE (Fetch-based, no dependencies)
 * 
 * Sends messages via Telegram Bot API
 * Uses simple HTTP requests instead of node-telegram-bot-api
 * 
 * Configuration (nodeData):
 * - message: string (required) - Message text with templates
 * 
 * Template Variables:
 * - Use {{input.fieldName}} to insert values from previous node
 * - Example: "Balance is {{input.balance}} SOL"
 * - Example: "Price is ${{input.price}}"
 * 
 * Environment Variables:
 * - TELEGRAM_BOT_TOKEN: Your Telegram bot token
 * - TELEGRAM_CHAT_ID: Your chat ID
 * 
 * Output:
 * {
 *   sent: boolean,
 *   text: string (final message sent),
 *   timestamp: Date
 * }
 */

export const telegramNode: NodeHandler = {
  type: "telegram",
  
  execute: async (nodeData, input, context) => {
    const { message: templateMessage } = nodeData;

    context.logger(`telegram: preparing message`);

    try {
      // ========== STEP 1: VALIDATE INPUT ==========
      if (!templateMessage) {
        throw new Error("telegram: 'message' field is required");
      }

      // ========== STEP 2: LOAD ENV VARIABLES ==========
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        throw new Error("telegram: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env");
      }

      // ========== STEP 3: TEMPLATE REPLACEMENT ==========
      let finalMessage = templateMessage;

      if (input && typeof input === "object") {
        // Replace {{input.fieldName}} with actual values
        finalMessage = templateMessage.replace(/\{\{input\.(\w+)\}\}/g, (match :any,  key : any) => {
          const value = (input as Record<string, any>)[key];
          if (value !== undefined && value !== null) {
            return String(value);
          }
          return match;
        });
      }

      context.logger(`telegram: final message = "${finalMessage}"`);

      // ========== STEP 4: SEND VIA TELEGRAM API ==========
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML", // Optional: supports HTML formatting
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API HTTP ${response.status}`);
      }

      const result = (await response.json()) as { ok: boolean; description?: string };

      if (!result.ok) {
        throw new Error(`Telegram API error: ${result.description || "Unknown"}`);
      }

      context.logger(`telegram: message sent successfully! ✅`);

      return {
        sent: true,
        text: finalMessage,
        timestamp: new Date(),
      };

    } catch (error: any) {
      context.logger(`telegram: ERROR - ${error.message}`);

      return {
        sent: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  },
};
