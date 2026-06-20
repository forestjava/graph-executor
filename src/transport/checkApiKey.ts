import { timingSafeEqual } from "node:crypto";
import type http from "node:http";
import { env } from "../config/env.js";

export function checkApiKey(req: http.IncomingMessage): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return false;
  }

  const token = header.slice("Bearer ".length);
  const expected = Buffer.from(env.API_KEY);
  const actual = Buffer.from(token);
  return timingSafeEqual(expected, actual);
}
