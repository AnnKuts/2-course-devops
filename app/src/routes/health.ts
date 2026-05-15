import { Router } from 'express';
import * as healthController from '../controllers/healthController';

const router = Router();

router.get('/alive', healthController.alive);
router.get('/ready', healthController.ready);

export default router;
