export type SynthesizeSpeechOptions = {
  apiKey: string;
  model: string;
  text: string;
};

const MAX_TTS_CHARS = 1900;

function textForTts(text: string): string {
  const normalized = text.trim();
  if (normalized.length <= MAX_TTS_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_TTS_CHARS - 1).trim()}...`;
}

export async function synthesizeSpeech({ apiKey, model, text }: SynthesizeSpeechOptions): Promise<Buffer> {
  const speakText = textForTts(text);
  if (!speakText) {
    throw new Error("Cannot synthesize an empty response.");
  }

  const params = new URLSearchParams({
    model,
    encoding: "opus",
    container: "ogg"
  });

  const response = await fetch(`https://api.deepgram.com/v1/speak?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: speakText })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram TTS failed: ${response.status} ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
