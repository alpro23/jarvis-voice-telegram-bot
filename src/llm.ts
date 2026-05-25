import OpenAI from "openai";

const JARVIS_SYSTEM_PROMPT = [
  "You are Jarvis, a concise and practical AI assistant for Mr. Stark.",
  "Reply in the same language as the user unless there is a clear reason to switch.",
  "Be helpful, direct, technically accurate, and slightly elegant.",
  "Do not mention internal policies or implementation details."
].join(" ");

export type LlmOptions = {
  apiKey: string;
  model: string;
  input: string;
};

export async function askJarvis({ apiKey, model, input }: LlmOptions): Promise<string> {
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: JARVIS_SYSTEM_PROMPT },
      { role: "user", content: input }
    ],
    temperature: 0.6
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("OpenAI returned an empty assistant response.");
  }

  return answer;
}
