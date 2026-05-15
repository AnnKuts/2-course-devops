import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as taskService from '../services/taskService';
import { sendTask, sendTaskList } from '../utils/response';
import { createTaskSchema, taskIdSchema } from '../schemas/taskSchema';
import { formatZodError } from '../utils/zodError';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await taskService.getAllTasks();
    sendTaskList(req, res, tasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: formatZodError(parsed.error) });
    return;
  }
  try {
    const task = await taskService.createTask(parsed.data.title);
    res.status(201);
    sendTask(req, res, task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function markDone(req: Request, res: Response): Promise<void> {
  const parsed = taskIdSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ errors: formatZodError(parsed.error) });
    return;
  }
  try {
    const task = await taskService.markTaskDone(parsed.data.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    sendTask(req, res, task);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
}
