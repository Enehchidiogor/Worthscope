/* WorthScope — Koko client helpers.
   Streams chat from the koko-chat edge function and fetches videos from
   koko-youtube. Pure browser-side; relies on the Lovable Cloud project URL
   from VITE_SUPABASE_URL. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type KokoMission = {
  title?: string;
  description?: string;
  career?: string;
  phase?: string;
  userName?: string;
  userAge?: number;
};

export type KokoMsg = { role: "user" | "assistant"; content: string };

export type KokoVideo = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  durationSec: number;
  views: number;
  score: number;
};

export async function fetchKokoVideos(query: string, max = 3): Promise<KokoVideo[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/koko-youtube`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ query, max }),
  });
  if (!res.ok) throw new Error(`Video search failed: ${res.status}`);
  const data = await res.json();
  return data.videos || [];
}

export async function streamKokoChat({
  messages,
  intent = "chat",
  mission,
  onDelta,
  onDone,
  onError,
}: {
  messages: KokoMsg[];
  intent?: "chat" | "stuck" | "verify" | "lesson" | "qa";
  mission?: KokoMission;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError?: (err: Error) => void;
}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/koko-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, intent, mission }),
    });
    if (!res.ok || !res.body) {
      const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errBody.error || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") {
          streamDone = true;
          break;
        }
        try {
          const parsed = JSON.parse(json);
          const content: string | undefined = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          // partial — push back and wait
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError?.(e instanceof Error ? e : new Error("stream failed"));
  }
}
