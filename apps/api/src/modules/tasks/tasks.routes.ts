import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../lib/async-handler';
import { tasksController } from './tasks.controller';
import { createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema } from './tasks.schemas';

export const tasksRouter = Router();

tasksRouter.use(authMiddleware);

tasksRouter.get('/', validate(listTasksSchema), asyncHandler(tasksController.list));
tasksRouter.post('/', validate(createTaskSchema), asyncHandler(tasksController.create));
tasksRouter.get('/:id', validate(taskIdSchema), asyncHandler(tasksController.getById));
tasksRouter.patch('/:id', validate(updateTaskSchema), asyncHandler(tasksController.update));
tasksRouter.delete('/:id', validate(taskIdSchema), asyncHandler(tasksController.remove));
tasksRouter.patch('/:id/toggle', validate(taskIdSchema), asyncHandler(tasksController.toggle));
