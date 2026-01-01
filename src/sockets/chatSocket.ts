import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';

interface JoinRoomData {
  roomCode: string;
  userId: string;
}

interface SendMessageData {
  roomCode: string;
  senderId: string;
  text: string;
}

export default function setupChatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Join Socket.IO room
    socket.on('join_room', async (data: JoinRoomData) => {
      const { roomCode, userId } = data;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userId = userId;
      
      // Fetch user name from database
      try {
        const user = await User.findById(userId);
        const userName = user?.name || 'Someone';
        socket.to(roomCode).emit('receive_message', { 
          senderId: 'system', 
          senderName: 'System',
          text: `${userName} joined the room.`,
          isSystem: true
        });
      } catch (err) {
        // Fallback if user not found
        socket.to(roomCode).emit('receive_message', { 
          senderId: 'system', 
          senderName: 'System',
          text: `Someone joined the room.`,
          isSystem: true
        });
      }
    });

    // Receive and forward messages
    socket.on('send_message', async (data: SendMessageData) => {
      const { roomCode, senderId, text } = data;
      if (!roomCode || !senderId || !text) return;
      // Persist to DB
      const room = await Room.findOne({ roomCode });
      if (!room) return;
      const msg = new Message({ roomId: room._id, senderId, text });
      await msg.save();
      
      // Fetch sender name
      try {
        const sender = await User.findById(senderId);
        const senderName = sender?.name || 'Unknown';
        io.to(roomCode).emit('receive_message', {
          roomCode,
          senderId,
          senderName,
          text,
          timestamp: msg.timestamp,
          isSystem: false,
        });
      } catch (err) {
        // Fallback if user not found
        io.to(roomCode).emit('receive_message', {
          roomCode,
          senderId,
          senderName: 'Unknown',
          text,
          timestamp: msg.timestamp,
          isSystem: false,
        });
      }
    });

    // Handle disconnect logic if needed
    socket.on('disconnect', () => {
      // Any cleanup if needed
    });
  });
}
