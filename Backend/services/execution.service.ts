import prisma from "../config/database";
import { enqueueFlowExecution } from "../queue/producer";
import { FlowRepository } from "../repositories/flow.repositories";
import { RunRepositories } from "../repositories/run.repositories";

export class ExecutionService {
    static async triggerFlow(flowId :string ,input? : any){
      const flow =  await FlowRepository.findById(flowId);
      if(!flow){
        return "Not found"
      } 

      const createRun = await RunRepositories.create(flowId);

      await enqueueFlowExecution(flowId , input);

      return "created Run"
    }
}