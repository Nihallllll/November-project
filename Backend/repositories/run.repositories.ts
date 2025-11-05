import prisma from "../config/database";

export class RunRepositories {
    static async create(flowId : string, userId: string, input?: any){
       return await prisma.run.create({
            data :{
                flowId ,
                userId,
                status : "QUEUED",
                input : input || {}
            }
        })
    }

    static async findById(id :string ){
       return await prisma.run.findUnique({
            where :{
                id 
            }, include :{
                flow :true,
                nodeOutputs :{
                    orderBy : {createdAt : "asc"}
                }
            }
        })
    };
     static async findByFlowId(flowId: string) {
    return await prisma.run.findMany({
      where: { flowId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 runs
    });
  }

  // Update run status
  static async updateStatus(
    id: string, 
    status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
    output?: any,
    error?: string
  ) {
    return await prisma.run.update({
      where: { id },
      data: {
        status,
        output: output || undefined,
        error: error || undefined,
        finishedAt: ['COMPLETED', 'FAILED', 'CANCELLED'].includes(status) 
          ? new Date() 
          : undefined
      }
    });
  }

  // Save node output during execution
  static async saveNodeOutput(runId: string, nodeId: string, output: any, error?: string) {
    return await prisma.nodeOutput.create({
      data: {
        runId,
        nodeId,
        output,
        error
      }
    });
  }

  // Get all node outputs for a run
  static async getNodeOutputs(runId: string) {
    return await prisma.nodeOutput.findMany({
      where: { runId },
      orderBy: { createdAt: 'asc' }
    });
  }
}