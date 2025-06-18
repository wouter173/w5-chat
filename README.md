# W5 Chat

This is my submission to the [t3 chat cloneathon](https://cloneathon.t3.chat/), built fully by myself.

## Supported Models

- OpenAI: o4-mini, GPT-4.1 nano, GPT-4.1
- Anthropic: Claude 4 Sonnet

## Stack

- React Router
- TRPC
- Streaming TRPC
- Express
- Clerk

## Featureset

- [x] Chat with Various LLMs
- [x] Authentication & Sync
- [x] Browser Friendly
- [x] Easy to Try

- [x] Syntax Highlighting
- [x] Resumable Streams

### Fix

- [x] og prompt in new chats disappear

### TODO

- [x] model selection with multiple models from multiple providers
- [x] auth
- [x] chat ui
- [x] chat history
- [x] chat resumability
  - [x] multiple clients can stream the same chat at the same time
  - [x] automatically rejoin the stream when reconnecting or switching chat
  - [x] show response history when rejoining stream
- [x] chat deletion
- [x] render performance / loading state
- [x] markdown formatting and syntax highlighting
- [x] clerk release mode
- [x] sign-in ui
- [ ] model chat memory (locally is fine)
- [ ] live sidebar with subscription

### nice to have:

- [ ] user permission limiting
- [ ] chat forking
- [ ] smooth animating text

## Run

Copy over the .env.example to .env and fill in all variables.

### Production

```
pnpm db:push

pnpm build
pnpm start
```

### Development

```
pnpm dev
```
