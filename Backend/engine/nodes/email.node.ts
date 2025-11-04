import prisma from "../../config/database";
import type { NodeHandler } from "./node-handler.interface";
import nodemailer from "nodemailer";


/**
 * EMAIL NODE (Database Credentials Version)
 * 
 * Configuration (nodeData):
 * - credentialId: string (required) - ID of stored email credential
 * - to: string (required) - Recipient email(s), comma-separated
 * - subject: string (required) - Email subject
 * - body: string (required) - Email body
 * - html?: boolean (optional) - Is body HTML? Default: false
 * 
 * Template Variables:
 * - Use {{input.fieldName}} to insert values from previous node
 * - Example: "Balance is {{input.balance}} SOL"
 * 
 * Output:
 * {
 *   sent: boolean,
 *   messageId: string,
 *   to: string,
 *   subject: string,
 *   timestamp: Date
 * }
 */

export const emailNode: NodeHandler = {
  type: "email",
  
  execute: async (nodeData, input, context) => {
    // ========== STEP 1: VALIDATE INPUT ==========
    const { credentialId, to, subject, body, html = false, userId } = nodeData;

    if (!credentialId) {
      throw new Error("credentialId is required in node data");
    }

    if (!to || !subject || !body) {
      throw new Error("to, subject, and body are required in node data");
    }

    context.logger(`email: preparing to send to ${to}`);

    try {
      // ========== STEP 2: FETCH CREDENTIAL FROM DATABASE ==========
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          type: "email",
          userId: userId,
          isActive: true
        }
      });

      if (!credential) {
        throw new Error(`Email credential not found: ${credentialId}`);
      }

      // Parse credential data
      const emailCreds = typeof credential.data === 'string' 
        ? JSON.parse(credential.data) 
        : credential.data;

      // ========== STEP 3: TEMPLATE REPLACEMENT ==========
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

      // ========== STEP 4: CREATE TRANSPORTER ==========
      const transporter = nodemailer.createTransport({
        host: emailCreds.host,
        port: emailCreds.port,
        secure: emailCreds.secure,
        auth: {
          user: emailCreds.user,
          pass: emailCreds.password
        }
      });

      // ========== STEP 5: PREPARE EMAIL ==========
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

      // ========== STEP 6: SEND EMAIL ==========
      context.logger(`email: sending from ${emailCreds.user} to ${to}`);

      const info = await transporter.sendMail(mailOptions);

      context.logger(`email: ✅ sent! Message ID: ${info.messageId}`);

      // ========== STEP 7: RETURN RESULT ==========
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
