import { Request, Response } from 'express';
import { Task } from '../types/task';

function acceptsHtml(req: Request): boolean {
  const accept = req.headers['accept'] || '';
  return accept.includes('text/html');
}

export function sendTaskList(req: Request, res: Response, tasks: Task[]): void {
  if (acceptsHtml(req)) {
    res.render('tasks/list', { tasks });
  } else {
    res.json(tasks);
  }
}

export function sendTask(req: Request, res: Response, task: Task): void {
  if (acceptsHtml(req)) {
    res.render('tasks/task', { task });
  } else {
    res.json(task);
  }
}
