import express, { Application } from 'express';
import rootRouter from './routes/root';
import healthRouter from './routes/health';
import tasksRouter from './routes/tasks';

export function createApp(): Application {
  const app = express();
  app.use(express.json());
  app.use('/', rootRouter);
  app.use('/health', healthRouter);
  app.use('/tasks', tasksRouter);
  return app;
}
