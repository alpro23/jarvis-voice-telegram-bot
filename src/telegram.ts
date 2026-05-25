import { Bot, Context } from "grammy";
import { transcribeAudio } from "./deepgram.js";
import { askJarvis } from "./llm.js";
import { logInteraction } from "./logger.js";
import type { Config } from "./config.js";

function userIdFromContext(ctx: Context): number | undefined {
  return ctx.from?.id;
}

async function rejectUnauthorized(ctx: Context, config: Config, inputType: "voice" | "text"): Promise<boolean> {
  const userId = userIdFromContext(ctx);
  if (!userId || !config.allowedUserIds.has(userId)) {
    if (userId) {
      await logInteraction({
        timestamp: new Date().toISOString(),
        telegramUserId: userId,
        inputType,
        input: "",
        assistantResponse: null,
        status: "ignored",
        error: "User is not in TELEGRAM_ALLOWED_USER_IDS"
      });
    }
    return true;
  }

  return false;
}

async function downloadTelegramFile(bot: Bot, token: string, fileId: string): Promise<Buffer> {
  const file = await bot.api.getFile(fileId);
  if (!file.file_path) {
    throw new Error("Telegram getFile did not return file_path.");
  }

  const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Telegram file download failed: ${response.status} ${await response.text()}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function formatVoiceReply(transcript: string, answer: string): string {
  return [`Transcript:`, transcript, "", `Jarvis:`, answer].join("\n");
}

export function createTelegramBot(config: Config): Bot {
  const bot = new Bot(config.telegramBotToken);

  bot.on("message:voice", async (ctx) => {
    const userId = userIdFromContext(ctx);
    if (await rejectUnauthorized(ctx, config, "voice")) {
      return;
    }

    const timestamp = new Date().toISOString();
    let transcript = "";
    let assistantResponse: string | null = null;

    try {
      await ctx.reply("Voice received. Transcribing...");
      const audio = await downloadTelegramFile(bot, config.telegramBotToken, ctx.message.voice.file_id);
      transcript = await transcribeAudio({
        apiKey: config.deepgramApiKey,
        audio,
        mimeType: ctx.message.voice.mime_type ?? "audio/ogg"
      });
      assistantResponse = await askJarvis({
        apiKey: config.groqApiKey,
        model: config.groqChatModel,
        input: transcript
      });

      await ctx.reply(formatVoiceReply(transcript, assistantResponse));
      await logInteraction({
        timestamp,
        telegramUserId: userId!,
        inputType: "voice",
        input: transcript,
        assistantResponse,
        status: "success"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.reply(`Jarvis could not process that voice message: ${message}`);
      await logInteraction({
        timestamp,
        telegramUserId: userId!,
        inputType: "voice",
        input: transcript,
        assistantResponse,
        status: "error",
        error: message
      });
    }
  });

  bot.on("message:text", async (ctx) => {
    const userId = userIdFromContext(ctx);
    if (await rejectUnauthorized(ctx, config, "text")) {
      return;
    }

    const timestamp = new Date().toISOString();
    const input = ctx.message.text;
    let assistantResponse: string | null = null;

    try {
      assistantResponse = await askJarvis({
        apiKey: config.groqApiKey,
        model: config.groqChatModel,
        input
      });

      await ctx.reply(assistantResponse);
      await logInteraction({
        timestamp,
        telegramUserId: userId!,
        inputType: "text",
        input,
        assistantResponse,
        status: "success"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.reply(`Jarvis could not answer that message: ${message}`);
      await logInteraction({
        timestamp,
        telegramUserId: userId!,
        inputType: "text",
        input,
        assistantResponse,
        status: "error",
        error: message
      });
    }
  });

  bot.catch((error) => {
    console.error("Telegram bot error:", error);
  });

  return bot;
}
