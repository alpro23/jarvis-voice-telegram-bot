import { loadConfig } from "./config.js";
import { createTelegramBot } from "./telegram.js";

const config = loadConfig();
const bot = createTelegramBot(config);

console.log("Jarvis Telegram voice assistant is starting in polling mode...");

await bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} is running. Press Ctrl+C to stop.`);
  }
});
