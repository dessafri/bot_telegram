// src/services/bot.service.ts
import { Telegraf } from "telegraf";
import { authService } from "./auth/auth.service";
import { requireAuth } from "../utils/middleware.util";
import { ISessionData, MonitoringResponse } from "../interface/types";
import axios from "axios";

export class BotService {
  private bot: Telegraf;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.registerCommands();
  }

  private registerCommands() {
    this.bot.command("login", async (ctx) => {
      const [email, password] = ctx.message.text.split(" ").slice(1);

      if (!email || !password) {
        await ctx.reply("Format: /login email password");
        return;
      }

      try {
        ctx.reply("Proses Login...");
        const loginSuccess = await authService.loginUser(
          ctx.chat.id,
          email,
          password
        );
        console.log("Login success:", loginSuccess);
        if (loginSuccess) {
          const userData = await authService.getLoggedInUser(ctx.chat.id);
          await ctx.reply(
            `✅ Login berhasil!\n` +
              `👋 Halo ${userData!.name!}!\n` +
              `📅 Session aktif hingga: ${userData?.expiresAt.toLocaleString()}`
          );
        } else {
          await ctx.reply("❌ Login gagal. Email atau password salah.");
        }
      } catch (error) {
        console.error("Login error:", error);
        await ctx.reply("⚠️ Terjadi error saat login. Silakan coba lagi.");
      }
    });
    this.bot.command("start", async (ctx) => {
      await ctx.reply(`✅ Selamat Datang Di BOT SISTEM MONITORING JARINGAN!`);
    });

    this.bot.command("logout", async (ctx) => {
      await authService.logoutUser(ctx.chat.id);
      await ctx.reply("Anda telah logout. Sampai jumpa lagi! 👋");
    });

    this.bot.command("status", async (ctx) => {
      const isLoggedIn = await authService.isUserLoggedIn(ctx.chat.id);

      if (isLoggedIn) {
        const userData = await authService.getLoggedInUser(ctx.chat.id);
        const remainingHours = (
          (userData!.expiresAt.getTime() - Date.now()) /
          (60 * 60 * 1000)
        ).toFixed(1);

        await ctx.reply(
          `🔓 Status: LOGGED IN\n` +
            `👤 Nama: ${userData?.userData.name}\n` +
            `📧 Email: ${userData?.email}\n` +
            `⏳ Sisa waktu: ${remainingHours} jam`
        );
      } else {
        await ctx.reply(
          "🔒 Status: NOT LOGGED IN\nGunakan /login email password"
        );
      }
    });

    this.bot.command("service", requireAuth, async (ctx) => {
      const args = ctx.message.text.split(" ").slice(1);
      const firstArg = args[0];

      if (!firstArg) {
        await ctx.reply(
          "Silakan masukkan parameter setelah perintah. Contoh:\n/service id_layanan"
        );
        return;
      }

      try {
        ctx.reply("Proses mengambil data...");
        const response = await axios.get<MonitoringResponse>(
          `${process.env.AUTH_API_ENDPOINT}/last-data`,
          {
            params: { id: firstArg },
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN}`,
            },
          }
        );

        const { success, data } = response.data;

        if (!success || data.length === 0) {
          await ctx.reply("Data tidak ada");
          return;
        }

        const d = data[0];
        const message = [
          `IP Main:          ${d.ipmain}`,
          `Link Main:        ${d.linkmain}`,
          `IP Backup:        ${d.ipbackup}`,
          `Link Backup:      ${d.linkbackup}`,
          `IP Power:         ${d.ippower}`,
          `Power Backup:     ${d.power_backup}`,
          `Input Power AC:   ${d.Input_Power_AC}`,
          `Output Power DC:  ${d.Output_Power_DC}`,
          `Power Load DC:    ${d.Power_Load_DC}`,
        ].join("\n");

        await ctx.reply(message);
      } catch (error) {
        console.error(error);
        await ctx.reply("Terjadi kesalahan saat mengambil data.");
      }
    });
  }

  public startBot() {
    this.bot.launch();
    console.log("🤖 Telegram Bot is running");

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}
