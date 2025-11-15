import { Router } from 'express';
import { FlowController } from '../controllers/flow.controller';

const router = Router();

// ========== FLOW ROUTES ==========

// Create new flow
router.post("/flows", FlowController.createFlow);

// Get all flows
router.get("/flows", FlowController.listFlows);

// Get one flow
router.get("/flows/:id", FlowController.getFlow);

// Update flow
router.put("/flows/:id", FlowController.updateFlow);

// Toggle flow active status
router.patch("/flows/:id/toggle", FlowController.toggleActive);

// Delete flow
router.delete("/flows/:id", FlowController.deleteFlow);

// Manually trigger flow execution
router.post("/flows/:id/run", FlowController.runFlow);

//trigger without input
router.post("/flows/:flowId/trigger", (req, res) => FlowController.triggerFlow(req, res));
// ========== RUN ROUTES ==========


// Get run details
router.get("/runs/:id", FlowController.getRun);

export default router;
