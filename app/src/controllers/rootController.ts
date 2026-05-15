import { Request, Response } from 'express';

export function index(req: Request, res: Response): void {
  const accept = req.headers['accept'] || '';
  if (!accept.includes('text/html')) {
    res.status(406).send('Not Acceptable');
    return;
  }
  res.render('index');
}
