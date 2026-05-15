import { Request, Response } from 'express';

export function index(req: Request, res: Response): void {
  const accept = req.headers['accept'] || '';
  if (!accept.includes('text/html')) {
    res.status(406).send('Not Acceptable');
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html><body>
<h1>mywebapp — Task Tracker</h1>
<ul>
  <li>GET /tasks — get all tasks</li>
  <li>POST /tasks — create a new task</li>
  <li>POST /tasks/:id/done — mark task as done</li>
</ul>
</body></html>`);
}
