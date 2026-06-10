/* WorthScope — Koko Onboarding Tour
   Guided dashboard walkthrough using react-joyride. Custom Koko-styled
   tooltip with the user's selected Koko avatar. Triggers automatically
   the first time a user lands on the dashboard after the assessment
   (driven by profiles.onboarding_tour_completed). Can be replayed from
   Settings via the `worthscope:start-tour` global event. */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Joyride, {
  CallBackProps,
  STATUS,
  Step,
  TooltipRenderProps,
  ACTIONS,
  EVENTS,
} from "react-joyride";
import { KokoAvatar } from "@/components/koko/KokoAvatar";
import {
  useUserProfile,
  setOnboardingTourCompleted,
  loadUserProfile,
} from "@/lib/profileStore";
import { getChosenCareer, getProfile } from "@/lib/userState";

const KOKO = "#895AF6";

type TourStep = Step & {
  /** Centered welcome / final screens use a Koko-card layout without spotlight. */
  isCenter?: boolean;
};

function buildSteps(name: string, career: string): TourStep[] {
  return [
    {
      target: "body",
      placement: "center",
      isCenter: true,
      title: `Hi ${name}! I'm Koko 👋`,
      content:
        "I'm your personal career guide. Let me show you around your new dashboard — it'll only take 30 seconds.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="roadmap"]',
      placement: "bottom",
      title: "This is your roadmap",
      content: `It's the path I built for you to become a ${career}. Each phase unlocks as you complete missions.`,
      disableBeacon: true,
    },
    {
      target: '[data-tour="missions"]',
      placement: "top",
      title: "These are your missions",
      content:
        "Each mission teaches you something specific. Open one and you'll learn with me, then watch a video, then take on a real project.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="skills"]',
      placement: "top",
      title: "Your skills grow here",
      content:
        "As you complete missions, your skills level up. Watch yourself go from beginner to expert over time.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="career"]',
      placement: "top",
      title: "Real job opportunities",
      content:
        "Once you're 70% through your roadmap, real jobs matched to your skills will show up here.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="koko-fab"]',
      placement: "left",
      title: "I'm always here",
      content:
        "Click me anytime if you have a question — about a mission, a skill, your career, anything.",
      disableBeacon: true,
    },
    {
      target: "body",
      placement: "center",
      isCenter: true,
      title: "That's it!",
      content: "Ready to start your first mission?",
      disableBeacon: true,
    },
  ];
}

/* ---------- Custom Koko tooltip ---------- */
function KokoTooltip({
  step, index, size, isLastStep, backProps, primaryProps, skipProps, tooltipProps,
}: TooltipRenderProps) {
  const s = step as TourStep;
  const isFirst = index === 0;
  const isFinal = isLastStep;

  return (
    <div
      {...tooltipProps}
      style={{
        width: 340,
        maxWidth: "calc(100vw - 32px)",
        background: "#FFFFFF",
        borderRadius: 16,
        border: `1px solid ${KOKO}33`,
        boxShadow: "0 16px 48px rgba(137,90,246,0.25), 0 4px 16px rgba(0,0,0,0.08)",
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
          {(s as any).title && (
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.3,
              }}
            >
              {(s as any).title}
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

      {/* Actions */}
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
            boxShadow: "0 4px 12px rgba(137,90,246,0.35)",
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
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  // Build steps once profile is known
  useEffect(() => {
    const name =
      profile?.name?.split(" ")[0] ||
      getProfile()?.firstName ||
      "there";
    const career = getChosenCareer()?.title || "what you want to be";
    setSteps(buildSteps(name, career));
  }, [profile]);

  // Auto-trigger on first visit
  useEffect(() => {
    if (!profile) return;
    if (profile.onboarding_tour_completed) return;
    // Defer slightly so dashboard elements have mounted and ws-fade-up has settled.
    const t = window.setTimeout(() => {
      setStepIndex(0);
      setRun(true);
    }, 900);
    return () => clearTimeout(t);
  }, [profile]);

  // Manual replay trigger from Settings
  useEffect(() => {
    const onStart = async () => {
      // Reload to make sure we have the latest profile flag
      await loadUserProfile(true);
      setStepIndex(0);
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

  const handleCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const next = index + (action === ACTIONS.PREV ? -1 : 1);
      if (next >= steps.length) {
        // Reached final "Start my first mission" press
        finish(true);
        return;
      }
      if (next < 0) return;
      setStepIndex(next);
      return;
    }

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE
    ) {
      finish(false);
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      disableOverlayClose
      disableScrolling={false}
      scrollOffset={120}
      hideBackButton={false}
      hideCloseButton
      tooltipComponent={KokoTooltip}
      callback={handleCallback}
      styles={{
        options: {
          arrowColor: "#FFFFFF",
          overlayColor: "rgba(15, 23, 42, 0.55)",
          primaryColor: KOKO,
          zIndex: 9999,
        },
        spotlight: {
          borderRadius: 16,
          boxShadow: `0 0 0 4px ${KOKO}55, 0 0 0 9999px rgba(15,23,42,0.55)`,
        },
      }}
      floaterProps={{
        styles: {
          floater: { filter: "none" },
        },
      }}
    />
  );
};
