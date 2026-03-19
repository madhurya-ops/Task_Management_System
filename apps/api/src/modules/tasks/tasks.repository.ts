import type { Prisma, Task } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const DEFAULT_ORDER: Prisma.TaskOrderByWithRelationInput[] = [{ createdAt: 'desc' }, { id: 'desc' }];
const TASK_LIST_SELECT = {
  id: true,
  userId: true,
  title: true,
  description: true,
  completed: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.TaskSelect;

export const tasksRepository = {
  findByIdAndUser(taskId: string, userId: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: { id: taskId, userId },
      select: TASK_LIST_SELECT
    });
  },

  create(data: { userId: string; title: string; description?: string; dueDate?: Date | null }) {
    return prisma.task.create({ data });
  },

  update(taskId: string, userId: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.updateMany({
      where: { id: taskId, userId },
      data
    });
  },

  delete(taskId: string, userId: string) {
    return prisma.task.deleteMany({ where: { id: taskId, userId } });
  },

  list(params: {
    userId: string;
    cursor?: string;
    limit: number;
    status?: 'completed' | 'pending';
    search?: string;
  }) {
    return prisma.task.findMany({
      select: TASK_LIST_SELECT,
      where: {
        userId: params.userId,
        ...(params.status ? { completed: params.status === 'completed' } : {}),
        ...(params.search
          ? {
              title: {
                contains: params.search,
                mode: 'insensitive'
              }
            }
          : {})
      },
      orderBy: DEFAULT_ORDER,
      take: params.limit + 1,
      ...(params.cursor
        ? {
            cursor: { id: params.cursor },
            skip: 1
          }
        : {})
    });
  }
};
