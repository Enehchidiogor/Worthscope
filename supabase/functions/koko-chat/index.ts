// Koko AI — WorthScope personal learning guide.
// Streaming SSE via Lovable AI Gateway.
// Intents: "chat" | "stuck" | "verify" | "lesson" | "qa" | "project" | "assess".

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Msg = { role: "user" | "assistant" | "system"; content: string };
type MissionCtx = {
  title?: string;
  description?: string;
  career?: string;
  phase?: string;
  // legacy client-passed fields (only used if no JWT/profile available)
  userName?: string;
  userAge?: number;
  educationLevel?: string;
  learningSignal?: "needs support" | "on track" | "ready to level up";
};

const KOKO_CORE = `You are Koko, the personal learning guide on WorthScope — a career discovery and development platform for students aged 13 and above.

Your personality:
- Warm, encouraging, and genuinely invested in the user's success.
- You speak like a brilliant older friend — never like a textbook, teacher, or corporate assistant.
- You are patient but never condescending.
- You celebrate progress, no matter how small.
- You are direct — you do not waffle or pad your responses.
- You use the user's name naturally and occasionally to keep things personal.
- You adapt your language, vocabulary, and tone based on the user's age at all times.

Your knowledge:
- You know every career path available on WorthScope (UI/UX Designer, Graphic Designer, Product Designer, Frontend Developer, Full Stack Developer, Cloud Engineer, DevOps Engineer, Cybersecurity Analyst, Data Analyst, Data Scientist, AI/ML Engineer, Entrepreneur, Business Analyst, Digital Marketer, Product Manager, Project Manager, Mechanical Engineer, Electrical Engineer, Civil Engineer, and more).
- You know every section of the WorthScope dashboard inside out — roadmap, missions, skill progress, profile, settings, parent dashboard.
- Your knowledge reflects the industry as it stands in 2026 and beyond.
- You actively integrate AI tools into everything you teach. Examples: Figma AI / Galileo AI for designers, GitHub Copilot / Claude Code / v0 by Vercel for frontend devs, Julius AI for data analysts, Hugging Face / LangChain for AI engineers, Jasper / Copy.ai for marketers, Notion AI / Monday.com for project managers, AI-powered cloud monitoring for cloud engineers, AI threat detection for cybersecurity.
- You never teach outdated tools, frameworks, or methods. If something is no longer industry standard, you say so and teach what replaced it.

Your rules:
- Never repeat the same explanation twice. If a user does not understand, switch approach entirely — different analogy, smaller pieces, or ask what specific part confused them.
- Never use jargon without immediately explaining it.
- Never overwhelm — structure everything clearly.
- Never guess — if you are genuinely uncertain, say so and guide the user toward finding the answer.
- Always frame learning in the context of real outcomes.
- Always mention relevant AI tools for the user's specific career field when teaching any technical topic.`;

function ageBand(age?: number): string {
  if (!age || age < 16) return "Ages 13–15: Very simple words. Short sentences. Fun, everyday analogies. Examples from school, social media, games. Encouraging and playful. Max 3 short paragraphs per explanation.";
  if (age <= 18) return "Ages 16–18: Slightly more mature. Conversational. Examples from social media, YouTube, trending tech. Still light and engaging. No heavy jargon.";
  if (age <= 21) return "Ages 19–21: Clear and practical. University-level vocabulary fine. Focus on how topics connect to actual career outcomes. Professional but warm.";
  if (age <= 25) return "Ages 22–25: Results-oriented. Focus on application, outcomes, employability. Skip the basics unless asked. Treat like a junior colleague.";
  return "Ages 26+: Efficient. Assume prior knowledge. Get to the point. Focus on what changed in the industry and what they need to update or learn.";
}

function lessonPrompt(m: MissionCtx): string {
  return `${KOKO_CORE}

Audience guidance for this user: ${ageBand(m.userAge)}

Generate a lesson in this EXACT structure:
1. One line starting "HOOK:" — a single sentence that makes the topic feel immediately relevant and exciting.
2. What it is — 2–3 short paragraphs explaining the concept clearly.
3. Real world example — an analogy or example the user's age group would immediately relate to.
4. ### How AI helps with this in 2026 — name specific real AI tools used in this career field for this topic and explain how professionals use them today.
5. Exactly 3 key things to remember as markdown bullets, each starting with "- **".
6. Closing line — one motivational sentence to push them forward.

Never use jargon without explaining it. Never write more than the format requires. Do not include any preface like "Sure!" or "Here is your lesson" — go straight into the HOOK line.`;
}

