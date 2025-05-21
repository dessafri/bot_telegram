// src/utils/middleware.ts
import { Telegraf } from 'telegraf';
import { authService } from '../services/auth/auth.service';
import { ISessionData } from '../interface/types';

export async function requireAuth(
  ctx: any,
  next: () => Promise<void>
): Promise<void> {
  const chatId = ctx.chat?.id;
  
  if (!chatId) {
    await ctx.reply('Error: Tidak dapat mengidentifikasi chat');
    return;
  }

  const isLoggedIn = await authService.isUserLoggedIn(chatId);
  if (!isLoggedIn) {
    await ctx.reply(
      '🔒 Akses ditolak!\n' +
      'Anda harus login terlebih dahulu dengan /login email password'
    );
    return;
  }

  // Tambahkan user data ke context jika diperlukan
  const userData = await authService.getLoggedInUser(chatId);
  ctx.state.user = userData;

  await next();
}