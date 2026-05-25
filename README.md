# Lesson 08: Jarvis Telegram Voice Assistant

Minimal homework project for Lesson 08. The bot accepts Telegram voice messages, transcribes them with Deepgram, sends the transcript to an OpenAI chat model, and replies in Telegram with both the transcript and a Jarvis-style answer.

Text messages are supported as a fallback: text goes directly to the LLM and the bot replies with text.

## Stack

- Node.js 20+
- TypeScript
- grammY for Telegram Bot API polling
- Deepgram Speech-to-Text through REST API
- OpenAI official SDK for LLM replies
- Local JSONL interaction log

## Setup

Install dependencies:

```bash
npm install
```

Create local environment file:

```bash
cp .env.example .env
```

Fill `.env` with real values. Do not commit `.env`.

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_USER_IDS=
DEEPGRAM_API_KEY=
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=
```

`TELEGRAM_ALLOWED_USER_IDS` is a comma-separated allowlist, for example:

```bash
TELEGRAM_ALLOWED_USER_IDS=123456789,987654321
```

## Run Locally

Start the bot in polling mode:

```bash
npm run dev
```

Optional TypeScript check:

```bash
npm run build
```

## Test With Telegram Voice

1. Create a Telegram bot with BotFather and put its token into `.env`.
2. Find your numeric Telegram user id and add it to `TELEGRAM_ALLOWED_USER_IDS`.
3. Start the bot with `npm run dev`.
4. Open your bot in Telegram.
5. Send a voice message.
6. Expected reply:

```text
Transcript:
<Deepgram transcript>

Jarvis:
<LLM answer>
```

7. Send a normal text message.
8. Expected reply: a Jarvis-style text answer.

Each processed or ignored interaction is appended to:

```text
logs/interactions.jsonl
```

Log fields:

- `timestamp`
- `telegramUserId`
- `inputType`
- `input`
- `assistantResponse`
- `status`
- `error`

## Homework Test Dialog Template

Use this 3-5 message dialog in the homework report after testing with real credentials:

```md
### Test dialog

1. Voice: "Jarvis, summarize what this bot does in one sentence."
   - Transcript: "Jarvis, summarize what this bot does in one sentence."
   - Jarvis: "This bot turns Telegram voice messages into text, sends them to an LLM, and replies with a concise assistant answer."

2. Text: "Give me one practical improvement for this homework project."
   - Jarvis: "Add short conversation memory per Telegram user so follow-up questions keep context."

3. Voice: "What should I check before publishing the repository?"
   - Transcript: "What should I check before publishing the repository?"
   - Jarvis: "Check that `.env` is ignored, `.env.example` has no secrets, README explains setup, and the bot logs interactions."
```

## Security Notes

- Real secrets are not committed.
- `.env` and `.env.*` are ignored by Git.
- `.env.example` contains variable names only.
- `logs/interactions.jsonl` is ignored because it may contain private message content.

## Acceptance Criteria

- `npm install` works.
- `npm run dev` starts the bot in polling mode.
- Sending a voice message returns transcript plus Jarvis answer.
- Sending text returns a Jarvis answer.
- Interactions are logged in `logs/interactions.jsonl`.
- No real secrets are committed.
