import { getPool } from '../db';
import { Task } from '../utils/html';

export async function findAll(): Promise<Task[]> {
  const pool = getPool();
  return pool.query('SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC');
}

export async function create(title: string): Promise<Task> {
  const pool = getPool();
  const result = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
  const rows = await pool.query(
    'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
    [Number(result.insertId)]
  );
  return rows[0];
}

export async function setDone(id: number): Promise<Task | null> {
  const pool = getPool();
  const result = await pool.query("UPDATE tasks SET status = 'done' WHERE id = ?", [id]);
  if (result.affectedRows === 0) return null;
  const rows = await pool.query(
    'SELECT id, title, status, created_at FROM tasks WHERE id = ?',
    [id]
  );
  return rows[0];
}
