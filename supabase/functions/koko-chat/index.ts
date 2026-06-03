// Koko — Socratic Tutor + Lesson generator via Lovable AI Gateway.
// Streaming SSE; intents: "chat" | "stuck" | "verify" | "lesson" | "qa".

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Msg = { role: "user" | "assistant" | "system"; content: string };

const BASE_PROMPT = `You are Koko AI, the WorthScope Socratic Tutor for Nigerian students building tech and creative careers.

CORE RULES (never break):
1. NEVER give the direct answer. Use Socratic questions, metaphors, and small hints. If a student begs for the answer, give one more focused hint instead.
2. Keep replies SHORT — 2-4 sentences max. Students get overwhelmed by walls of text.
3. Use local context when natural (Lagos/Abuja tech hubs, Yaba, Andela, Naira, Nigerian product examples like Paystack, Flutterwave, Cowrywise). Don't force it.
4. Tone: warm, encouraging, professional. No emojis spam — at most one per reply.
5. After explaining anything, ask ONE follow-up question to check understanding.

When a student is STUCK on a mission:
- Ask what they've tried first.
- Offer a metaphor (e.g., "Auto-layout in Figma is like a smart container — it grows with what you put inside").
- Suggest the next single step, not the whole solution.

When VERIFYING understanding (intent=verify):
- The student is trying to complete a mission. Ask ONE specific check-for-understanding question tied to the mission topic.
- Their next message will be their answer. Reply with either "✅ Correct — [1 sentence reinforcement]" if they grasped it, or "Not quite — [one hint]. Try again." if they didn't.`;

function ageBand(age?: number): string {
  if (!age || age < 13) return "Ages 13–15: Very simple words, fun analogies, short sentences, relatable everyday examples.";
  if (age <= 15) return "Ages 13–15: Very simple words, fun analogies, short sentences, relatable everyday examples.";
  if (age <= 18) return "Ages 16–18: Slightly more mature tone, still conversational, real examples from school or social media.";
  if (age <= 21) return "Ages 19–21: Clear and practical, university-level vocabulary acceptable, focus on how it connects to their career.";
  if (age <= 25) return "Ages 22–25: Professional but approachable, focus on application and outcomes.";
  return "Ages 26+: Efficient and results-focused, assume prior knowledge, skip basics.";
}

function lessonPrompt(mission: any): string {
  return `You are Koko, a personal learning guide on WorthScope — a career discovery platform for students. Your job is to teach the user about a specific topic in a way that matches their age and learning level. You are warm, encouraging, clear, and never overwhelming. You speak like a smart older friend, not a textbook.

Always structure your lesson in this EXACT markdown format and order:
1. A one-sentence HOOK that makes the topic feel relevant and exciting. Write it on its own line prefixed with "HOOK: ".
2. A simple explanation of what the topic is (2–3 short paragraphs max).
3. A real-world example or analogy a student would relate to.
4. Exactly 3 key things to remember as markdown bullet points starting with "- **".
5. A closing encouragement line that motivates the user to keep going.

Audience guidance for this user: ${ageBand(mission?.userAge)}

Never use jargon without explaining it. Never write more than the format requires. Keep it scannable. Do not include any preface like "Sure!" or "Here is your lesson" — go straight into the HOOK line.`;
}

function qaPrompt(mission: any): string {
  return `You are Koko, a personal learning guide on WorthScope. The user has just read a lesson about "${mission?.title || "this topic"}" as part of their journey to become a ${mission?.career || "professional"}. Answer their question clearly, kindly, and in a way that matches their age (${mission?.userAge || "student"}). Keep your answer focused strictly on the lesson topic or concepts directly related to it. Do not go off-topic. If the question is unrelated to the lesson, gently redirect them back to the topic. Keep replies short (2-4 sentences).`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages: Msg[] = body.messages || [];
    const intent: "chat" | "stuck" | "verify" | "lesson" | "qa" = body.intent || "chat";
    const mission = body.mission as
      | { title?: string; description?: string; career?: string; phase?: string; userName?: string; userAge?: number }
      | undefined;

    let systemContent: string;
    let userMessages: Msg[] = messages;

    if (intent === "lesson") {
      systemContent = lessonPrompt(mission);
      // Build a single user message from mission/profile context so callers
      // can pass an empty messages array.
      const userPrompt = `The user's name is ${mission?.userName || "the student"}.
The user's age is ${mission?.userAge ?? "unspecified"}.
The user's chosen career path is ${mission?.career || "unspecified"}.
The current mission topic is ${mission?.title || "unspecified"}.
The mission description is ${mission?.description || "unspecified"}.

Teach this user about "${mission?.title || "this topic"}" in the context of becoming a ${mission?.career || "professional"}. Follow the lesson format exactly.`;
      userMessages = [{ role: "user", content: userPrompt }];
    } else if (intent === "qa") {
      systemContent = qaPrompt(mission);
    } else {
      let context = "";
      if (mission) {
        context = `\n\nCURRENT MISSION CONTEXT:
- Career path: ${mission.career || "unspecified"}
- Phase: ${mission.phase || "unspecified"}
- Mission: ${mission.title || "unspecified"}
- What they need to do: ${mission.description || "unspecified"}`;
      }
      let intentHint = "";
      if (intent === "stuck") {
        intentHint = "\n\nINTENT: The student just clicked 'I'm Stuck'. Open with a warm acknowledgment, then ask ONE diagnostic question to find out where exactly they're blocked.";
      } else if (intent === "verify") {
        intentHint = "\n\nINTENT: The student wants to complete this mission. Either ask ONE check-for-understanding question about the mission topic, OR if their last message is an answer, judge it (start your reply with ✅ Correct or Not quite).";
      }
      systemContent = BASE_PROMPT + context + intentHint;
    }

    const systemMsg: Msg = { role: "system", content: systemContent };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMsg, ...userMessages],
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("koko-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
