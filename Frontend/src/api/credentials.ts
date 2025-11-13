import { api as apiClient } from './client';

export interface Credential {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCredentialData {
  name: string;
  type: string;
  data: any;
}

export const credentialsApi = {
  /**
   * List all credentials for a user
   */
  list: async (userId: string): Promise<Credential[]> => {
    const response = await apiClient.get(`/users/${userId}/credentials`);
    return response.data.data;
  },

  /**
   * Get a single credential
   */
  get: async (userId: string, credentialId: string): Promise<Credential> => {
    const response = await apiClient.get(`/users/${userId}/credentials/${credentialId}`);
    return response.data.data;
  },

  /**
   * Create a new credential
   */
  create: async (userId: string, data: CreateCredentialData): Promise<Credential> => {
    const response = await apiClient.post(`/users/${userId}/credentials`, data);
    return response.data.data;
  },

  /**
   * Delete a credential
   */
  delete: async (userId: string, credentialId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/credentials/${credentialId}`);
  },
};
