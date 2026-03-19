import { z } from 'zod';

const status = z.enum(['completed', 'pending']);

export const listTasksSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: status.optional(),
    search: z.string().trim().max(200).optional()
  })
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    dueDate: z.string().datetime().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const taskIdSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(2000).nullable().optional(),
      completed: z.boolean().optional(),
      dueDate: z.string().datetime().nullable().optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field must be provided'
    }),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export type ListTasksQuery = z.infer<typeof listTasksSchema>['query'];
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
