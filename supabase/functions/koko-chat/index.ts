// Koko — Socratic Tutor streaming chat via Lovable AI Gateway.
// Uses google/gemini-3-flash-preview by default. Mission context + intent flag
// ("stuck", "verify", "chat") shape the system prompt.

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
    const intent: "chat" | "stuck" | "verify" = body.intent || "chat";
    const mission = body.mission as
      | { title?: string; description?: string; career?: string; phase?: string }
      | undefined;

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

    const systemMsg: Msg = { role: "system", content: BASE_PROMPT + context + intentHint };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [systemMsg, ...messages],
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
