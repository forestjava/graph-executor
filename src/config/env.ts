import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  ASSETS_DIR: z
    .string()
    .default("assets")
    .transform((value) => path.resolve(process.cwd(), value)),
  NEO4J_URI: z.string().nonempty(),
  NEO4J_DATABASE: z.string().nonempty(),
  NEO4J_USER: z.string().nonempty(),
  NEO4J_PASSWORD: z.string().nonempty(),
});
export type Env = z.infer<typeof envSchema>;

export function envParse(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export const env = envParse();
