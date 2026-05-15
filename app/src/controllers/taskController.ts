import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { sendTask, sendTaskList } from '../utils/response';

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await taskService.getAllTasks();
    sendTaskList(req, res, tasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const { title } = req.body as { title?: string };
  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  try {
    const task = await taskService.createTask(title);
    res.status(201);
    sendTask(req, res, task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function markDone(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid task id' });
    return;
  }
  try {
    const task = await taskService.markTaskDone(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    sendTask(req, res, task);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
}
