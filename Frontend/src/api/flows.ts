import api from './client';
import type { Flow, CreateFlowRequest, Run } from '../types/flow.types';

export const flowsApi = {
  // Create new flow
  async createFlow(data: CreateFlowRequest): Promise<Flow> {
    const response = await api.post<{ success: boolean; data: Flow }>('/api/v1/flows', data);
    return response.data.data;
  },

  // Get all flows
  async listFlows(): Promise<Flow[]> {
    const response = await api.get<{ success: boolean; data: Flow[] }>('/api/v1/flows');
    return response.data.data;
  },

  // Get one flow
  async getFlow(id: string): Promise<Flow> {
    const response = await api.get<{ success: boolean; data: Flow }>(`/api/v1/flows/${id}`);
    return response.data.data;
  },

  // Update flow
  async updateFlow(id: string, data: Partial<CreateFlowRequest>): Promise<Flow> {
    const response = await api.put<{ success: boolean; data: Flow }>(`/api/v1/flows/${id}`, data);
    return response.data.data;
  },

  // Delete flow
  async deleteFlow(id: string): Promise<void> {
    await api.delete(`/api/v1/flows/${id}`);
  },

  // Run flow
  async runFlow(id: string, input?: any): Promise<Run> {
    const response = await api.post<{ success: boolean; data: Run }>(`/api/v1/flows/${id}/run`, { input });
    return response.data.data;
  },

  // Trigger flow
  async triggerFlow(flowId: string): Promise<Run> {
    const response = await api.post<{ success: boolean; data: Run }>(`/api/v1/flows/${flowId}/trigger`);
    return response.data.data;
  },

  // Get run status
  async getRun(runId: string): Promise<Run> {
    const response = await api.get<{ success: boolean; data: Run }>(`/api/v1/runs/${runId}`);
    return response.data.data;
  },

  // Toggle flow active status
  async toggleActive(id: string): Promise<Flow> {
    const response = await api.patch<{ success: boolean; data: Flow }>(`/api/v1/flows/${id}/toggle`);
    return response.data.data;
  },

  // Aliases for backwards compatibility
  create(data: CreateFlowRequest) { return this.createFlow(data); },
  list() { return this.listFlows(); },
  get(id: string) { return this.getFlow(id); },
  update(id: string, data: Partial<CreateFlowRequest>) { return this.updateFlow(id, data); },
  delete(id: string) { return this.deleteFlow(id); },
  run(id: string, input?: any) { return this.runFlow(id, input); },
};
