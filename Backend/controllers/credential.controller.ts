import type { Request, Response } from "express";
import prisma from "../config/database";

export class CredentialController {
  
  /**
   * POST /users/:userId/credentials
   * Save new credential for user
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, type, data } = req.body;

      // ========== VALIDATION ==========
      if(!userId){
        return res.json({
            message : "userId not found"
        })
      }
      if (!name || !type || !data ) {
        return res.status(400).json({
          success: false,
          error: "name, type, and data are required"
        });
      }

      // ========== SAVE TO DATABASE ==========
      // TODO: Add encryption before saving 'data'
      const credential = await prisma.credential.create({
        data: {
          userId,
          name,
          type,
          data: data, // Stored as JSON
          isActive: true
        }
      });

      console.log(`✅ Credential created: ${credential.id} (${credential.type})`);

      res.status(201).json({
        success: true,
        data: {
          id: credential.id,
          name: credential.name,
          type: credential.type,
          isActive: credential.isActive,
          createdAt: credential.createdAt
        },
        message: "Credential saved successfully"
      });

    } catch (error: any) {
      console.error("Error creating credential:", error);
      
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: "A credential with this name already exists"
        });
      }

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /users/:userId/credentials
   * List all credentials for user (without sensitive data)
   */
  static async list(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const credentials = await prisma.credential.findMany({
        where: { 
          userId,
          isActive: true  // Only show active credentials
        },
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't return 'data' field for security
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: credentials,
        count: credentials.length
      });

    } catch (error: any) {
      console.error("Error listing credentials:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /users/:userId/credentials/:id
   * Get one credential details (without sensitive data)
   */
  static async getOne(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;

      const credential = await prisma.credential.findFirst({
        where: { 
          id, 
          userId 
        },
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't return 'data' for security
        }
      });

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: "Credential not found"
        });
      }

      res.json({
        success: true,
        data: credential
      });

    } catch (error: any) {
      console.error("Error getting credential:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PUT /users/:userId/credentials/:id
   * Update credential
   */
  static async update(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;
      const { name, data, isActive } = req.body;

      // Check if credential exists and belongs to user
      const existing = await prisma.credential.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Credential not found"
        });
      }

      // Update credential
      const updated = await prisma.credential.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(data && { data }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Credential updated: ${id}`);

      res.json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          type: updated.type,
          isActive: updated.isActive,
          updatedAt: updated.updatedAt
        },
        message: "Credential updated successfully"
      });

    } catch (error: any) {
      console.error("Error updating credential:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /users/:userId/credentials/:id
   * Delete credential
   */
  static async delete(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;

      // Verify credential belongs to user before deleting
      const credential = await prisma.credential.findFirst({
        where: { id, userId }
      });

      if (!credential) {
        return res.status(404).json({
          success: false,
          error: "Credential not found"
        });
      }

      // Delete credential
      await prisma.credential.delete({
        where: { id }
      });

      console.log(`✅ Credential deleted: ${id}`);

      res.json({
        success: true,
        message: "Credential deleted successfully"
      });

    } catch (error: any) {
      console.error("Error deleting credential:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
