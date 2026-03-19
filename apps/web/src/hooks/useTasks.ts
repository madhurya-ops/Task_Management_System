'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { tasksApi } from '../lib/api/tasks';
import type { Task, TasksResponse } from '../types';

interface Filters {
  status?: 'completed' | 'pending';
  search?: string;
  limit?: number;
  enabled?: boolean;
}

const updateTaskInPages = (
  data: InfiniteData<TasksResponse> | undefined,
  updater: (task: Task) => Task | null
): InfiniteData<TasksResponse> | undefined => {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items
        .map((task) => updater(task))
        .filter((task): task is Task => task !== null)
    }))
  };
};

export const useTasks = (filters: Filters) => {
  const queryClient = useQueryClient();
  const limit = filters.limit ?? 20;
  const status = filters.status ?? null;
  const search = filters.search?.trim() || null;
  const queryKey = ['tasks', limit, status, search] as const;

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    enabled: filters.enabled ?? true,
    queryFn: ({ pageParam }) =>
      tasksApi.list({
        cursor: pageParam,
        limit,
        status: status ?? undefined,
        search: search ?? undefined
      }),
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (result) => {
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) => {
        if (!old) return old;
        const first = old.pages[0];
        return {
          ...old,
          pages: [{ ...first, items: [result.task, ...first.items] }, ...old.pages.slice(1)]
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Parameters<typeof tasksApi.update>[1] }) =>
      tasksApi.update(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InfiniteData<TasksResponse>>(queryKey);
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) =>
        updateTaskInPages(old, (task) => (task.id === taskId ? { ...task, ...payload } : task))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) =>
        updateTaskInPages(old, (task) => (task.id === result.task.id ? result.task : task))
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.remove,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InfiniteData<TasksResponse>>(queryKey);
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) =>
        updateTaskInPages(old, (task) => (task.id === taskId ? null : task))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: tasksApi.toggle,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InfiniteData<TasksResponse>>(queryKey);
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) =>
        updateTaskInPages(old, (task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<InfiniteData<TasksResponse>>(queryKey, (old) =>
        updateTaskInPages(old, (task) => (task.id === result.task.id ? result.task : task))
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' });
    }
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation
  };
};
