import { Request, Response } from 'express';

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

export function taskListHtml(tasks: { id: number; title: string; status: string; created_at: Date }[]): string {
  const rows = tasks
    .map(
      (t) =>
        `<tr><td>${t.id}</td><td>${escapeHtml(t.title)}</td><td>${t.status}</td><td>${t.created_at}</td></tr>`
    )
    .join('');
  return `<!DOCTYPE html><html><body>
<h1>Tasks</h1>
<table border="1">
<thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Created At</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;
}

export function taskHtml(t: { id: number; title: string; status: string; created_at: Date }): string {
  return `<!DOCTYPE html><html><body>
<h1>Task #${t.id}</h1>
<p><strong>Title:</strong> ${escapeHtml(t.title)}</p>
<p><strong>Status:</strong> ${t.status}</p>
<p><strong>Created at:</strong> ${t.created_at}</p>
</body></html>`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
