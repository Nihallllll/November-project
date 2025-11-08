import type { NodeHandler } from "./node-handler.interface";

export const webhookNode: NodeHandler = {
  type: "webhook",
  execute: async (nodeData, input, context) => {
    const {
      url, // Webhook URL (required)
      method = "POST", // HTTP method (default: POST)
      headers = {}, // Custom headers (optional)
      payload = {}, // Static payload (optional)
      includeInput = true, // Include previous node output (default: true)
      timeout = 5000, // Request timeout in ms (default: 5000)
      retries = 0, // Number of retries (default: 0)
    } = nodeData;
    // Validate required fields
    if (!url) {
      throw new Error("url is required");
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new Error("Invalid URL format");
    }

    // Validate method
    if (!["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      throw new Error("method must be POST, PUT, or PATCH");
    }

    context.logger(`webhook: sending ${method} request to ${url}`);

    // Build final payload
    let finalPayload: any = { ...payload };

    // Include input from previous node if enabled
    if (includeInput && input) {
      finalPayload.input = input;
    }

    // Add metadata for context
    finalPayload.metadata = {
      runId: context.runId,
      userId: context.userId,
      nodeType: "webhook",
      timestamp: new Date().toISOString(),
    };

    context.logger(
      `webhook: payload prepared with ${Object.keys(finalPayload).length} keys`
    );

    // Function to send webhook (with retry logic)
    async function sendWebhookRequest(attemptNumber: number = 1): Promise<any> {
      try {
        context.logger(`webhook: attempt ${attemptNumber}/${retries + 1}`);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Send HTTP request
        const response = await fetch(url, {
          method: method.toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            ...headers, // Merge custom headers
          },
          body: JSON.stringify(finalPayload),
          signal: controller.signal,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Check if request was successful
        if (!response.ok) {
          throw new Error(
            `Webhook request failed: ${response.status} ${response.statusText}`
          );
        }

        // Parse response
        let responseData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        context.logger(`webhook: ✅ request successful (${response.status})`);

        return {
          success: true,
          statusCode: response.status,
          statusText: response.statusText,
          webhookResponse: responseData,
          sentPayload: finalPayload,
          attempts: attemptNumber,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Check if it's a timeout error
        if (error.name === "AbortError") {
          throw new Error(`Webhook request timed out after ${timeout}ms`);
        }

        // If we have retries left, try again
        if (attemptNumber <= retries) {
          context.logger(
            `webhook: ⚠️ attempt ${attemptNumber} failed, retrying...`
          );

          // Exponential backoff: wait 1s, 2s, 4s, etc.
          const waitTime = 1000 * Math.pow(2, attemptNumber - 1);
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          // Retry
          return sendWebhookRequest(attemptNumber + 1);
        }

        // No more retries, throw error
        throw error;
      }
    }
    try {
      // Execute webhook request (with retries if configured)
      const result = await sendWebhookRequest();

      context.logger(
        `webhook: completed successfully after ${result.attempts} attempt(s)`
      );

      return result;
    } catch (error: any) {
      context.logger(`webhook: ❌ ERROR - ${error.message}`);

      return {
        success: false,
        error: error.message,
        sentPayload: finalPayload,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
