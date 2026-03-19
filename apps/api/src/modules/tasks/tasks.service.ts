import { notFound } from '../../lib/errors';
import { tasksRepository } from './tasks.repository';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.schemas';

export const tasksService = {
  async list(userId: string, query: ListTasksQuery) {
    const records = await tasksRepository.list({
      userId,
      cursor: query.cursor,
      limit: query.limit,
      status: query.status,
      search: query.search
    });

    const hasMore = records.length > query.limit;
    const items = hasMore ? records.slice(0, query.limit) : records;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return {
      items,
      pageInfo: {
        nextCursor,
        hasMore
      }
    };
  },

  async create(userId: string, input: CreateTaskInput) {
    return tasksRepository.create({
      userId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    });
  },

  async getById(userId: string, taskId: string) {
    const task = await tasksRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw notFound('Task not found');
    }
    return task;
  },

  async update(userId: string, taskId: string, input: UpdateTaskInput) {
    const updateResult = await tasksRepository.update(taskId, userId, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
      ...(input.dueDate !== undefined
        ? {
            dueDate: input.dueDate ? new Date(input.dueDate) : null
          }
        : {})
    });

    if (updateResult.count === 0) {
      throw notFound('Task not found');
    }

    return this.getById(userId, taskId);
  },

  async remove(userId: string, taskId: string) {
    const result = await tasksRepository.delete(taskId, userId);
    if (result.count === 0) {
      throw notFound('Task not found');
    }
  },

  async toggle(userId: string, taskId: string) {
    const task = await this.getById(userId, taskId);
    return this.update(userId, taskId, { completed: !task.completed });
  }
};
