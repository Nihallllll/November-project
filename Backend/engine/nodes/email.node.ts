import { CredentialService } from "../../services/credentail.service";
import type { NodeHandler } from "./node-handler.interface";
import nodemailer from "nodemailer";


/**
 * EMAIL NODE (With Encrypted Credentials)
 */
export const emailNode: NodeHandler = {
  type: "email",
  
  execute: async (nodeData, input, context) => {
    const { credentialId, to, subject, body, html = false, userId } = nodeData;

    context.logger(`email: fetching encrypted credential`);

    try {
      // ========== VALIDATE ==========
      if (!credentialId || !userId) {
        throw new Error("credentialId and userId required");
      }

      if (!to || !subject || !body) {
        throw new Error("to, subject, and body required");
      }

      // ========== FETCH & DECRYPT CREDENTIAL ==========
      const credential = await CredentialService.getCredential(credentialId, userId);
      
      // Decrypt the data
      const emailCreds = CredentialService.decrypt(credential.data as string);

      // ========== TEMPLATE REPLACEMENT ==========
      let processedBody = body;
      let processedSubject = subject;

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

      // ========== SEND EMAIL ==========
      const transporter = nodemailer.createTransport({
        host: emailCreds.host,
        port: emailCreds.port,
        secure: emailCreds.secure,
        auth: {
          user: emailCreds.user,
          pass: emailCreds.password
        }
      });

      const mailOptions: any = {
        from: emailCreds.from || emailCreds.user,
        to: to,
        subject: processedSubject
      };

      if (html) {
        mailOptions.html = processedBody;
      } else {
        mailOptions.text = processedBody;
      }

      context.logger(`email: sending with encrypted credential`);

      const info = await transporter.sendMail(mailOptions);

      context.logger(`email: ✅ sent! Message ID: ${info.messageId}`);

      return {
        sent: true,
        messageId: info.messageId,
        to: to,
        subject: processedSubject,
        from: emailCreds.user,
        credentialName: credential.name,
        timestamp: new Date(),
        input: input
      };

    } catch (error: any) {
      context.logger(`email: ❌ ERROR - ${error.message}`);

      return {
        sent: false,
        error: error.message,
        to: to,
        timestamp: new Date()
      };
    }
  }
};
