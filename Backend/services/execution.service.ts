import { enqueueFlowExecution } from "../queue/producer";
import { FlowRepository } from "../repositories/flow.repositories";
import { RunRepositories } from "../repositories/run.repositories";

export class ExecutionService {
    static async triggerFlow(flowId :string , userId : string ,input? : any ){
      const flow =  await FlowRepository.findById(flowId);
      if(!flow){
        throw new Error("Flow not found");
      } 

      const createRun = await RunRepositories.create(flowId,userId,input);

      await enqueueFlowExecution(createRun.id , input ,userId);

      return createRun;
    }
}