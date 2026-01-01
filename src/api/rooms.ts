import { Router } from 'express';
import { createRoom, joinRoom, getMessages, getMyRooms, deleteRoom, getRoomInfo } from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/:roomCode/messages', getMessages);
router.get('/:roomCode/info', getRoomInfo);
router.get('/my/:hostId', getMyRooms);
router.delete('/:roomCode', deleteRoom);

export default router;

