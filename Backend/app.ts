import express from "express";
import flowRoutes from "./routes/flow.routes";
import credentialRoutes from "./routes/credential.routes";
import healthRoutes from "./routes/health.routes";

import { logger } from "./utils/logger";
import { auditMiddleware, authMiddleware } from "./middlewares/auth.middleware";
import { transactionRoutes } from "./routes/transactions.routes";
import { authRoutes } from "./routes/auth.routes";
import { heliusWebHookRoutes } from "./routes/helius-webhook.routes";

const app = express();

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ========== PUBLIC ROUTES (No auth needed) ==========
// ========== PUBLIC ROUTES (No Auth Required) ==========
app.use("/health", healthRoutes);       // ✅ Public: /health
app.use("/auth", authRoutes);           // ✅ Public: /auth/register, /auth/login

// ========== PROTECTED ROUTES (Auth Required) ==========
// Apply auth middleware ONLY to /api/v1/* routes
app.use("/api/v1", authMiddleware);     // ✅ Auth required for all /api/v1/* routes
app.use("/api/v1", auditMiddleware);    // ✅ Log all API requests
// API Routes (now protected)
app.use("/api/v1", flowRoutes);
app.use("/api/v1", credentialRoutes);
app.use('/api', transactionRoutes);
app.use('/api/v1', heliusWebHookRoutes);
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Request error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

export default app;
