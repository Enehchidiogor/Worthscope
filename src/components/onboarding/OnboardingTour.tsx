/* WorthScope — Koko Onboarding Tour
   Guided dashboard walkthrough using react-joyride v3. Custom Koko-styled
   tooltip with the user's selected Koko avatar. Triggers automatically
   the first time a user lands on the dashboard after the assessment
   (driven by profiles.onboarding_tour_completed). Can be replayed from
   Settings via the `worthscope:start-tour` global event. */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Joyride,
  ACTIONS,
  EVENTS,
  STATUS,
  type EventData,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";
import { KokoAvatar } from "@/components/koko/KokoAvatar";
import {
  useUserProfile,
  setOnboardingTourCompleted,
  loadUserProfile,
} from "@/lib/profileStore";
import { getChosenCareer, getProfile } from "@/lib/userState";

const KOKO = "#3498DB";

type StepData = { titleText?: string };

function buildSteps(name: string, career: string): Step[] {
  return [
    {
      target: "body",
      placement: "center",
      title: `Hi ${name}! I'm Koko 👋`,
      content:
        "I'm your personal career guide. Let me show you around your new dashboard — it'll only take 30 seconds.",
      skipBeacon: true,
      data: { titleText: `Hi ${name}! I'm Koko 👋` } as StepData,
    },
    {
      target: '[data-tour="roadmap"]',
      placement: "bottom",
      title: "This is your roadmap",
      content: `It's the path I built for you to become a ${career}. Each phase unlocks as you complete missions.`,
      skipBeacon: true,
    },
    {
      target: '[data-tour="missions"]',
      placement: "top",
      title: "These are your missions",
      content:
        "Each mission teaches you something specific. Open one and you'll learn with me, then watch a video, then take on a real project.",
      skipBeacon: true,
    },
    {
      target: '[data-tour="skills"]',
      placement: "top",
      title: "Your skills grow here",
      content:
        "As you complete missions, your skills level up. Watch yourself go from beginner to expert over time.",
      skipBeacon: true,
    },
    {
      target: '[data-tour="career"]',
      placement: "top",
      title: "Real job opportunities",
      content:
        "Once you're 70% through your roadmap, real jobs matched to your skills will show up here.",
      skipBeacon: true,
    },
    {
      target: '[data-tour="koko-fab"]',
      placement: "left",
      title: "I'm always here",
      content:
        "Click me anytime if you have a question — about a mission, a skill, your career, anything.",
      skipBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      title: "That's it!",
      content: "Ready to start your first mission?",
      skipBeacon: true,
    },
  ];
}

/* ---------- Custom Koko tooltip ---------- */
function KokoTooltip(props: TooltipRenderProps) {
  const {
    step,
    index,
    size,
    isLastStep,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
  } = props;
  const isFirst = index === 0;
  const isFinal = isLastStep;

  // step.title is ReactNode in our config, but Joyride merges it onto StepMerged.
  const title = (step as any).title as React.ReactNode | undefined;

  return (
    <div
      {...tooltipProps}
      style={{
        width: 340,
        maxWidth: "calc(100vw - 32px)",
        background: "#FFFFFF",
        borderRadius: 16,
        border: `1px solid ${KOKO}33`,
        boxShadow:
          "0 16px 48px rgba(52,152,219,0.25), 0 4px 16px rgba(0,0,0,0.08)",
        padding: 20,
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
      }}
    >
      {/* Skip ✕ */}
      <button
        {...skipProps}
        aria-label="Skip tour"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 26,
          height: 26,
          display: "grid",
          placeItems: "center",
          background: "transparent",
          border: "none",
          color: "#9CA3AF",
          cursor: "pointer",
          borderRadius: 6,
          fontSize: 16,
        }}
        title="Skip"
      >
        ✕
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <KokoAvatar size={44} />
        <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
          )}
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "#4B5563",
            }}
          >
            {step.content}
          </p>
        </div>
      </div>

      {/* Step pips */}
      <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
        {Array.from({ length: size }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === index ? 18 : 6,
              height: 6,
              borderRadius: 99,
              background: i === index ? KOKO : "#E5E7EB",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        {isFirst ? (
          <button
            {...skipProps}
            style={{
              background: "transparent",
              border: "none",
              color: "#6B7280",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              padding: "8px 4px",
            }}
          >
            Skip for now
          </button>
        ) : (
          <button
            {...backProps}
            style={{
              background: "transparent",
              border: "none",
              color: "#6B7280",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              padding: "8px 4px",
            }}
          >
            ← Back
          </button>
        )}

        <button
          {...primaryProps}
          style={{
            background: KOKO,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(52,152,219,0.35)",
          }}
        >
          {isFirst
            ? "Show me around →"
            : isFinal
            ? "Start my first mission →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Tour controller ---------- */
export const OnboardingTour = () => {
  const navigate = useNavigate();
  const profile = useUserProfile();
  const [run, setRun] = useState(false);
  // Bump to remount Joyride for a fresh replay
  const [runId, setRunId] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    const name =
      profile?.name?.split(" ")[0] || getProfile()?.firstName || "there";
    const career = getChosenCareer()?.title || "what you want to be";
    setSteps(buildSteps(name, career));
  }, [profile]);

  // Auto-trigger on first dashboard visit
  useEffect(() => {
    if (!profile) return;
    if (profile.onboarding_tour_completed) return;
    const t = window.setTimeout(() => {
      setRunId((n) => n + 1);
      setRun(true);
    }, 900);
    return () => clearTimeout(t);
  }, [profile]);

  // Manual replay trigger
  useEffect(() => {
    const onStart = async () => {
      await loadUserProfile(true);
      setRunId((n) => n + 1);
      setRun(true);
    };
    window.addEventListener("worthscope:start-tour", onStart);
    return () => window.removeEventListener("worthscope:start-tour", onStart);
  }, []);

  const finish = async (goToMission: boolean) => {
    setRun(false);
    await setOnboardingTourCompleted(true);
    if (goToMission) navigate("/missions");
  };

  const onEvent = (data: EventData) => {
    const { type, status, action } = data;

    // Final-step primary click → "Start my first mission"
    if (
      type === EVENTS.STEP_AFTER &&
      action === ACTIONS.NEXT &&
      data.index === steps.length - 1
    ) {
      finish(true);
      return;
    }

    if (
      type === EVENTS.TOUR_END ||
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.SKIP
    ) {
      finish(false);
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      key={runId}
      steps={steps}
      run={run}
      continuous
      tooltipComponent={KokoTooltip}
      onEvent={onEvent}
      options={{
        primaryColor: KOKO,
        arrowColor: "#FFFFFF",
        backgroundColor: "#FFFFFF",
        overlayColor: "rgba(15, 23, 42, 0.55)",
        zIndex: 9999,
        overlayClickAction: false,
        dismissKeyAction: "close",
        spotlightRadius: 16,
      }}
    />
  );
};
