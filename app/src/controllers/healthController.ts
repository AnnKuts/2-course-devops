import { Request, Response } from "express";
import { checkDbConnection } from "../db";

export function alive(_req: Request, res: Response): void {
  res.status(200).send("OK");
}

export async function ready(_req: Request, res: Response): Promise<void> {
  const healthy = await checkDbConnection();
  if (healthy) {
    res.status(200).send("OK");
  } else {
    res.status(500).send("Database connection unavailable");
  }
}
