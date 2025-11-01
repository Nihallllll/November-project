import prisma from "../config/database";

async function executeFlow(runId : string){
    const run   =await prisma.run.findUnique({
        where :{
            id : runId
        }
    })
}