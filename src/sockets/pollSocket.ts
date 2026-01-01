import { Server, Socket } from 'socket.io';
import Poll from '../models/Poll';
import { Types } from 'mongoose';

export default function setupPollSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    // join poll room
    socket.on('join_poll', (pollId: string) => {
      socket.join(pollId);
    });

    // real-time vote sync with double-vote block
    socket.on('cast_vote', async ({ pollId, optionIndex, userId }: { pollId: string, optionIndex: number, userId: string }) => {
      const poll = await Poll.findById(pollId);
      if (!poll) return;
      if (!poll.options[optionIndex]) return;
      if (poll.votes.some(v => v.userId.toString() === userId)) return;
      poll.options[optionIndex].votes += 1;
      poll.votes.push({ userId: new Types.ObjectId(userId), optionIndex });
      await poll.save();
      io.to(pollId).emit('poll_result', { poll });
    });
  });
}
