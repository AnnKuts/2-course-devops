import { Router, Request, Response } from 'express';
import { getPool } from '../db';
import { sendResponse, taskListHtml, taskHtml } from '../helpers';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const tasks = await pool.query('SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC');
    sendResponse(req, res, tasks, taskListHtml(tasks));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { title } = req.body as { title?: string };
  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES (?)',
      [title.trim()]
    );
    const insertId = Number(result.insertId);
    const rows = await pool.query(
      'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
      [insertId]
    );
    const task = rows[0];
    res.status(201);
    sendResponse(req, res, task, taskHtml(task));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.post('/:id/done', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid task id' });
    return;
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      "UPDATE tasks SET status = 'done' WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const rows = await pool.query(
      'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
      [id]
    );
    const task = rows[0];
    sendResponse(req, res, task, taskHtml(task));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
