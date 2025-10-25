import type { NextApiRequest, NextApiResponse } from "next";
import { getIO } from "@/lib/websocket/server";

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    res.status(500).end();
    return;
  }

  getIO(res as any);
  res.end();
}
