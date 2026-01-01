import { Request, Response } from 'express';
import Message from '../models/Message';
import Room from '../models/Room';
import { analyzeChatTranscript } from '../services/gemini.service';

export async function analyzeChat(req: Request, res: Response) {
  const { roomCode } = req.body;
  if (!roomCode) return res.status(400).json({ message: 'roomCode required' });

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const messages = await Message.find({ roomId: room._id }).sort({ timestamp: 1 });
    const transcript = messages.map((m) => `${m.senderId}: ${m.text}`).join('\n');
    // Call Gemini
    const geminiResult = await analyzeChatTranscript(transcript);
    res.json({ analysis: geminiResult });
  } catch (err) {
    console.error("AI Analysis Error:", err);  // Add or verify this line
    res.status(500).json({ message: 'AI analysis failed', error: err });
  }
}

