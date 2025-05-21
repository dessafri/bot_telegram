// src/models/UserSession.ts
import { Schema, model, Document } from 'mongoose';
import { ISessionData } from '../../interface/types';

interface IUserSessionDocument extends ISessionData, Document {}

const userSessionSchema = new Schema<IUserSessionDocument>({
  chatId: { type: Number, required: true, unique: true },
  email: { type: String, required: true },
  token: { type: String, required: true },
  userData: { type: Object, required: true },
  loggedInAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index untuk auto-expire setelah 24 jam
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UserSession = model<IUserSessionDocument>('UserSession', userSessionSchema);