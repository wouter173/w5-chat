import { openai } from '@ai-sdk/openai'
import type { LanguageModelV1 } from 'ai'
import type { Model } from './types'
import { anthropic } from '@ai-sdk/anthropic'

export const anthropicModels = ['Claude 4 Sonnet'] as const
export const openAIModels = ['o4-mini', 'GPT-4.1', 'GPT-4.1 nano'] as const

export const models = { anthropic: anthropicModels, openai: openAIModels } as const

export const getLanguageModel = (model: Model): LanguageModelV1 => {
  if (model === 'o4-mini') return openai('o4-mini')
  if (model === 'GPT-4.1') return openai('gpt-4.1')
  if (model === 'GPT-4.1 nano') return openai('gpt-4.1-nano')
  if (model === 'Claude 4 Sonnet') return anthropic('claude-4-sonnet-20250514')
  throw new Error(`Unsupported model: ${model}`)
}
