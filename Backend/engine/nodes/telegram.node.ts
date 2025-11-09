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
      const credential = await CredentialService.getCredential(
        credentialId,
        userId
      );

      // Decrypt the data
      const decryptedData = CredentialService.decrypt(
        credential.data as string
      );

      const { token, chatId } = decryptedData;

      if (!token || !chatId) {
        throw new Error("Invalid credential data: missing token or chatId");
      }

      // ========== TEMPLATE REPLACEMENT ==========
      let finalMessage = templateMessage;
      if (input && typeof input === "object") {
        finalMessage = templateMessage.replace(
          /\{\{input\.([\w.]+)\}\}/g, // ← Support nested paths!
          (match: any, path: any) => {
            // Split "data.outAmount" into ["data", "outAmount"]
            const keys = path.split(".");
            let value: any = input;

            // Navigate nested object
            for (const k of keys) {
              value = value?.[k];
              if (value === undefined) break;
            }

            return value !== undefined ? String(value) : match;
          }
        );
      }

      //pending transaction message
      if (
        input &&
        (input as any).requiresApproval &&
        (input as any).approvalUrl
      ) {
        const quote = (input as any).quote;

        finalMessage += `\n\n🔔 <b>Transaction Approval Required</b>\n`;
        finalMessage += `\nFrom: ${quote.inputAmount} tokens`;
        finalMessage += `\nTo: ~${quote.outputAmount} tokens`;
        finalMessage += `\nPrice Impact: ${quote.priceImpactPct}%`;
        finalMessage += `\n\n⏰ Expires in 15 minutes`;
        finalMessage += `\n\n👉 <a href="${
          (input as any).approvalUrl
        }">APPROVE TRANSACTION</a>`;
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
          parse_mode: "HTML",
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error_code?: number;
      };

      if (!result.ok) {
        throw new Error(`Telegram API error: ${result.error_code}`);
      }

      context.logger(`telegram: ✅ sent successfully!`);

      return {
        sent: true,
        text: finalMessage,
        credentialName: credential.name,
        timestamp: new Date(),
        input: input,
      };
    } catch (error: any) {
      context.logger(`telegram: ❌ ERROR - ${error.message}`);
      return {
        sent: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  },
};
