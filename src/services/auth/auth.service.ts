// src/services/auth.service.ts
import axios from "axios";
import { databaseService } from "../database/database.service";
import { ISessionData, IAuthAPIResponse } from "../../interface/types";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 jam

class AuthService {
  private sessions = new Map<number, ISessionData>(); // Cache lokal

  public async loginUser(
    chatId: number,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      // Verifikasi ke API eksternal
      console.log("AUTH_API_ENDPOINT:", process.env.AUTH_API_ENDPOINT);
      console.log("API_TOKEN:", process.env.API_TOKEN);
      const { data } = await axios.post<IAuthAPIResponse>(
        `${process.env.AUTH_API_ENDPOINT}/login`,
        { email, password }, // <-- ini body request (data)
        {
          headers: {
            Authorization: `Bearer ${process.env.API_TOKEN}`,
          },
        }
      );
      if(!data.success) return false;

      // Buat session data
      const sessionData: ISessionData = {
        chatId,
        email,
        token: data.token!,
        name: data.user!.name,
        userData: data.user!,
        loggedInAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      };

      // Simpan ke database
      const saved = await databaseService.saveSession(sessionData);
      if (!saved) return false;

      // Simpan ke cache memory
      this.sessions.set(chatId, sessionData);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  public async isUserLoggedIn(chatId: number): Promise<boolean> {
    if (this.sessions.has(chatId)) {
      const session = this.sessions.get(chatId)!;
      if (new Date() < session.expiresAt) {
        return true;
      }
      this.sessions.delete(chatId);
    }

    const session = await databaseService.getSession(chatId);
    if (!session) return false;

    if (new Date() >= session.expiresAt) {
      await this.logoutUser(chatId);
      return false;
    }

    this.sessions.set(chatId, session);
    return true;
  }

  public async logoutUser(chatId: number): Promise<boolean> {
    this.sessions.delete(chatId);
    return databaseService.deleteSession(chatId);
  }

  public async getLoggedInUser(chatId: number): Promise<ISessionData | null> {
    if (this.sessions.has(chatId)) {
      return this.sessions.get(chatId)!;
    }

    const session = await databaseService.getSession(chatId);
    if (session) {
      this.sessions.set(chatId, session);
    }
    return session;
  }
}

export const authService = new AuthService();
