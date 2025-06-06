// src/index.ts
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { router } from "./routes";
import { BotService } from "./services/bot.service"; // ✅ fix this import

const app = express();
const botService = new BotService(process.env.TELEGRAM_BOT_TOKEN as string);

botService.startBot(); // ✅ start the bot

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
