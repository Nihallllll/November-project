import { Queue } from "bullmq";
import redis from "../config/redis";

const flowExecutionQueue = new Queue('flow-execution', { 
    connection: redis  
});

export async function enqueueFlowExecution(runId: string, input: any , userId : string) {
    return await flowExecutionQueue.add('execute', {
        runId,
        userId,
        input,
        triggeredAt: new Date()
    });
}
