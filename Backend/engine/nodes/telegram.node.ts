import type { NodeHandler } from "./node-handler.interface";
import TelegramBot from "node-telegram-bot-api";

/**
 * TELEGRAM NODE (Simple .env Version)
 * 
 * Sends messages via Telegram Bot
 * 
 * Configuration (nodeData):
 * - message: string (required) - Message text to send
 * - chatId?: string (optional) - Override default chat ID from .env
 * - parseMode?: string (optional) - 'Markdown', 'HTML', or undefined
 * 
 * Template Variables:
 * - Use {{input.fieldName}} to insert values from previous node
 * - Example: "Balance is {{input.balance}} SOL"
 * 
 * Input:
 * - Previous node output (used for template replacement)
 * 
 * Output:
 * {
 *   sent: boolean,
 *   messageId: number,
 *   chatId: string,
 *   text: string,
 *   timestamp: Date
 * }
 */

export const telegramNode: NodeHandler = {
  type: "telegram",
  
  execute: async (nodeData, input, context) => {
    // ========== STEP 1: VALIDATE INPUT ==========
    
    const { message, chatId, parseMode } = nodeData;
    
    if (!message) {
      throw new Error("telegram: 'message' field is required");
    }
    
    context.logger(`telegram: preparing to send message`);
    
    try {
      // ========== STEP 2: LOAD CONFIG FROM .ENV ==========
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const defaultChatId = process.env.TELEGRAM_CHAT_ID;
      
      if (!botToken) {
        throw new Error("telegram: TELEGRAM_BOT_TOKEN must be set in .env");
      }
      
      if (!defaultChatId && !chatId) {
        throw new Error("telegram: TELEGRAM_CHAT_ID must be set in .env or provided in nodeData");
      }
      
      const targetChatId = chatId || defaultChatId!;
      
      // ========== STEP 3: TEMPLATE REPLACEMENT ==========
      
      let processedMessage = message;
      
      if (input) {
        const replaceTemplates = (text: string) => {
          return text.replace(/\{\{input\.(\w+)\}\}/g, (match, key) => {
            return input[key] !== undefined ? String(input[key]) : match;
          });
        };
        
        processedMessage = replaceTemplates(message);
      }
      
      // ========== STEP 4: CREATE BOT INSTANCE ==========
      
      // Create bot without polling (we're just sending messages)
      const bot = new TelegramBot(botToken, { polling: false });
      
      // ========== STEP 5: PREPARE MESSAGE OPTIONS ==========
      
      const options: any = {};
      
      if (parseMode === 'Markdown' || parseMode === 'HTML') {
        options.parse_mode = parseMode;
      }
      
      // ========== STEP 6: SEND MESSAGE ==========
      
      context.logger(`telegram: sending message to chat ${targetChatId}`);
      
      const sentMessage = await bot.sendMessage(targetChatId, processedMessage, options);
      
      context.logger(`telegram: sent successfully! Message ID: ${sentMessage.message_id}`);
      
      // ========== STEP 7: RETURN RESULT ==========
      
      return {
        sent: true,
        messageId: sentMessage.message_id,
        chatId: targetChatId,
        text: processedMessage,
        timestamp: new Date(),
        input: input // Pass through input to next node
      };
      
    } catch (error: any) {
      // ========== ERROR HANDLING ==========
      
      context.logger(`telegram: failed - ${error.message}`);
      
      return {
        sent: false,
        error: error.message,
        message: message,
        timestamp: new Date()
      };
    }
  }
};
