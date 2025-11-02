import prisma from "../config/database";
import { RunRepositories } from "../repositories/run.repositories";
import type { FlowJson, Node } from "../types/flow.types";

export async function executeFlow(runId: string) {
    try {
        console.log(`🚀 Starting execution for run: ${runId}`);
        
        // 1. Update run status to running
        await RunRepositories.updateStatus(runId, "running");
        
        // 2. Load the run with flow
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { flow: true }
        });
        
        if (!run || !run.flow) {
            throw new Error("Run or Flow not found");
        }
        
        const flowJson = run.flow.json;
        
        console.log(`📋 Flow has ${flowJson.nodes.length} nodes`);
        
        // 3. Execute all nodes
        const result = await executeNodes(flowJson, runId);
        
        // 4. Mark as completed
        await RunRepositories.updateStatus(
            runId,
            "completed",
            result
        );
        
        console.log(`✅ Flow execution completed for run: ${runId}`);
        
    } catch (error: any) {
        console.error(`❌ Flow execution failed for run: ${runId}`, error);
        
        await RunRepositories.updateStatus(
            runId,
            "failed",
            undefined,
            error.message
        );
        
        throw error;
    }
}

async function executeNodes(flowJson: FlowJson, runId: string) {
    console.log("📝 Executing nodes...");
    
    const results: any[] = [];
    
    // For now, execute nodes in order (we'll add connection logic later)
    for (const node of flowJson.nodes) {
        const nodeOutput = await executeNode(node, runId);
        results.push(nodeOutput);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
        completed: true,
        nodeCount: flowJson.nodes.length,
        results
    };
}

async function executeNode(node: Node, runId: string) {
    console.log(`  ⚙️ Executing node: ${node.type} (${node.id})`);
    
    // Create dummy output for now
    const output = {
        nodeId: node.id,
        nodeType: node.type,
        executed: true,
        timestamp: new Date(),
        data: node.data
    };
    
    // Save node output to database
    await RunRepositories.saveNodeOutput(runId, node.id, output);
    
    return output;
}
