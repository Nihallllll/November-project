import type { NodeHandler } from "./node-handler.interface";
import nodemailer from "nodemailer";

/**
 * EMAIL NODE (Simple .env Version)
 * 
 * Sends emails using SMTP credentials from .env
 * 
 * Configuration (nodeData):
 * - to: string (required) - Recipient email(s), comma-separated
 * - subject: string (required) - Email subject
 * - body: string (required) - Email body
 * - html?: boolean (optional) - Is body HTML? Default: false
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
    
    const { to, subject, body, html = false } = nodeData;
    
    if (!to) {
      throw new Error("email: 'to' field is required");
    }
    
    if (!subject) {
      throw new Error("email: 'subject' field is required");
    }
    
    if (!body) {
      throw new Error("email: 'body' field is required");
    }
    
    context.logger(`email: preparing to send to ${to}`);
    
    try {
      // ========== STEP 2: LOAD SMTP CONFIG FROM .ENV ==========
      
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      };
      
      // Validate .env is set
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        throw new Error("email: EMAIL_USER and EMAIL_PASSWORD must be set in .env");
      }
      
      // ========== STEP 3: TEMPLATE REPLACEMENT ==========
      
      // Replace {{input.field}} with actual values
      let processedBody = body;
      let processedSubject = subject;
      
      if (input) {
        const replaceTemplates = (text: string) => {
          return text.replace(/\{\{input\.(\w+)\}\}/g, (match, key) => {
            return input[key] !== undefined ? String(input[key]) : match;
          });
        };
        
        processedBody = replaceTemplates(body);
        processedSubject = replaceTemplates(subject);
      }
      
      // ========== STEP 4: CREATE TRANSPORTER ==========
      
      const transporter = nodemailer.createTransport(emailConfig);
      
      // ========== STEP 5: PREPARE EMAIL ==========
      
      const mailOptions: any = {
        from: process.env.EMAIL_FROM || emailConfig.auth.user,
        to: to,
        subject: processedSubject,
      };
      
      // Set body as HTML or plain text
      if (html) {
        mailOptions.html = processedBody;
      } else {
        mailOptions.text = processedBody;
      }
      
      // ========== STEP 6: SEND EMAIL ==========
      
      context.logger(`email: sending to ${to} with subject "${processedSubject}"`);
      
      const info = await transporter.sendMail(mailOptions);
      
      context.logger(`email: sent successfully! Message ID: ${info.messageId}`);
      
      // ========== STEP 7: RETURN RESULT ==========
      
      return {
        sent: true,
        messageId: info.messageId,
        to: to,
        subject: processedSubject,
        from: mailOptions.from,
        timestamp: new Date(),
        input: input // Pass through input to next node
      };
      
    } catch (error: any) {
      // ========== ERROR HANDLING ==========
      
      context.logger(`email: failed - ${error.message}`);
      
      return {
        sent: false,
        error: error.message,
        to: to,
        subject: subject,
        timestamp: new Date()
      };
    }
  }
};
