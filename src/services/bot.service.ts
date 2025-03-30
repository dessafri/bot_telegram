import { Telegraf } from "telegraf";

export class BotService {
  private bot: Telegraf;

  constructor(botToken: string) {
    this.bot = new Telegraf(botToken);
    this.setupCommands();

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  private setupCommands() {
    this.bot.start((ctx) => {
      ctx.reply("👋 Halo! Saya adalah bot Service Monitoring Jaringan.");
      ctx.reply(
        "🔹 Perintah yang tersedia:\n/start - Memulai bot\n/help - Bantuan\n/ping [ip address service] - cek jaringan service \n/tracert [ip address service] - cek jaringan service"
      );
    });

    // Handler ketika user mengirimkan "/help"
    this.bot.help((ctx) => {
      ctx.reply(
        "🔹 Perintah yang tersedia:\n/start - Memulai bot\n/help - Bantuan\n/echo [pesan] - Ulangi pesan Anda"
      );
    });

    // Handler untuk "/echo [pesan]"
    this.bot.command("echo", (ctx) => {
      const message = ctx.message.text.split(" ").slice(1).join(" ");
      if (!message) {
        return ctx.reply("⚠️ Harap masukkan pesan untuk diulang!");
      }
      ctx.reply(`🔁 ${message}`);
    });

    // Handler untuk setiap pesan yang dikirim pengguna
    this.bot.on("text", (ctx) => {
      ctx.reply(`📩 Anda mengirim: "${ctx.message.text}"`);
    });
  }

  // Method untuk memulai bot
  public startBot() {
    this.bot.launch();
    console.log("🤖 Bot Telegram telah dimulai...");
  }

  // Method untuk menangani shutdown dengan aman
  public stopBot() {
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  // Method untuk mendapatkan instance bot (jika diperlukan untuk webhook)
  public getBotInstance() {
    return this.bot;
  }
}
