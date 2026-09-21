// Koko Voice — mints an OpenAI Realtime ephemeral client secret so the
// browser can connect directly to OpenAI over WebRTC for the voice
// career-discovery conversation (src/pages/DiscoverVoice.tsx).
// Requires the OPENAI_API_KEY secret — separate from LOVABLE_API_KEY, which
// only covers the Lovable AI Gateway used by koko-chat.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Same closed vocabulary as koko-chat's discover-extract intent — kept in
// sync manually (this function is intentionally self-contained, same
// philosophy as koko-chat's inlined CAREER_SLUG_MAP).
const SUBJECT_KEYWORDS = ["mathematics", "further", "physics", "chemistry", "biology", "sciences", "computer", "ict", "technology", "data processing", "data / analytics", "analytics", "engineering", "technical drawing", "design", "creative", "arts", "literature", "economics", "business", "management", "social science", "health", "biological", "statistics", "data science", "psychology", "mass communication", "fine arts", "architecture", "accounting", "government", "journalism", "communication", "media", "technology & software", "design & creativity", "data & ai", "business & entrepreneurship", "communication & media", "creating apps", "coding", "building systems", "cloud technology", "cybersecurity", "ui/ux design", "graphic design", "product design", "branding", "motion design", "data analysis", "artificial intelligence", "machine learning", "research", "entrepreneurship", "marketing", "product management", "project management", "business analysis", "mechanical engineering", "electrical engineering", "civil engineering", "robotics", "content creation", "social media", "brand strategy", "communications"];
const ACTIVITY_KEYWORDS = ["creating or designing", "designing or creating", "visuals", "solving", "logical problems", "building or fixing", "fixing systems", "analyzing information", "analyzing", "leading", "organizing", "communicating", "persuading", "learning", "working with others", "working independently"];
const WORK_TYPE_KEYWORDS = ["create digital products", "creating digital products", "apps, websites", "apps or websites", "design experiences", "designing user experiences", "user experiences", "visuals that people interact", "work with data", "working with data", "data, patterns", "data and insights", "build or maintain technical", "technical systems", "building systems", "infrastructure", "protect systems", "protecting systems", "networks, and user data", "run, grow, or launch", "running or growing", "launch a business", "growing a business", "work with people through", "content, media, or marketing", "working with people", "people and communication", "build systems", "technical problems", "design and create", "visual experiences", "analyse data", "analyze data", "communicate", "digital problems", "human problems", "business problems", "security problems", "physical problems", "scientific problems"];
const TASK_KEYWORDS = ["designing interfaces", "interfaces, screens", "interfaces or visuals", "screens, or visuals", "writing code", "code or scripts", "setting up and managing systems", "systems or servers", "setting up systems", "cloud tools", "finding patterns", "patterns or insights", "patterns in data", "managing projects", "roadmaps, or products", "managing", "selling, pitching", "selling", "marketing ideas", "designing apps", "interfaces", "creating content", "visuals", "logical", "researching", "analysing"];
const OUTPUT_KEYWORDS = ["beautiful", "beautiful, polished", "visual design or brand", "working app", "working application", "software product", "secure, protected", "secure system", "protected system", "system or network", "data insight", "dashboard", "financial model", "report", "successful business", "business, product, or brand", "business or product", "physical machine", "structure, or engineered", "engineered system", "audience, community", "media presence", "scalable", "cloud/infrastructure", "finished app", "software people use", "visual experience", "built from scratch", "report or insight", "drove a real decision", "person or community", "helped", "content or ideas", "secure", "structure", "creating something people love using", "building a powerful solution", "keeping people safe", "discovering valuable insights", "growing a successful business", "leading a team to achieve a goal"];
const PERSONALITY_KEYWORDS = ["creative", "expressive", "logical", "analytical", "social", "strategic", "detail", "outgoing", "quiet", "observant", "practical", "hands-on", "curious", "exploratory", "detail-oriented", "visual design", "storytelling", "product ideas", "systems", "automation", "data", "business insights", "ai", "leadership", "communication", "community building", "business growth", "product strategy", "project planning", "design precision", "security", "data accuracy", "quality assurance"];
const DIFFERENTIATOR_KEYWORDS = ["looks", "design how something looks", "works", "design how something works", "build the system", "code, infrastructure", "analyze and improve", "performance", "manage and organize", "grow and reach", "audience", "protect", "secure systems", "design and build physical", "hardware", "the creator", "the builder", "the analyst", "the protector", "the leader", "the engineer"];

