import { Request, Response } from 'express';
import { Task, taskListHtml, taskHtml } from '../utils/html';

export function sendResponse(
  req: Request,
  res: Response,
  data: object | object[],
  htmlContent: string
): void {
  const accept = req.headers['accept'] || '';
  if (accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } else {
    res.json(data);
  }
}

export function sendTask(req: Request, res: Response, task: Task): void {
  sendResponse(req, res, task, taskHtml(task));
}

export function sendTaskList(req: Request, res: Response, tasks: Task[]): void {
  sendResponse(req, res, tasks, taskListHtml(tasks));
}
