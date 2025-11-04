import prisma from "../../config/database";
import type { NodeHandler } from "./node-handler.interface";


/**
 * TELEGRAM NODE (Database Credentials Version)
 * 
 * Configuration (nodeData):
 * - credentialId: string (required) - ID of stored Telegram credential
 * - message: string (required) - Message text with templates
 * 
 * Template Variables:
 * - Use {{input.fieldName}} to insert values from previous node
 * - Example: "Balance is {{input.balance}} SOL"
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
    const { credentialId, message: templateMessage, userId } = nodeData;

    context.logger(`telegram: preparing message`);

    try {
      // ========== STEP 1: VALIDATE INPUT ==========
      if (!credentialId) {
        throw new Error("credentialId is required in node data");
      }

      if (!templateMessage) {
        throw new Error("message is required in node data");
      }

      // ========== STEP 2: FETCH CREDENTIAL FROM DATABASE ==========
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          type: "telegram",
          userId: userId,
          isActive: true
        }
      });

      if (!credential) {
        throw new Error(`Telegram credential not found: ${credentialId}`);
      }

      // Parse credential data
      const credData = typeof credential.data === 'string' 
        ? JSON.parse(credential.data) 
        : credential.data;

      const { token, chatId } = credData;

      if (!token || !chatId) {
        throw new Error("Invalid credential data: missing token or chatId");
      }

      // ========== STEP 3: TEMPLATE REPLACEMENT ==========
      let finalMessage = templateMessage;
      
      if (input && typeof input === "object") {
        finalMessage = templateMessage.replace(/\{\{input\.(\w+)\}\}/g, (match : any, key : any) => {
          const value = (input as Record<string, any>)[key];
          return value !== undefined ? String(value) : match;
        });
      }

      // ========== STEP 4: SEND TELEGRAM MESSAGE ==========
      const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

      context.logger(`telegram: sending message to chat ${chatId}`);

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML",
        }),
      });

      const result = (await response.json()) as { ok: boolean; error_code?: number; description?: string };

      if (!result.ok) {
        throw new Error(
          `Telegram API error: ${result.error_code} - ${result.description}`
        );
      }

      context.logger(`telegram: ✅ sent successfully!`);

      // ========== STEP 5: RETURN RESULT ==========
      return {
        sent: true,
        text: finalMessage,
        credentialName: credential.name,
        timestamp: new Date(),
        input: input
      };

    } catch (error: any) {
      context.logger(`telegram: ❌ ERROR - ${error.message}`);

      return {
        sent: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
};
