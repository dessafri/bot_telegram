// src/services/database.service.ts
import mongoose from "mongoose";
import { UserSession } from "../../models/sessions";
import { ISessionData } from "../../interface/types";

class DatabaseService {
  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/telegramBotDB";

    try {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  public async saveSession(sessionData: ISessionData): Promise<boolean> {
    try {
      await UserSession.findOneAndUpdate(
        { chatId: sessionData.chatId },
        sessionData,
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  }

  public async getSession(chatId: number): Promise<ISessionData | null> {
    return UserSession.findOne({ chatId }).lean();
  }

  public async deleteSession(chatId: number): Promise<boolean> {
    const result = await UserSession.deleteOne({ chatId });
    return result.deletedCount > 0;
  }
}

export const databaseService = new DatabaseService();
