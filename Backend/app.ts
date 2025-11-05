import express from "express";
import flowRoutes from "./routes/flow.routes";
import credentialRoutes from "./routes/credential.routes";
import healthRoutes from "./routes/health.routes";

import { logger } from "./utils/logger";
import { auditMiddleware, authMiddleware } from "./middlewares/auth.middleware";

const app = express();

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ========== PUBLIC ROUTES (No auth needed) ==========
app.use("/", healthRoutes);        // /health, /stats (public)
app.use("/", authMiddleware);           // /auth/register, /auth/login (public)

// ========== PROTECTED ROUTES (Auth required) ==========
// All routes below require valid JWT token

// Apply auth middleware BEFORE routes
app.use(authMiddleware);
app.use(auditMiddleware);

// API Routes (now protected)
app.use("/api/v1", flowRoutes);
app.use("/api/v1", credentialRoutes);

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
