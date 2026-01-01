import { Router } from 'express';
import { analyzeChat } from '../controllers/aiController';

const router = Router();

router.post('/analyze', analyzeChat);

export default router;

