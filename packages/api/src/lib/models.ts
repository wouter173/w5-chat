import { openai } from '@ai-sdk/openai'
import { LanguageModelV1 } from 'ai'
import { Model } from './types'
import { anthropic } from '@ai-sdk/anthropic'

export const openAIModels = ['o4-mini', 'GPT-4.1', 'o3'] as const
export const anthropicModels = ['Claude 4 Sonnet'] as const

export const models = { openai: openAIModels, anthropic: anthropicModels } as const

export const getLanguageModel = (model: Model): LanguageModelV1 => {
  if (model === 'o4-mini') return openai('o4-mini')
  if (model === 'GPT-4.1') return openai('gpt-4.1')
  if (model === 'o3') return openai('o3')
  if (model === 'Claude 4 Sonnet') return anthropic('claude-4-sonnet-20250514')
  throw new Error(`Unsupported model: ${model}`)
}
