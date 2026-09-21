import { useCallback, useEffect, useRef, useState } from "react";
import { Dictation, isDictationSupported } from "@/lib/voiceDictation";

/** Voice typing into a text field: words appear live as you speak. */
export function useDictationField(getText: () => string, setText: (v: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dictation = useRef<Dictation | null>(null);

  useEffect(() => () => dictation.current?.stop(), []);

  const toggle = useCallback(() => {
    if (listening) {
      dictation.current?.stop();
      setListening(false);
      return;
    }
    setError(null);
    const base = getText().trim();
    const join = (spoken: string) => [base, spoken].filter(Boolean).join(" ");
    dictation.current = new Dictation();
    setListening(true);
    dictation.current.start({
      onText: (fin, interim) => setText(join([fin, interim].filter(Boolean).join(" "))),
      onError: (msg) => setError(msg),
      onEnd: () => setListening(false),
    });
  }, [listening, getText, setText]);

  return { listening, error, toggle, supported: isDictationSupported() };
}
