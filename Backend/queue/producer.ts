import { Queue } from "bullmq";
import redis from "../config/redis";


const flowExecutionQueue = new Queue('foo');

export async function enqueueFlowExecution (flowId : string , input : any): Promise<any> {
 return await flowExecutionQueue.add('flow-execution', { flowId , input ,triggeredAt : new Date() });
}