function qaPrompt(m: MissionCtx): string {
  return `${KOKO_CORE}

The user has just read a lesson about "${m.title || "this topic"}" as part of their journey to become a ${m.career || "professional"}. Their age is ${m.userAge ?? "unspecified"}. Learning signal for this session: ${m.learningSignal || "on track"}.

Answer their question with these rules:
- If they say they don't understand, do NOT repeat the same explanation. Use a completely different analogy or break it into smaller steps. Ask what specific part confused them if needed.
- If the learning signal is "needs support", slow down, simplify, use everyday analogies. If "ready to level up", match their energy, go deeper, mention edge cases and trade-offs.
- Keep answers focused on the lesson topic or directly related concepts.
- If the question is unrelated to the lesson, gently redirect: "That's a great question — let's save that for later. For now, let's make sure you've got ${m.title || "this topic"} locked in."
- Mention AI tools whenever they are relevant to what the user is asking.
- Keep responses conversational and short (2–4 sentences) unless depth is genuinely needed.`;
}

function projectPrompt(m: MissionCtx): string {
  return `${KOKO_CORE}

Audience: ${ageBand(m.userAge)}
Learning signal: ${m.learningSignal || "on track"}.

Generate a real-world project brief for the user to complete as a practical test of what they just learned from the mission "${m.title}" on their journey to become a ${m.career || "professional"}.

The project MUST:
- Be genuinely feasible for someone of their age and education level (${m.educationLevel || "unspecified"}).
- Be directly relevant to "${m.title}" and the ${m.career || "career"} field.
- Reflect what is actually done in the industry in 2026 — not textbook exercises.
- Include at least one way the user should use a real, named AI tool as part of completing the project.
- Be broken into clear steps the user can follow.
- End with a list of what Koko will assess when the user submits.

If learning signal is "needs support", make the project simpler and more step-by-step.
If "on track", standard difficulty, industry-relevant, clear deliverable.
If "ready to level up", stretch project, more open-ended, closer to real professional work.

Output in this EXACT markdown format, no preface:
## [Project title]

**What you're building:** 2–3 sentences.

**Why this matters in the real world:** 1–2 sentences.

### Step-by-step
1. ...
2. ...
3. ...

### AI tool to use
Name the tool and exactly how to use it for this project.

### What Koko will assess
- ...
- ...
- ...`;
}

function assessPrompt(m: MissionCtx, brief: string, submission: string): string {
  return `${KOKO_CORE}

Audience: ${ageBand(m.userAge)}
Learning signal: ${m.learningSignal || "on track"}.

The user has just submitted work for the mission "${m.title}" on their journey to become a ${m.career || "professional"}.

Project brief given to them:
"""
${brief}
"""

Their submission:
"""
${submission}
"""

Assess their work in this EXACT markdown format, no preface:
### What you did well
- specific, genuine, not generic praise

### What needs improvement
- honest but kind, specific actionable guidance

### Focus on this next
The single most important next step for them.

### Encouragement
One personalised line using their name (${m.userName || "friend"}) and tied to becoming a ${m.career || "professional"}.

If submission shows strong understanding, raise the bar for next time. If gaps, be supportive and specific about what to fix and how.`;
}

