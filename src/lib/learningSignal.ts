/* Classifies a user's Q&A message into one of three learning signals so
   Koko can adapt explanation depth. Pure heuristic — runs client-side,
   no AI cost. */

export type LearningSignal = "needs support" | "on track" | "ready to level up";

const SUPPORT_PATTERNS = [
  /don'?t (?:get|understand)/i,
  /confus(?:ed|ing)/i,
  /simpler/i,
  /easier/i,
  /what does .* mean/i,
  /explain again/i,
  /still lost/i,
  /can you repeat/i,
  /huh\??/i,
  /^lost\b/i,
  /no idea/i,
];

const LEVEL_UP_PATTERNS = [
  /edge case/i,
  /under the hood/i,
  /how does it (?:actually|really) work/i,
  /how is .* different from/i,
  /what about (?:when|if)/i,
  /related to/i,
  /compared to/i,
  /trade[\- ]off/i,
  /deeper/i,
  /go further/i,
  /advanced/i,
  /best practice/i,
];

export function classifyMessage(text: string): LearningSignal {
  if (SUPPORT_PATTERNS.some((re) => re.test(text))) return "needs support";
  if (LEVEL_UP_PATTERNS.some((re) => re.test(text))) return "ready to level up";
  return "on track";
}

/** Aggregate signal across a conversation. Latest signal weighs most. */
export function aggregateSignal(messages: { role: "user" | "koko"; text: string }[]): LearningSignal {
  const userMsgs = messages.filter((m) => m.role === "user");
  if (userMsgs.length === 0) return "on track";
  let support = 0;
  let levelUp = 0;
  for (const m of userMsgs) {
    const s = classifyMessage(m.text);
    if (s === "needs support") support++;
    else if (s === "ready to level up") levelUp++;
  }
  if (support > levelUp) return "needs support";
  if (levelUp > support) return "ready to level up";
  return "on track";
}