function ageBand(age?: number): string {
  if (!age || age < 16) return "Ages 13–15: very simple words, short sentences, fun everyday analogies.";
  if (age <= 18) return "Ages 16–18: conversational, examples from social media/tech, no heavy jargon.";
  if (age <= 21) return "Ages 19–21: clear and practical, university-level vocabulary fine.";
  if (age <= 25) return "Ages 22–25: results-oriented, treat like a junior colleague.";
  return "Ages 26+: efficient, assume prior knowledge, get to the point.";
}

function discoveryInstructions(name: string, age: number | undefined, educationLevel: string): string {
  return `You are Koko, WorthScope's career discovery guide, talking with ${name} out loud in a real-time voice conversation. Warm, encouraging, direct — like a brilliant older friend, never a corporate assistant. ${ageBand(age)} Education level: ${educationLevel || "unspecified"}.

This is a real conversation, not a quiz — never read out a list of questions. Ask one thing at a time and react to what they actually say before moving on.

Over the conversation, naturally learn: what subjects/topics interest them, what activities they enjoy, what kind of work they picture themselves doing, what they'd enjoy day-to-day, what output they'd be proud to have made, a few personality traits, what matters most to them in choosing a direction, and any goals/worries/a specific career already in mind.

You can hear their voice, not just their words — pay attention to tone, hesitation, and enthusiasm. When something clearly excites them or they sound unsure/hesitant about a topic, that's worth noting for the emotionalNotes field below.

Keep your spoken turns short (2-4 sentences) — this is audio, not text to read. After roughly 6-10 of their replies, once you have a real sense of them, say so plainly and call submit_discovery_profile exactly once with what you've learned. Do not call it earlier than that, and do not call it more than once.

When calling submit_discovery_profile, choose values ONLY from the closed lists in the tool schema — do not invent new phrases for the scored fields. goalOrConcern, statedCareer, and emotionalNotes are free text.`;
}

const DISCOVERY_TOOLS = [
  {
    type: "function",
    name: "submit_discovery_profile",
    description: "Call this exactly once, near the natural end of the discovery conversation, once you've learned enough about the user.",
    parameters: {
      type: "object",
      properties: {
        strongSubjects: { type: "array", items: { type: "string", enum: SUBJECT_KEYWORDS } },
        activities: { type: "array", items: { type: "string", enum: ACTIVITY_KEYWORDS } },
        workTypes: { type: "array", items: { type: "string", enum: WORK_TYPE_KEYWORDS } },
        taskInterests: { type: "array", items: { type: "string", enum: TASK_KEYWORDS } },
        outputPreferences: { type: "array", items: { type: "string", enum: OUTPUT_KEYWORDS } },
        personalityTraits: { type: "array", items: { type: "string", enum: PERSONALITY_KEYWORDS } },
        differentiation: { type: ["string", "null"], enum: [...DIFFERENTIATOR_KEYWORDS, null] },
        goalOrConcern: { type: "string", description: "Free-text summary of their goals, worries, or what they want to become." },
        statedCareer: { type: ["string", "null"], description: "A specific career they explicitly named, if any." },
        emotionalNotes: { type: ["string", "null"], description: "1-2 short observations about tone/enthusiasm/hesitation you picked up on from their voice, if anything stood out." },
      },
      required: ["strongSubjects", "activities", "workTypes", "taskInterests", "outputPreferences", "personalityTraits", "goalOrConcern"],
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userName = "the student";
    let userAge: number | undefined;
    let educationLevel = "";

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
            .select("name, age, education_level")
            .eq("id", claims.claims.sub)
            .maybeSingle();
          if (profile) {
            const firstName = (profile.name || "").trim().split(/\s+/)[0];
            if (firstName) userName = firstName;
            if (typeof profile.age === "number") userAge = profile.age;
            if (profile.education_level) educationLevel = profile.education_level;
          }
        }
      } catch (_) { /* fall through with defaults — voice session still works anonymously */ }
    }

    const sessionRes = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: discoveryInstructions(userName, userAge, educationLevel),
          output_modalities: ["audio"],
          audio: {
            input: { format: { type: "audio/pcm", rate: 24000 }, turn_detection: { type: "semantic_vad", create_response: true } },
            output: { voice: "marin" },
          },
          tools: DISCOVERY_TOOLS,
          tool_choice: "auto",
        },
      }),
    });

    if (!sessionRes.ok) {
      if (sessionRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (sessionRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await sessionRes.text();
      console.error("OpenAI realtime session error", sessionRes.status, t);
      return new Response(JSON.stringify({ error: "Couldn't start a voice session" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await sessionRes.json();
    return new Response(JSON.stringify({ client_secret: data.value, expires_at: data.expires_at }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("koko-voice-session error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
