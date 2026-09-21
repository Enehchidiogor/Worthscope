/* Order of the Career Intelligence questions. Keys are kept stable (q0..q6)
   so saved progress still resumes; new questions use s1..s4. Numbering,
   progress and back/next are all derived from this one list. */

export const QUESTION_ORDER = ["q1", "q2", "q3", "s1", "s2", "s3", "q4", "q5", "s4", "q6"] as const;
export type QuestionStep = (typeof QUESTION_ORDER)[number];
export type Step = "welcome" | "q0" | QuestionStep | "analyzing";

export const TOTAL_QUESTIONS = QUESTION_ORDER.length;

export function questionNumber(step: QuestionStep): number {
  return QUESTION_ORDER.indexOf(step) + 1;
}

export function eyebrowFor(step: QuestionStep, suffix = ""): string {
  return `Question ${questionNumber(step)} of ${TOTAL_QUESTIONS}${suffix}`;
}

export function isQuestionStep(step: string): step is QuestionStep {
  return (QUESTION_ORDER as readonly string[]).includes(step);
}

export function nextAfter(step: QuestionStep): Step {
  const i = QUESTION_ORDER.indexOf(step);
  return i >= QUESTION_ORDER.length - 1 ? "analyzing" : QUESTION_ORDER[i + 1];
}

export function prevBefore(step: QuestionStep): Step {
  const i = QUESTION_ORDER.indexOf(step);
  return i <= 0 ? "q0" : QUESTION_ORDER[i - 1];
}