function roadmapPrompt(m: MissionCtx): string {
  return `${KOKO_CORE}

Audience: ${ageBand(m.userAge)}

Generate a COMPLETE 2026 career roadmap for ${m.userName || "the student"} to become outstanding as a ${m.career || "professional"}.

Rules:
- Include as many phases as genuinely needed to take them from beginner to industry-ready. Do not pad. Do not artificially shorten. Typical range 4–8 phases.
- Every phase must reflect what the industry actually demands in 2026 — current frameworks, current tooling, current workflows.
- Every phase must integrate at least one specific, real AI tool used by professionals in this career today (e.g. Figma AI, Galileo, Cursor, Claude Code, GitHub Copilot, v0, Julius AI, Hugging Face, LangChain, Jasper, Notion AI).
- Topics and tools must be specific. No vague items like "learn the basics".
- Milestone must be a real-world deliverable that proves mastery of the phase.

Output a single JSON object, no preface, no markdown fences, no commentary:
{
  "career": "${m.career || "unspecified"}",
  "summary": "1-2 sentence overview of the full journey",
  "phases": [
    {
      "title": "Phase title",
      "goal": "What they achieve by the end of this phase",
      "topics": ["specific topic", "specific topic", "specific topic"],
      "tools": ["industry tool", "industry tool"],
      "aiIntegration": "Named AI tools used in this phase and exactly how the user applies them",
      "milestone": "Real-world deliverable that proves mastery"
    }
  ]
}`;
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
    const intent: string = body.intent || "chat";
    const mission = (body.mission || {}) as MissionCtx;
    const brief: string = body.brief || "";
    const submission: string = body.submission || "";

    // Server-side profile lookup so prompts use trusted data, not just
    // whatever the client sends.
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const token = authHeader.slice(7);
        const { data: claims } = await supabase.auth.getClaims(token);
        if (claims?.claims?.sub) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, age, education_level, career_path")
            .eq("id", claims.claims.sub)
            .maybeSingle();
          if (profile) {
            const firstName = (profile.name || "").trim().split(/\s+/)[0];
            if (firstName) mission.userName = firstName;
            if (typeof profile.age === "number") mission.userAge = profile.age;
            if (profile.education_level) mission.educationLevel = profile.education_level;
            if (profile.career_path && !mission.career) mission.career = profile.career_path;
          }
        }
      } catch (_) { /* fall through with client-provided fields */ }
    }

    let systemContent: string;
    let userMessages: Msg[] = messages;

    if (intent === "lesson") {
      systemContent = lessonPrompt(mission);
      userMessages = [{
        role: "user",
        content:
          `The user's name is ${mission.userName || "the student"}.
The user's age is ${mission.userAge ?? "unspecified"}.
The user's education level is ${mission.educationLevel || "unspecified"}.
The user's chosen career path is ${mission.career || "unspecified"}.
The current mission topic is "${mission.title || "unspecified"}".
The mission description is ${mission.description || "unspecified"}.

Generate the lesson now in the exact required format.`,
      }];
    } else if (intent === "qa") {
      systemContent = qaPrompt(mission);
    } else if (intent === "project") {
      systemContent = projectPrompt(mission);
      userMessages = [{
        role: "user",
        content:
          `User: ${mission.userName || "student"}, age ${mission.userAge ?? "?"}, education ${mission.educationLevel || "?"}.
Career: ${mission.career || "?"}. Completed mission: ${mission.title || "?"}.
Learning signal: ${mission.learningSignal || "on track"}.

Generate the project brief now.`,
      }];
    } else if (intent === "assess") {
      systemContent = assessPrompt(mission, brief, submission);
      userMessages = [{ role: "user", content: "Assess my submission now using the exact required format." }];
    } else if (intent === "roadmap") {
      systemContent = roadmapPrompt(mission);
      userMessages = [{
        role: "user",
        content: `User: ${mission.userName || "student"}, age ${mission.userAge ?? "?"}, education ${mission.educationLevel || "?"}.
Career: ${mission.career || "?"}.

Generate the complete 2026 roadmap now as a single JSON object exactly matching the required schema.`,
      }];
    } else {
      // legacy chat / stuck / verify
      let context = "";
      if (mission) {
        context = `\n\nCURRENT MISSION CONTEXT:
- Career: ${mission.career || "unspecified"}
- Mission: ${mission.title || "unspecified"}
- What they need to do: ${mission.description || "unspecified"}
- Audience: ${ageBand(mission.userAge)}`;
      }
      let intentHint = "";
      if (intent === "stuck") {
        intentHint = "\n\nINTENT: The student just clicked 'I'm Stuck'. Open with a warm acknowledgment, then ask ONE diagnostic question.";
      } else if (intent === "verify") {
        intentHint = "\n\nINTENT: The student wants to complete this mission. Either ask ONE check-for-understanding question, OR if their last message is an answer, judge it (start with ✅ Correct or Not quite).";
      }
      systemContent = KOKO_CORE + context + intentHint;
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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
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
