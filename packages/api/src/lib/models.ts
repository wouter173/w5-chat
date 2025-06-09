import { openai } from '@ai-sdk/openai'
import { OpenAIChatModelId } from '@ai-sdk/openai/internal'
import { LanguageModelV1 } from 'ai'

export const models = ['o4-mini', 'gpt-4.1'] as const satisfies OpenAIChatModelId[]

export const getLanguageModel = (model: (typeof models)[number]): LanguageModelV1 => {
  if (model === 'o4-mini') return openai('o4-mini')
  if (model === 'gpt-4.1') return openai('gpt-4.1')
  throw new Error(`Unsupported model: ${model}`)
}
