export type TranscribeAudioOptions = {
  apiKey: string;
  audio: Buffer;
  mimeType?: string;
};

type DeepgramResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
      }>;
    }>;
  };
};

export async function transcribeAudio({ apiKey, audio, mimeType = "audio/ogg" }: TranscribeAudioOptions): Promise<string> {
  const audioBody = new Uint8Array(audio);
  const params = new URLSearchParams({
    model: "nova-2",
    detect_language: "true",
    smart_format: "true",
    punctuate: "true"
  });

  const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": mimeType
    },
    body: audioBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram transcription failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as DeepgramResponse;
  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim();

  if (!transcript) {
    throw new Error("Deepgram returned an empty transcript.");
  }

  return transcript;
}
