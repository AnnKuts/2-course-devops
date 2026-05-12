import { Router, Request, Response } from 'express';
import { checkDbConnection } from '../db';

const router = Router();

router.get('/alive', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

router.get('/ready', async (_req: Request, res: Response) => {
  const healthy = await checkDbConnection();
  if (healthy) {
    res.status(200).send('OK');
  } else {
    res.status(500).send('Database connection unavailable');
  }
});

export default router;
