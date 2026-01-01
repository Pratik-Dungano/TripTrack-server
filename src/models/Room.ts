import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  roomCode: string;
  hostId: Types.ObjectId;
  members: Types.ObjectId[];
  status: 'chatting' | 'polling' | 'finished';
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomCode: { type: String, required: true, unique: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ],
  status: { type: String, enum: ['chatting', 'polling', 'finished'], default: 'chatting' },
  createdAt: { type: Date, default: Date.now }
});

export default model<IRoom>('Room', roomSchema);

