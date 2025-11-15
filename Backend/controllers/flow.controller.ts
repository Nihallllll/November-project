import type { Request, Response } from "express";
import { FlowRepository } from "../repositories/flow.repositories";
import { RunRepositories } from "../repositories/run.repositories";
import { ExecutionService } from "../services/execution.service";

export class FlowController {
  // ========== POST /api/v1/flows - Create new flow ==========
  static async createFlow(req: Request, res: Response) {
    try {
      const { name, flowJson, schedule } = req.body;

      // ✅ FIXED: Get userId from auth middleware
      const ownerId = (req as any).userId;

      console.log('📝 Creating flow:', {
        name,
        ownerId,
        nodeCount: flowJson?.nodes?.length,
        connectionCount: flowJson?.connections?.length,
        hasSchedule: !!schedule
      });

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized: User ID not found"
        });
      }

      // Validate input
      if (!name || !flowJson) {
        console.error('❌ Validation failed: Missing name or flowJson');
        return res.status(400).json({
          success: false,
          error: "Name and flowJson are required"
        });
      }

      if (!flowJson.nodes || flowJson.nodes.length === 0) {
        console.error('❌ Validation failed: No nodes in flow');
        return res.status(400).json({
          success: false,
          error: "Flow must have at least one node"
        });
      }

      const flow = await FlowRepository.create(name, flowJson, ownerId, schedule);
      console.log('✅ Flow created successfully:', flow.id);

      res.status(201).json({
        success: true,
        data: flow
      });
    } catch (error: any) {
      console.error("Error creating flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== GET /api/v1/flows - List user's flows ==========
  static async listFlows(req: Request, res: Response) {
    try {
      // ✅ FIXED: Get userId from auth middleware
      const ownerId = (req as any).userId;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized: User ID not found"
        });
      }

      const flows = await FlowRepository.findByOwner(ownerId);

      res.json({
        success: true,
        data: flows
      });
    } catch (error: any) {
      console.error("Error listing flows:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== GET /api/v1/flows/:id - Get one flow ==========
  static async getFlow(req: Request, res: Response) {
    try {
      const flowId = req.params.id;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      const flow = await FlowRepository.findById(flowId!);

      if (!flow) {
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      // ✅ FIXED: Check ownership
      if (flow.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      res.json({
        success: true,
        data: flow
      });
    } catch (error: any) {
      console.error("Error fetching flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== PUT /api/v1/flows/:id - Update flow ==========
  static async updateFlow(req: Request, res: Response) {
    try {
      const flowId = req.params.id;
      const userId = (req as any).userId;
      const { name, flowJson } = req.body;

      console.log('📝 Updating flow:', {
        flowId,
        userId,
        name,
        nodeCount: flowJson?.nodes?.length,
        connectionCount: flowJson?.connections?.length
      });

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      // ✅ FIXED: Get flow and check ownership
      const existingFlow = await FlowRepository.findById(flowId!);

      if (!existingFlow) {
        console.error('❌ Flow not found:', flowId);
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      if (existingFlow.userId !== userId) {
        console.error('❌ Access denied: User', userId, 'does not own flow', flowId);
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      const flow = await FlowRepository.update(flowId!, name, flowJson);
      console.log('✅ Flow updated successfully:', flowId);

      res.json({
        success: true,
        data: flow
      });
    } catch (error: any) {
      console.error("Error updating flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== PATCH /api/v1/flows/:id/toggle - Toggle flow active status ==========
  static async toggleActive(req: Request, res: Response) {
    try {
      const flowId = req.params.id;
      const userId = (req as any).userId;

      console.log(`🔄 Toggle flow request: flowId=${flowId}, userId=${userId}`);

      if (!userId) {
        console.log('❌ No userId found');
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      // Check ownership
      const flow = await FlowRepository.findById(flowId!);
      console.log(`📊 Flow found:`, flow ? `${flow.name} (status: ${flow.status})` : 'null');

      if (!flow) {
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      if (flow.userId !== userId) {
        console.log(`❌ Access denied: flow.userId=${flow.userId}, userId=${userId}`);
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      // Toggle status
      const newStatus = flow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      console.log(`🔄 Toggling from ${flow.status} to ${newStatus}`);
      
      const updatedFlow = await FlowRepository.updateStatus(flowId!, newStatus);
      console.log(`✅ Flow status toggled successfully:`, updatedFlow);

      res.json({
        success: true,
        data: updatedFlow
      });
    } catch (error: any) {
      console.error("❌ Error toggling flow status:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== DELETE /api/v1/flows/:id - Delete flow ==========
  static async deleteFlow(req: Request, res: Response) {
    try {
      const flowId = req.params.id;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      // ✅ FIXED: Check ownership
      const flow = await FlowRepository.findById(flowId!);

      if (!flow) {
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      if (flow.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      await FlowRepository.delete(flowId!);

      res.json({
        success: true,
        message: "Flow deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== POST /api/v1/flows/:id/run - Manually trigger flow ==========
  static async runFlow(req: Request, res: Response) {
    try {
      const flowId = (req.params.id) as string;
      const userId = (req as any).userId;
      const input = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      // ✅ FIXED: Check ownership
      const flow = await FlowRepository.findById(flowId!);

      if (!flow) {
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      if (flow.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      const run = await ExecutionService.triggerFlow(flowId, userId, input);

      res.json({
        success: true,
        data: run
      });
    } catch (error: any) {
      console.error("Error running flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== GET /api/v1/runs/:id - Get run details ==========
  static async getRun(req: Request, res: Response) {
    try {
      const runId = req.params.id;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      const run = await RunRepositories.findById(runId!);

      if (!run) {
        return res.status(404).json({
          success: false,
          error: "Run not found"
        });
      }

      // ✅ ADDED: Get flow to check ownership
      const flow = await FlowRepository.findById(run.flowId);

      if (!flow || flow.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied"
        });
      }

      res.json({
        success: true,
        data: run
      });
    } catch (error: any) {
      console.error("Error fetching run:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ========== POST /api/v1/flows/:flowId/trigger - Trigger without input ==========
  static async triggerFlow(req: Request, res: Response) {
    try {
      const flowId = req.params.flowId;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized"
        });
      }

      // ✅ FIXED: Check ownership
      const flow = await FlowRepository.findById(flowId!);

      if (!flow) {
        return res.status(404).json({
          success: false,
          error: "Flow not found"
        });
      }

      if (flow.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied: You do not own this flow"
        });
      }

      const run = await ExecutionService.triggerFlow(flowId!, userId , {});

      res.json({
        success: true,
        data: run,
        message: "Flow triggered successfully"
      });
    } catch (error: any) {
      console.error("Error triggering flow:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
