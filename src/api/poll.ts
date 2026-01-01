import { Router } from 'express';
import { generatePoll } from '../controllers/pollController';

const router = Router();

router.post('/generate', generatePoll);

export default router;

