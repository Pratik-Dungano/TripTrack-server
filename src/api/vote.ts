import { Router } from 'express';
import { castVote, getPollResults } from '../controllers/voteController';

const router = Router();

router.post('/cast', castVote);
router.get('/:pollId', getPollResults);

export default router;

