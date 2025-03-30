import { Request, Response } from "express";
import { responseError } from "../utils/reponse.util";

export const getBot = (req: Request, res: Response) => {
  try {
    // TODO: Implementasi logika untuk mendapatkan bot
    res.json({ success: true, message: "Bot data retrieved successfully" });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    res
      .status(500)
      .json(responseError(500, errMessage, "Error Controller Get Bot"));
  }
};
