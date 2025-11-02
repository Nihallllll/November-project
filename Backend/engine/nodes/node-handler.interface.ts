import type{ ExecutionContext, Node } from "../../types/flow.types";

export interface NodeHandler {
  type: string;
  execute: (nodeData: Node['data'], input: any, context: ExecutionContext) => Promise<any>;
}

