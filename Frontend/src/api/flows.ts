import api from './client';
import type { Flow, CreateFlowRequest, Run } from '../types/flow.types';

export const flowsApi = {
  // Create new flow
  async createFlow(data: CreateFlowRequest): Promise<Flow> {
    const response = await api.post<Flow>('/flows', data);
    return response.data;
  },

  // Get all flows
  async listFlows(): Promise<Flow[]> {
    const response = await api.get<Flow[]>('/flows');
    return response.data;
  },

  // Get one flow
  async getFlow(id: string): Promise<Flow> {
    const response = await api.get<Flow>(`/flows/${id}`);
    return response.data;
  },

  // Update flow
  async updateFlow(id: string, data: Partial<CreateFlowRequest>): Promise<Flow> {
    const response = await api.put<Flow>(`/flows/${id}`, data);
    return response.data;
  },

  // Delete flow
  async deleteFlow(id: string): Promise<void> {
    await api.delete(`/flows/${id}`);
  },

  // Run flow
  async runFlow(id: string, input?: any): Promise<Run> {
    const response = await api.post<Run>(`/flows/${id}/run`, { input });
    return response.data;
  },

  // Trigger flow
  async triggerFlow(flowId: string): Promise<Run> {
    const response = await api.post<Run>(`/flows/${flowId}/trigger`);
    return response.data;
  },

  // Get run status
  async getRun(runId: string): Promise<Run> {
    const response = await api.get<Run>(`/runs/${runId}`);
    return response.data;
  },

  // Aliases for backwards compatibility
  create(data: CreateFlowRequest) { return this.createFlow(data); },
  list() { return this.listFlows(); },
  get(id: string) { return this.getFlow(id); },
  update(id: string, data: Partial<CreateFlowRequest>) { return this.updateFlow(id, data); },
  delete(id: string) { return this.deleteFlow(id); },
  run(id: string, input?: any) { return this.runFlow(id, input); },
};
