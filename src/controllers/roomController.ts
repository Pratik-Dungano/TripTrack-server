import { Request, Response } from 'express';
import Room, { IRoom } from '../models/Room';
import User from '../models/User';
import Message from '../models/Message';
import Poll from '../models/Poll';
import { Types } from 'mongoose';

export async function createRoom(req: Request, res: Response) {
  const { hostId } = req.body;
  if (!hostId) return res.status(400).json({ message: 'hostId is required.' });

  try {
    // Simple random code (should secure in production)
    let roomCode;
    do {
      roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    } while (await Room.findOne({ roomCode }));

    const room: IRoom = new Room({
      hostId: new Types.ObjectId(hostId),
      members: [new Types.ObjectId(hostId)],
      roomCode,
    });
    await room.save();
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Room creation failed', error: err });
  }
}

export async function joinRoom(req: Request, res: Response) {
  const { userId, roomCode } = req.body;
  if (!userId || !roomCode) return res.status(400).json({ message: 'userId and roomCode required.' });

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }
    res.status(200).json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join room', error: err });
  }
}

export async function getMessages(req: Request, res: Response) {
  const { roomCode } = req.params;
  if (!roomCode) return res.status(400).json({ message: 'roomCode required.' });

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    
    const messages = await Message.find({ roomId: room._id })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name');
    
    const messagesWithNames = messages.map((msg: any) => ({
      senderId: msg.senderId._id.toString(),
      senderName: msg.senderId?.name || 'Unknown',
      text: msg.text,
      timestamp: msg.timestamp,
      isSystem: false,
    }));
    
    res.status(200).json({ messages: messagesWithNames });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err });
  }
}

export async function getMyRooms(req: Request, res: Response) {
  const { hostId } = req.params;
  if (!hostId) return res.status(400).json({ message: 'hostId required.' });

  try {
    const rooms = await Room.find({ hostId: new Types.ObjectId(hostId) })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('members', 'name')
      .limit(50); // Limit to last 50 rooms
    
    const roomsWithDetails = rooms.map((room: any) => ({
      _id: room._id,
      roomCode: room.roomCode,
      status: room.status,
      memberCount: room.members.length,
      createdAt: room.createdAt,
    }));
    
    res.status(200).json({ rooms: roomsWithDetails });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: err });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { userId } = req.body;
  
  if (!roomCode || !userId) {
    return res.status(400).json({ message: 'roomCode and userId required.' });
  }

  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Verify user is the host
    if (room.hostId.toString() !== userId) {
      return res.status(403).json({ message: 'Only the room host can delete this room.' });
    }

    // Delete all related data
    await Message.deleteMany({ roomId: room._id });
    await Poll.deleteMany({ roomId: room._id });
    await Room.deleteOne({ _id: room._id });

    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete room', error: err });
  }
}

export async function getRoomInfo(req: Request, res: Response) {
  const { roomCode } = req.params;
  if (!roomCode) return res.status(400).json({ message: 'roomCode required.' });

  try {
    const room = await Room.findOne({ roomCode }).populate('hostId', 'name');
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    
    res.status(200).json({ 
      room: {
        _id: room._id,
        roomCode: room.roomCode,
        hostId: room.hostId._id ? room.hostId._id.toString() : room.hostId.toString(),
        status: room.status,
        createdAt: room.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch room info', error: err });
  }
}

