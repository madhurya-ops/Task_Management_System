import type { Request, Response } from 'express';
import { unauthorized } from '../../lib/errors';
import { tasksService } from './tasks.service';
import type { ListTasksQuery, UpdateTaskInput } from './tasks.schemas';

const getUserId = (req: Request): string => {
  if (!req.user?.sub) {
    throw unauthorized('Unauthorized');
  }
  return req.user.sub;
};

export const tasksController = {
  async list(req: Request, res: Response) {
    const userId = getUserId(req);
    const result = await tasksService.list(userId, req.query as unknown as ListTasksQuery);
    return res.status(200).json(result);
  },

  async create(req: Request, res: Response) {
    const userId = getUserId(req);
    const task = await tasksService.create(userId, req.body);
    return res.status(201).json({ task });
  },

  async getById(req: Request, res: Response) {
    const userId = getUserId(req);
    const task = await tasksService.getById(userId, req.params.id as string);
    return res.status(200).json({ task });
  },

  async update(req: Request, res: Response) {
    const userId = getUserId(req);
    const task = await tasksService.update(userId, req.params.id as string, req.body as UpdateTaskInput);
    return res.status(200).json({ task });
  },

  async remove(req: Request, res: Response) {
    const userId = getUserId(req);
    await tasksService.remove(userId, req.params.id as string);
    return res.status(204).send();
  },

  async toggle(req: Request, res: Response) {
    const userId = getUserId(req);
    const task = await tasksService.toggle(userId, req.params.id as string);
    return res.status(200).json({ task });
  }
};
