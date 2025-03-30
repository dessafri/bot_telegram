import express from "express";
import userRoutes from "./bot.routes";

export const router = express.Router();

router.use("/users", userRoutes);
