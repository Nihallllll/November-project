/**
 * ================================================================
 * MULTI-PROVIDER EMAIL NODE - PRODUCTION READY + OAUTH2
 * ================================================================
 * 
 * Built with latest official APIs (November 2025)
 * 
 * Supported Providers:
 * - Resend v6.4.2 (RECOMMENDED - Free 3,000/month)
 * - SendGrid @sendgrid/mail v7.x (Free 100/day)
 * - Postmark v4.0.5 (Free 100/month)
 * - SMTP via nodemailer (Gmail, Outlook, etc.)
 * - Gmail OAuth2 (Secure Gmail integration)
 * - Microsoft OAuth2 (Outlook/Office 365)
 * 
 * Documentation:
 * - Gmail OAuth2: https://nodemailer.com/smtp/oauth2/
 * - Microsoft OAuth2: https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth
 * 
 * @author Your Name
 * @version 3.0.0
 * @date November 2025
 * ================================================================
 */

import { CredentialService } from "../../services/credentail.service";
import type { NodeHandler } from "./node-handler.interface";

/**
 * EMAIL NODE
 * 
 * Sends emails via multiple providers with automatic template replacement
 * 
 * Node Configuration:
 * {
 *   credentialId: string,
 *   userId: string,
 *   to: string | string[],
 *   subject: string,
 *   body: string,
 *   html: boolean (optional, default: false)
 * }
 * 
 * Credential Formats:
 * 
 * GMAIL OAUTH2 (RECOMMENDED FOR GMAIL):
 * {
 *   "provider": "gmail-oauth2",
 *   "clientId": "xxxxx.apps.googleusercontent.com",
 *   "clientSecret": "GOCSPX-xxxxx",
 *   "refreshToken": "1//xxxxx",
 *   "from": "your@gmail.com"
 * }
 * 
 * MICROSOFT OAUTH2 (For Outlook/Office 365):
 * {
 *   "provider": "microsoft-oauth2",
 *   "clientId": "xxxxx-xxxxx-xxxxx",
 *   "clientSecret": "xxxxx",
 *   "refreshToken": "xxxxx",
 *   "from": "your@outlook.com" or "your@yourdomain.com"
 * }
 * 
 * RESEND (Recommended for custom domains):
 * {
 *   "provider": "resend",
 *   "apiKey": "re_xxxxx",
 *   "from": "hello@yourdomain.com"
 * }
 * 
 * SENDGRID:
 * {
 *   "provider": "sendgrid",
 *   "apiKey": "SG.xxxxx",
 *   "from": "hello@yourdomain.com"
 * }
 * 
 * POSTMARK:
 * {
 *   "provider": "postmark",
 *   "apiKey": "xxxxx-xxxxx-xxxxx",
 *   "from": "hello@yourdomain.com"
 * }
 * 
 * SMTP:
 * {
 *   "provider": "smtp",
 *   "host": "smtp.gmail.com",
 *   "port": "587",
 *   "secure": false,
 *   "user": "your@gmail.com",
 *   "pass": "app-password"
 * }
 */
