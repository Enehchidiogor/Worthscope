/* Lightweight browser dictation for free-text fields (Q1/Q6 in the Career
   Intelligence flow) — the native SpeechRecognition API, NOT the real-time
   AI voice conversation (that's kokoVoice.ts). Feature-detected; callers should
   hide the mic button when `isDictationSupported()` is false. */

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((e: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  onerror: ((e: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SpeechRecognitionLike) | null;
}

export function isDictationSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone is blocked. Click the lock icon in the address bar, allow the microphone, then try again.",
  "service-not-allowed": "Microphone is blocked. Click the lock icon in the address bar, allow the microphone, then try again.",
  "no-speech": "I didn't hear anything — check your microphone and try again.",
  "audio-capture": "No microphone found. Plug one in or check your system sound settings.",
  network: "Voice typing needs an internet connection to Google/Microsoft's speech service. Please type instead.",
  "language-not-supported": "This browser doesn't support that language for voice typing.",
};

export type DictationHandlers = {
  /** Called on every update with everything heard so far this session. */
  onText: (finalText: string, interimText: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
};

export class Dictation {
  private recognition: SpeechRecognitionLike | null = null;
  private active = false;
  private finalText = "";

  start({ onText, onError, onEnd }: DictationHandlers) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      onError?.("Voice typing isn't supported in this browser. Try Chrome, Edge or Safari.");
      onEnd?.();
      return;
    }
    this.finalText = "";
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (e) => {
      let interim = "";
      // Rebuild from the full result list so nothing is dropped or duplicated.
      let fin = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript;
        else interim += r[0].transcript;
      }
      this.finalText = fin;
      onText(fin.trim(), interim.trim());
    };
    recognition.onerror = (e) => {
      const code: string = e?.error || "unknown";
      if (code !== "aborted") onError?.(ERROR_MESSAGES[code] || `Voice typing stopped (${code}). Please try again or type instead.`);
    };
    recognition.onend = () => {
      this.active = false;
      onEnd?.();
    };

    this.recognition = recognition;
    this.active = true;
    try {
      recognition.start();
    } catch {
      this.active = false;
      onError?.("Couldn't start the microphone. Please try again.");
      onEnd?.();
    }
  }

  stop() {
    if (this.active) this.recognition?.stop();
    this.active = false;
  }

  get isActive() {
    return this.active;
  }
}
