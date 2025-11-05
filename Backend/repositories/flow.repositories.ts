import prisma from "../config/database";
import type{ FlowJson } from "../types/flow.types";

export class FlowRepository {
  
  // Create a new flow
  static async create(name: string, flowJson: FlowJson, ownerId: string , schedule : string) {
    return await prisma.flow.create({
      data: {
        name: name,
        json: flowJson as any,
        userId: ownerId,
        status: "ACTIVE"  ,// Default status
        schedule : schedule || null
      }
    });
  }

  // Find flow by ID
  static async findById(id: string) {
    return await prisma.flow.findUnique({
      where: { id: id },
      include: { runs: {
        orderBy :  {createdAt : "desc"},
        take : 10 
      } }  // Include related runs
    });
  }

  // Find all flows for an owner
  static async findByOwner(userId: string) {
    return await prisma.flow.findMany({
      where: { userId},

      orderBy: { createdAt: 'desc' },
      include : {
        runs : {
            take : 1 ,
            orderBy :{createdAt : "desc"}
        }
      }
    });
  }

  static async update(id :string , name : string , flowJson : FlowJson ){
    return await prisma.flow.update({
        where: {id},
        data : {
            name ,
            json : flowJson as any,
            updatedAt : new Date()
        }
    })
  }

   static async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'DRAFT') {
    return await prisma.flow.update({
      where: { id },
      data: { status }
    });
  }

  // Delete flow
  static async delete(id: string) {
    return await prisma.flow.delete({
      where: { id }
    });
  }
}
