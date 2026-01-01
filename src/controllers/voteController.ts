import { Request, Response } from 'express';
import Poll from '../models/Poll';
import { Types } from 'mongoose';

export async function castVote(req: Request, res: Response) {
  const { pollId, optionIndex, userId } = req.body;
  if (!pollId || optionIndex === undefined || !userId) {
    return res.status(400).json({ message: 'pollId, optionIndex, and userId are required.' });
  }

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });
    if (!poll.options[optionIndex]) return res.status(404).json({ message: 'Option not found.' });
    // NEW: Prevent double-voting
    if (poll.votes.some(v => v.userId.toString() === userId)) {
      return res.status(409).json({ message: 'You have already voted.' });
    }
    poll.options[optionIndex].votes += 1;
    poll.votes.push({ userId: new Types.ObjectId(userId), optionIndex });
    await poll.save();
    res.status(200).json({ poll });
  } catch (err) {
    res.status(500).json({ message: 'Vote failed', error: err });
  }
}

export async function getPollResults(req: Request, res: Response) {
  const { pollId } = req.params;
  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });
    res.status(200).json({ poll });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get poll results', error: err });
  }
}
