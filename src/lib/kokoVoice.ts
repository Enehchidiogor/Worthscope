/* Koko Voice — thin WebRTC controller for the real-time voice discovery
   conversation. Fetches a short-lived token from koko-voice-session, then
   connects the browser DIRECTLY to OpenAI's Realtime API over WebRTC (not
   proxied through Supabase — edge functions aren't built for long-lived
   duplex media). No React here; DiscoverVoice.tsx owns all UI state. */

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || PUBLISHABLE_KEY}`,
  };
}

export async function fetchVoiceSessionToken(): Promise<{ client_secret: string; expires_at: number }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/koko-voice-session`, {
    method: "POST",
    headers: await authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export type KokoVoiceState = "idle" | "connecting" | "active" | "error" | "closed";

export type KokoVoiceHandlers = {
  onState?: (state: KokoVoiceState, detail?: string) => void;
  onTrack?: (stream: MediaStream) => void;
  onTranscriptDelta?: (text: string, speaker: "koko" | "user") => void;
  onToolCall?: (name: string, args: Record<string, unknown>, callId: string) => void;
  onSpeaking?: (speaking: boolean) => void;
};

export class KokoVoiceSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private handlers: KokoVoiceHandlers;

  constructor(handlers: KokoVoiceHandlers) {
    this.handlers = handlers;
  }

  async connect() {
    this.handlers.onState?.("connecting");
    const { client_secret } = await fetchVoiceSessionToken();

    // getUserMedia must be called close to the user gesture that started
    // this — Safari in particular can reject it if there's too much async
    // work in between, so this runs as early as possible in connect().
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const pc = new RTCPeerConnection();
    this.pc = pc;

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        this.handlers.onState?.("error", "Connection lost");
      }
    };

    pc.ontrack = (e) => {
      if (e.streams[0]) this.handlers.onTrack?.(e.streams[0]);
    };

    this.localStream.getAudioTracks().forEach((track) => pc.addTrack(track, this.localStream!));

    const dc = pc.createDataChannel("oai-events");
    this.dc = dc;
    dc.onmessage = (e) => this.handleEvent(e.data);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client_secret}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    });
    if (!sdpRes.ok) {
      const t = await sdpRes.text().catch(() => "");
      throw new Error(`Couldn't connect to Koko (${sdpRes.status}). ${t.slice(0, 200)}`);
    }
    const answerSdp = await sdpRes.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    this.handlers.onState?.("active");
  }

  private handleEvent(raw: string) {
    let evt: Record<string, unknown>;
    try {
      evt = JSON.parse(raw);
    } catch {
      return;
    }
    const type = evt.type as string;

    if (type === "response.output_audio_transcript.delta" && typeof evt.delta === "string") {
      this.handlers.onTranscriptDelta?.(evt.delta, "koko");
    } else if (type === "conversation.item.input_audio_transcription.delta" && typeof evt.delta === "string") {
      this.handlers.onTranscriptDelta?.(evt.delta, "user");
    } else if (type === "output_audio_buffer.started") {
      this.handlers.onSpeaking?.(true);
    } else if (type === "output_audio_buffer.stopped" || type === "output_audio_buffer.cleared") {
      this.handlers.onSpeaking?.(false);
    } else if (type === "response.done") {
      const output = (evt.response as { output?: unknown[] } | undefined)?.output;
      if (Array.isArray(output)) {
        for (const item of output) {
          const it = item as { type?: string; name?: string; arguments?: string; call_id?: string };
          if (it.type === "function_call" && it.name && it.call_id) {
            let args: Record<string, unknown> = {};
            try {
              args = it.arguments ? JSON.parse(it.arguments) : {};
            } catch {
              args = {};
            }
            this.handlers.onToolCall?.(it.name, args, it.call_id);
          }
        }
      }
    } else if (type === "error") {
      this.handlers.onState?.("error", (evt.error as { message?: string } | undefined)?.message || "Realtime error");
    }
  }

  sendToolResult(callId: string, output: Record<string, unknown>) {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: { type: "function_call_output", call_id: callId, output: JSON.stringify(output) },
      }),
    );
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  setMuted(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  disconnect() {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.dc?.close();
    this.dc = null;
    this.pc?.close();
    this.pc = null;
    this.handlers.onState?.("closed");
  }
}
