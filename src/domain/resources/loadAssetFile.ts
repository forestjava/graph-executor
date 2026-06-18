import { readFileSync } from "node:fs";
import path from "node:path";
import { env } from "../../config/env.js";

export function loadAssetFile(filename: string): string {
  return readFileSync(path.join(env.ASSETS_DIR, filename), "utf8");
}
