import { z } from 'zod'

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  DB_URL: z.string(),
  DB_TOKEN: z.string().optional(),
})

// Map the env vars individually to make sure the turbo eslint plugin works
envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  DB_URL: process.env.DB_URL,
  DB_TOKEN: process.env.DB_TOKEN,
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
