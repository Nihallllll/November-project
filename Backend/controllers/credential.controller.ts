import type { Request, Response } from "express";
import prisma from "../config/database";
import { CredentialService } from "../services/credentail.service";


export class CredentialController {
  
  /**
   * POST /users/:userId/credentials
   * Save new credential (will be encrypted)
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, type, data } = req.body;

      // ========== VALIDATION ==========
      if (!name || !type || !data) {
        return res.status(400).json({
          success: false,
          error: "name, type, and data are required"
        });
      }

      // ========== CREATE WITH ENCRYPTION ==========
      const credential = await CredentialService.createCredential(
        userId!,
        name,
        type,
        data
      );

      console.log(`✅ Credential created & encrypted: ${credential.id} (${credential.type})`);

      res.status(201).json({
        success: true,
        data: {
          id: credential.id,
          name: credential.name,
          type: credential.type,
          isActive: credential.isActive,
          createdAt: credential.createdAt
        },
        message: "Credential saved and encrypted successfully"
      });

    } catch (error: any) {
      console.error("Error creating credential:", error);
      
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
   * List all credentials (don't show encrypted data)
   */
  static async list(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const credentials = await prisma.credential.findMany({
        where: { 
          userId,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
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
   * Get one credential details
   */
  static async getOne(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;

      const credential = await CredentialService.getCredential(id!, userId!);

      res.json({
        success: true,
        data: {
          id: credential.id,
          name: credential.name,
          type: credential.type,
          isActive: credential.isActive,
          createdAt: credential.createdAt
        }
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
   * DELETE /users/:userId/credentials/:id
   * Delete credential
   */
  static async delete(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;

      // Verify credential exists
      await CredentialService.getCredential(id!, userId!);

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
