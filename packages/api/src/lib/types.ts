import { models } from './models'

export type Message = {
  id: string
  role: string
  content: string
  createdAt: Date
  model: string | null
}

export type Model = (typeof models)[keyof typeof models][number]
