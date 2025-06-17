class CacheMessage {
  private tokens: string[] = []

  getTokens() {
    return this.tokens
  }

  addToken(token: string) {
    this.tokens.push(token)
  }
}

const messageCache = new Map<string, CacheMessage>()

export const createMessageCache = (chatId: string) => {
  const mc = new CacheMessage()
  messageCache.set(chatId, mc)
  return mc
}

export const getMessageCache = (chatId: string) => {
  if (!messageCache.has(chatId)) {
    return null
  }
  return messageCache.get(chatId)!
}

export const safeRemoveMessageCache = (chatId: string) => {
  if (messageCache.has(chatId)) {
    console.log('Removing message cache for', chatId)
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    messageCache.delete(chatId)
  }
}
