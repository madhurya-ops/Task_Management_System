import { apiClient } from './client';
import type { Task, TasksResponse } from '../../types';

export interface ListTasksParams {
  cursor?: string;
  limit?: number;
  status?: 'completed' | 'pending';
  search?: string;
}

export const tasksApi = {
  async list(params: ListTasksParams) {
    const query = new URLSearchParams();

    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    return apiClient.request<TasksResponse>(`/tasks?${query.toString()}`);
  },

  async create(payload: { title: string; description?: string; dueDate?: string }) {
    return apiClient.request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async update(taskId: string, payload: Partial<{ title: string; description: string | null; completed: boolean; dueDate: string | null }>) {
    return apiClient.request<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async remove(taskId: string) {
    return apiClient.request<void>(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  },

  async toggle(taskId: string) {
    return apiClient.request<{ task: Task }>(`/tasks/${taskId}/toggle`, {
      method: 'PATCH'
    });
  }
};
