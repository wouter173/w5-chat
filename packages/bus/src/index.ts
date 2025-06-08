import z from 'zod'

const schema = z.union([
  z.object({
    type: z.literal('part'), // Model response
    payload: z.object({
      content: z.string(),
    }),
  }),
  z.object({
    type: z.literal('hello'),
  }),
  z.object({
    type: z.literal('prompt'),
    payload: z.object({
      content: z.string(),
      model: z.string(),
    }),
  }),
])

export const bus = {
  decode: (data: string): z.infer<typeof schema> => {
    try {
      const parsed = JSON.parse(data)
      return schema.parse(parsed)
    } catch (error) {
      throw new Error(`Failed to decode message: ${error}`)
    }
  },

  encode: (msg: z.infer<typeof schema>) => {
    try {
      return JSON.stringify(msg)
    } catch (error) {
      throw new Error(`Failed to encode message: ${error}`)
    }
  },
}
