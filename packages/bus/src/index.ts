import z, { ZodSchema } from 'zod'

export const clientToServerSchema = z.union([
  z.object({ type: z.literal('hello') }),
  z.object({ type: z.literal('prompt'), payload: z.object({ content: z.string(), model: z.string() }) }),
  z.object({ type: z.literal('list-models'), payload: z.object({ content: z.string(), model: z.string() }) }),
])

export const serverToClientSchema = z.union([
  z.object({ type: z.literal('hello') }),
  z.object({ type: z.literal('part'), payload: z.object({ content: z.string() }) }),
  z.object({ type: z.literal('models'), payload: z.object({ content: z.string(), model: z.string() }) }),
])

function getBus<D extends ZodSchema, E extends ZodSchema>(
  decodeSchema: D,
): {
  encode: (msg: z.infer<E>) => string
  decode: (data: string) => z.infer<D>
} {
  return {
    encode: (msg: z.infer<E>) => {
      try {
        return JSON.stringify(msg)
      } catch (error) {
        throw new Error(`Failed to encode message: ${error}`)
      }
    },
    decode: (data: string) => {
      try {
        const parsed = JSON.parse(data)
        return decodeSchema.parse(parsed)
      } catch (error) {
        throw new Error(`Failed to decode message: ${error}`)
      }
    },
  }
}

export function createBus(environment: 'client'): ReturnType<typeof getBus<typeof serverToClientSchema, typeof clientToServerSchema>>
export function createBus(environment: 'server'): ReturnType<typeof getBus<typeof clientToServerSchema, typeof serverToClientSchema>>
export function createBus(environment: 'client' | 'server') {
  return environment === 'client' ? getBus(clientToServerSchema) : getBus(serverToClientSchema)
}
