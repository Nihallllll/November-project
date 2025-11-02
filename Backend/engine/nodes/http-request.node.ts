import type { NodeHandler } from "./node-handler.interface";

export const httpRequestNode: NodeHandler = {
  type: "http_request",
  execute: async (nodeData, input, context) => {
    const { url, method = "GET", headers = {}, body } = nodeData ?? {};
    context.logger(`http_request: starting ${method} ${url}`);

    try {
      const fetchOptions: any = { method, headers };

      if (body !== undefined) {
        // If body is an object, send as JSON
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
        // Ensure Content-Type is set when sending JSON
        if (!Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
          fetchOptions.headers = { "content-type": "application/json", ...headers };
        }
      }

      const res = await fetch(String(url), fetchOptions);

      const contentType = res.headers.get("content-type") || "";
      let data: any;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      const result = { status: res.status, data, headers: resHeaders };
      context.logger(`http_request: finished ${method} ${url} -> ${res.status}`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      context.logger(`http_request: error ${msg}`);
      return { status: "error", error: msg };
    }
  },
};
