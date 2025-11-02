import type { Request, Response } from "express";
import { FlowRepository } from "../repositories/flow.repositories";
import { RunRepositories } from "../repositories/run.repositories";
import { ExecutionService } from "../services/execution.service";


export class FlowController {
  
  // POST /api/v1/flows - Create new flow
  static async createFlow(req: Request, res: Response) {
    try {
      const { name, flowJson } = req.body;
      
      // Basic validation
      if (!name || !flowJson) {
        return res.status(400).json({ 
          success: false, 
          error: "Name and flowJson are required" 
        });
      }

      if (!flowJson.nodes || flowJson.nodes.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Flow must have at least one node" 
        });
      }
      
      // TODO: Will add authentication later
      const ownerId = "user_123";
      
      const flow = await FlowRepository.create(name, flowJson, ownerId);
      
      res.status(201).json({ success: true, data: flow });
    } catch (error: any) {
      console.error("Error creating flow:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // GET /api/v1/flows/:id - Get one flow
  static async getFlow(req: Request, res: Response) {
    try {
      const flow = await FlowRepository.findById((req.params.id) as string);
      
      if (!flow) {
        return res.status(404).json({ 
          success: false, 
          error: "Flow not found" 
        });
      }
      
      res.json({ success: true, data: flow });
    } catch (error: any) {
      console.error("Error fetching flow:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // GET /api/v1/flows - Get all flows for user
  static async listFlows(req: Request, res: Response) {
    try {
      const ownerId = "user_123"; // TODO: Get from auth
      
      const flows = await FlowRepository.findByOwner(ownerId);
      
      res.json({ success: true, data: flows });
    } catch (error: any) {
      console.error("Error listing flows:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // PUT /api/v1/flows/:id - Update flow
  static async updateFlow(req: Request, res: Response) {
    try {
      const { name, flowJson } = req.body;
      
      const flow = await FlowRepository.update((req.params.id) as string, name, flowJson);
      
      res.json({ success: true, data: flow });
    } catch (error: any) {
      console.error("Error updating flow:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // DELETE /api/v1/flows/:id - Delete flow
  static async deleteFlow(req: Request, res: Response) {
    try {
      await FlowRepository.delete((req.params.id) as string );
      
      res.json({ success: true, message: "Flow deleted" });
    } catch (error: any) {
      console.error("Error deleting flow:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // POST /api/v1/flows/:id/run - Manually trigger flow
  static async runFlow(req: Request, res: Response) {
    try {
       const input = req.body.input;
       // support routes that use either :id or :flowId as the param name
       const flowId = req.params.id ?? (req.params as any).flowId;
       if (!flowId) {
         return res.status(400).json({
           success: false,
           error: "Flow id is required"
         });
       }

       const triggerFlow =  await ExecutionService.triggerFlow(flowId , input);
      
      res.json({ 
        success: true, 
        data : triggerFlow,
        message: "Flow execution queued" 
      });
    } catch (error: any) {
      console.error("Error running flow:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // GET /api/v1/runs/:id - Get run details
  static async getRun(req: Request, res: Response) {
    try {
      const run = await RunRepositories.findById((req.params.id) as string);
      
      if (!run) {
        return res.status(404).json({ 
          success: false, 
          error: "Run not found" 
        });
      }
      
      res.json({ success: true, data: run });
    } catch (error: any) {
      console.error("Error fetching run:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}
