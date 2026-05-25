import { mkdir, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type InteractionLog = {
  timestamp: string;
  telegramUserId: number;
  inputType: "voice" | "text";
  input: string;
  assistantResponse: string | null;
  status: "success" | "error" | "ignored";
  error?: string;
};

const logPath = resolve("logs/interactions.jsonl");

export async function logInteraction(entry: InteractionLog): Promise<void> {
  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
}
