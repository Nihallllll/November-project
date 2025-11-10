import { CredentialService } from "../../services/credentail.service";
import type { NodeHandler } from "./node-handler.interface";
import nodemailer from "nodemailer";

/**
 * EMAIL NODE (With Encrypted Credentials)
 * 
 * Configuration (nodeData):
 * - credentialId: string (required) - Email credential ID
 * - userId: string (required) - User ID
 * - to: string (required) - Recipient email address
 * - subject: string (required) - Email subject
 * - body: string (required) - Email body content
 * - html: boolean (optional) - Send as HTML email (default: false)
 * 
 * Credential Structure (encrypted):
 * {
 *   host: "smtp.gmail.com",
 *   port: 587,
 *   secure: false,
 *   user: "your@email.com",
 *   pass: "your-app-password"
 * }
 */
export const emailNode: NodeHandler = {
  type: "email",

  execute: async (nodeData, input, context) => {
    const { credentialId, to, subject, body, html = false, userId } = nodeData;

    context.logger(`email: fetching encrypted credential`);

    try {
      // ========== VALIDATE ==========
      if (!credentialId || !userId) {
        throw new Error("credentialId and userId are required");
      }

      if (!to || !subject || !body) {
        throw new Error("to, subject, and body are required");
      }

      // ========== FETCH & DECRYPT CREDENTIAL ==========
      const credential = await CredentialService.getCredential(
        credentialId,
        userId
      );

      if (credential.type !== 'email') {
        throw new Error(`Invalid credential type: expected 'email', got '${credential.type}'`);
      }

      // Decrypt the data
      const emailCreds = CredentialService.decrypt(credential.data as string);

      // ========== VALIDATE CREDENTIAL DATA ==========
      if (!emailCreds.host || !emailCreds.port || !emailCreds.user || !emailCreds.pass) {
        throw new Error("Invalid email credential: missing host, port, user, or pass");
      }

      context.logger(`email: credential validated - ${emailCreds.host}:${emailCreds.port}`);

      // ========== TEMPLATE REPLACEMENT ==========
      let processedBody = body;
      let processedSubject = subject;

      // Replace {{input.key}} placeholders with input data
      if (input && typeof input === "object") {
        const replaceTemplates = (text: string) => {
          return text.replace(/\{\{input\.(\w+)\}\}/g, (match, key) => {
            const value = (input as Record<string, any>)[key];
            return value !== undefined ? String(value) : match;
          });
        };

        processedBody = replaceTemplates(body);
        processedSubject = replaceTemplates(subject);
      }

      // Special handling for transaction approval (Jupiter swap, etc.)
      if (
        input &&
        (input as any).requiresApproval &&
        (input as any).approvalUrl
      ) {
        const quote = (input as any).quote;

        const approvalSection = `

================================
TRANSACTION APPROVAL REQUIRED
================================

From: ${quote.inputAmount} tokens
To: ~${quote.outputAmount} tokens
Price Impact: ${quote.priceImpactPct}%

⏰ This transaction expires in 15 minutes

👉 Approve Transaction: ${(input as any).approvalUrl}

================================
`;

        processedBody += approvalSection;
      }

      context.logger(`email: sending to ${to}`);

      // ========== CREATE TRANSPORTER ==========
      const transporter = nodemailer.createTransport({
        host: emailCreds.host,
        port: Number(emailCreds.port),
        secure: emailCreds.secure === true || emailCreds.secure === "true", // true for 465, false for 587
        auth: {
          user: emailCreds.user,
          pass: emailCreds.pass,  // ✅ FIXED: was emailCreds.password
        },
      });

      // ========== SEND EMAIL ==========
      const mailOptions: any = {
        from: emailCreds.from || emailCreds.user,
        to: to,
        subject: processedSubject,
      };

      if (html) {
        mailOptions.html = processedBody;
      } else {
        mailOptions.text = processedBody;
      }

      const info = await transporter.sendMail(mailOptions);

      context.logger(`email: ✅ sent successfully! Message ID: ${info.messageId}`);

      return {
        sent: true,
        messageId: info.messageId,
        to: to,
        subject: processedSubject,
        from: emailCreds.user,
        credentialName: credential.name,
        timestamp: new Date(),
        input: input,
      };
    } catch (error: any) {
      context.logger(`email: ❌ ERROR - ${error.message}`);

      // Return error object instead of throwing
      return {
        sent: false,
        error: error.message,
        to: to,
        timestamp: new Date(),
      };
    }
  },
};