export const emailNode: NodeHandler = {
  type: "email",

  execute: async (nodeData, input, context) => {
    const { credentialId, to, subject, body, html = false, userId } = nodeData;

    context.logger(`email: starting execution`);

    try {
      // ========== VALIDATE ==========
      if (!credentialId) throw new Error("credentialId is required");
      if (!userId) throw new Error("userId is required");
      if (!to) throw new Error("'to' field is required");
      if (!subject) throw new Error("'subject' field is required");
      if (!body) throw new Error("'body' field is required");

      // ========== FETCH CREDENTIAL ==========
      context.logger(`email: fetching credential`);
      const credential = await CredentialService.getCredential(credentialId, userId);

      if (credential.type !== "email") {
        throw new Error(`Invalid credential type: expected 'email', got '${credential.type}'`);
      }

      const creds = CredentialService.decrypt(credential.data as string);
      const provider = (creds.provider || "smtp").toLowerCase();

      context.logger(`email: using provider '${provider}'`);

      // ========== VALIDATE PROVIDER CREDENTIALS ==========
      validateCredentials(provider, creds);

      // ========== TEMPLATE REPLACEMENT ==========
      const processedBody = replaceTemplates(body, input);
      const processedSubject = replaceTemplates(subject, input);

      context.logger(`email: templates processed`);

      // ========== SEND EMAIL ==========
      let result;

      switch (provider) {
        case "resend":
          result = await sendWithResend(creds, to, processedSubject, processedBody, html, context);
          break;

        case "sendgrid":
          result = await sendWithSendGrid(creds, to, processedSubject, processedBody, html, context);
          break;

        case "postmark":
          result = await sendWithPostmark(creds, to, processedSubject, processedBody, html, context);
          break;

        case "smtp":
          result = await sendWithSMTP(creds, to, processedSubject, processedBody, html, context);
          break;

        case "gmail-oauth2":
          result = await sendWithGmailOAuth2(creds, to, processedSubject, processedBody, html, context);
          break;

        case "microsoft-oauth2":
          result = await sendWithMicrosoftOAuth2(creds, to, processedSubject, processedBody, html, context);
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      context.logger(`email: ✅ sent successfully via ${provider}`);

      return {
        sent: true,
        provider,
        ...result,
        timestamp: new Date().toISOString(),
        input,
      };

    } catch (error: any) {
      context.logger(`email: ❌ ERROR - ${error.message}`);

      return {
        sent: false,
        error: error.message,
        to,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Replace {{input.key}} templates with actual values from input data
 */
function replaceTemplates(text: string, input: any): string {
  if (!text || !input || typeof input !== "object") return text;

  return text.replace(/\{\{input\.(\w+(\.\w+)*)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value: any = input;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return match;
    }
    
    return String(value);
  });
}

/**
 * Validate provider-specific credentials
 */
function validateCredentials(provider: string, creds: any): void {
  switch (provider) {
    case "resend":
    case "sendgrid":
    case "postmark":
      if (!creds.apiKey) throw new Error(`${provider} requires 'apiKey'`);
      if (!creds.from) throw new Error(`${provider} requires 'from' address`);
      break;

    case "smtp":
      if (!creds.host) throw new Error("SMTP requires 'host'");
      if (!creds.port) throw new Error("SMTP requires 'port'");
      if (!creds.user) throw new Error("SMTP requires 'user'");
      if (!creds.pass) throw new Error("SMTP requires 'pass'");
      break;

    case "gmail-oauth2":
      if (!creds.clientId) throw new Error("Gmail OAuth2 requires 'clientId'");
      if (!creds.clientSecret) throw new Error("Gmail OAuth2 requires 'clientSecret'");
      if (!creds.refreshToken) throw new Error("Gmail OAuth2 requires 'refreshToken'");
      if (!creds.from) throw new Error("Gmail OAuth2 requires 'from' address");
      break;

    case "microsoft-oauth2":
      if (!creds.clientId) throw new Error("Microsoft OAuth2 requires 'clientId'");
      if (!creds.clientSecret) throw new Error("Microsoft OAuth2 requires 'clientSecret'");
      if (!creds.refreshToken) throw new Error("Microsoft OAuth2 requires 'refreshToken'");
      if (!creds.from) throw new Error("Microsoft OAuth2 requires 'from' address");
      break;
  }
}

// ================================================================
// PROVIDER IMPLEMENTATIONS (LATEST OFFICIAL APIS)
// ================================================================

/**
 * RESEND - v6.4.2 (Latest November 2025)
 * Official Docs: https://resend.com/docs/send-with-nodejs
 */
async function sendWithResend(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const { Resend } = await import("resend");
  const resend = new Resend(creds.apiKey);

  context.logger(`email: sending via Resend API`);

  const payload: any = {
    from: creds.from,
    to: Array.isArray(to) ? to : [to],
    subject: subject,
  };

  if (html) {
    payload.html = body;
  } else {
    payload.text = body;
  }

  // Optional fields
  if (creds.replyTo) payload.replyTo = creds.replyTo;

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return {
    messageId: data?.id,
    to: Array.isArray(to) ? to : [to],
    subject,
    from: creds.from,
  };
}

/**
 * SENDGRID - @sendgrid/mail v7.x (Latest November 2025)
 * Official Docs: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
 */
async function sendWithSendGrid(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const sgMail = await import("@sendgrid/mail");
  sgMail.default.setApiKey(creds.apiKey);

  context.logger(`email: sending via SendGrid API`);

  const msg: any = {
    to: to,
    from: creds.from,
    subject: subject,
  };

  if (html) {
    msg.html = body;
  } else {
    msg.text = body;
  }

  // Optional fields
  if (creds.replyTo) msg.replyTo = creds.replyTo;

  const [response] = await sgMail.default.send(msg);

  return {
    messageId: response.headers['x-message-id'],
    statusCode: response.statusCode,
    to: Array.isArray(to) ? to : [to],
    subject,
    from: creds.from,
  };
}

/**
 * POSTMARK - v4.0.5 (Latest November 2025)
 * Official Docs: https://postmarkapp.com/developer/user-guide/send-email-with-nodejs
 */
async function sendWithPostmark(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const postmark = await import("postmark");
  const client = new postmark.ServerClient(creds.apiKey);

  context.logger(`email: sending via Postmark API`);

  const toAddress = Array.isArray(to) ? to.join(',') : to;

  const payload: any = {
    From: creds.from,
    To: toAddress,
    Subject: subject,
  };

  if (html) {
    payload.HtmlBody = body;
  } else {
    payload.TextBody = body;
  }

  // Optional fields
  if (creds.replyTo) payload.ReplyTo = creds.replyTo;

  const result = await client.sendEmail(payload);

  return {
    messageId: result.MessageID,
    to: result.To,
    subject,
    from: creds.from,
    submittedAt: result.SubmittedAt,
  };
}

/**
 * SMTP - nodemailer (for Gmail, Outlook, custom SMTP)
 * Official Docs: https://nodemailer.com/
 */
async function sendWithSMTP(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const nodemailer = await import("nodemailer");

  context.logger(`email: sending via SMTP (${creds.host}:${creds.port})`);

  const transporter = nodemailer.default.createTransport({
    host: creds.host,
    port: Number(creds.port),
    secure: creds.secure === true || creds.secure === "true",
    auth: {
      user: creds.user,
      pass: creds.pass,
    },
  });

  const mailOptions: any = {
    from: creds.from || creds.user,
    to: Array.isArray(to) ? to.join(',') : to,
    subject: subject,
  };

  if (html) {
    mailOptions.html = body;
  } else {
    mailOptions.text = body;
  }

  // Optional fields
  if (creds.replyTo) mailOptions.replyTo = creds.replyTo;

  const info = await transporter.sendMail(mailOptions);

  return {
    messageId: info.messageId,
    to: Array.isArray(to) ? to : [to],
    subject,
    from: creds.from || creds.user,
    response: info.response,
  };
}

/**
 * GMAIL OAUTH2 - Secure Gmail integration without app passwords
 * Official Docs: https://nodemailer.com/smtp/oauth2/
 * 
 * Setup Guide:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Gmail API
 * 4. Create OAuth 2.0 credentials (Desktop app)
 * 5. Get authorization code: https://developers.google.com/oauthplayground/
 * 6. Exchange for refresh token
 */
async function sendWithGmailOAuth2(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const nodemailer = await import("nodemailer");

  context.logger(`email: sending via Gmail OAuth2`);

  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: creds.from,
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      refreshToken: creds.refreshToken,
      // Optional: Add access token if you have it
      ...(creds.accessToken && { accessToken: creds.accessToken }),
    },
  });

  const mailOptions: any = {
    from: creds.from,
    to: Array.isArray(to) ? to.join(',') : to,
    subject: subject,
  };

  if (html) {
    mailOptions.html = body;
  } else {
    mailOptions.text = body;
  }

  // Optional fields
  if (creds.replyTo) mailOptions.replyTo = creds.replyTo;

  const info = await transporter.sendMail(mailOptions);

  return {
    messageId: info.messageId,
    to: Array.isArray(to) ? to : [to],
    subject,
    from: creds.from,
    response: info.response,
  };
}

/**
 * MICROSOFT OAUTH2 - Secure Outlook/Office 365 integration
 * Official Docs: https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth
 * 
 * Setup Guide:
 * 1. Go to Azure Portal: https://portal.azure.com/
 * 2. Register app in Azure AD
 * 3. Add SMTP.Send permission
 * 4. Get client ID and secret
 * 5. Get authorization code and exchange for refresh token
 */
async function sendWithMicrosoftOAuth2(
  creds: any,
  to: string | string[],
  subject: string,
  body: string,
  html: boolean,
  context: any
): Promise<any> {
  const nodemailer = await import("nodemailer");

  context.logger(`email: sending via Microsoft OAuth2`);

  const transporter = nodemailer.default.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: creds.from,
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      refreshToken: creds.refreshToken,
      // Optional: Add access token if you have it
      ...(creds.accessToken && { accessToken: creds.accessToken }),
    },
  });

  const mailOptions: any = {
    from: creds.from,
    to: Array.isArray(to) ? to.join(',') : to,
    subject: subject,
  };

  if (html) {
    mailOptions.html = body;
  } else {
    mailOptions.text = body;
  }

  // Optional fields
  if (creds.replyTo) mailOptions.replyTo = creds.replyTo;

  const info = await transporter.sendMail(mailOptions);

  return {
    messageId: info.messageId,
    to: Array.isArray(to) ? to : [to],
    subject,
    from: creds.from,
    response: info.response,
  };
}
