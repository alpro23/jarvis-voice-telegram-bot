import "dotenv/config";

export type Config = {
  telegramBotToken: string;
  allowedUserIds: Set<number>;
  deepgramApiKey: string;
  openAiApiKey: string;
  openAiChatModel: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseAllowedUserIds(raw: string): Set<number> {
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => Number(id));

  if (ids.length === 0 || ids.some((id) => !Number.isSafeInteger(id))) {
    throw new Error("TELEGRAM_ALLOWED_USER_IDS must be a comma-separated list of numeric Telegram user ids.");
  }

  return new Set(ids);
}

export function loadConfig(): Config {
  return {
    telegramBotToken: requiredEnv("TELEGRAM_BOT_TOKEN"),
    allowedUserIds: parseAllowedUserIds(requiredEnv("TELEGRAM_ALLOWED_USER_IDS")),
    deepgramApiKey: requiredEnv("DEEPGRAM_API_KEY"),
    openAiApiKey: requiredEnv("OPENAI_API_KEY"),
    openAiChatModel: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini"
  };
}
