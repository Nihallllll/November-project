import { CredentialService } from "../../services/credentail.service";
import type { NodeHandler } from "./node-handler.interface";


/**
 * TELEGRAM NODE (With Encrypted Credentials)
 */
export const telegramNode: NodeHandler = {
  type: "telegram",
  
  execute: async (nodeData, input, context) => {
    const { credentialId, message: templateMessage, userId } = nodeData;

    context.logger(`telegram: fetching encrypted credential`);

    try {
      // ========== VALIDATE ==========
      if (!credentialId || !userId) {
        throw new Error("credentialId and userId required");
      }

      if (!templateMessage) {
        throw new Error("message template required");
      }

      // ========== FETCH & DECRYPT CREDENTIAL ==========
      const credential = await CredentialService.getCredential(credentialId, userId);
      
      // Decrypt the data
      const decryptedData = CredentialService.decrypt(credential.data as string);
      
      const { token, chatId } = decryptedData;

      if (!token || !chatId) {
        throw new Error("Invalid credential data: missing token or chatId");
      }

      // ========== TEMPLATE REPLACEMENT ==========
      let finalMessage = templateMessage;
      if (input && typeof input === "object") {
        finalMessage = templateMessage.replace(/\{\{input\.(\w+)\}\}/g, (match: any, key : any) => {
          const value = (input as Record<string, any>)[key];
          return value !== undefined ? String(value) : match;
        });
      }

      // ========== SEND MESSAGE ==========
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      
      context.logger(`telegram: sending encrypted credential message`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: finalMessage,
          parse_mode: "HTML"
        })
      });

      const result = await response.json() as { ok: boolean; error_code?: number };

      if (!result.ok) {
        throw new Error(`Telegram API error: ${result.error_code}`);
      }

      context.logger(`telegram: ✅ sent successfully!`);

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
