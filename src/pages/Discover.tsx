import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ExperienceProvider } from "@/components/experience/ExperienceContext";
import { FONT } from "@/components/experience/theme";
import type { KokoMission } from "@/lib/kokoClient";
import {
  emptyProfile,
  loadWIP,
  saveWIP,
  clearWIP,
  type CareerIntelligenceProfile,
  type CareerIntent,
  type ThinkingStyleTrait,
  type CareerValue,
  type WorkStyle,
  type Commitment,
  type CareerPrediction,
} from "@/lib/careerIntelligence";
import { SEO } from "@/components/SEO";
import AmbientBackground from "@/components/landing/AmbientBackground";
import ProgressBar from "@/components/discover/ProgressBar";
import WelcomeStep from "@/components/discover/WelcomeStep";
import QuestionZeroStep from "@/components/discover/QuestionZeroStep";
import Q1PersonalContext from "@/components/discover/Q1PersonalContext";
import Q2ThinkingStyle from "@/components/discover/Q2ThinkingStyle";
import Q3Activities from "@/components/discover/Q3Activities";
import Q4WorkStyle from "@/components/discover/Q4WorkStyle";
import Q5CareerValues from "@/components/discover/Q5CareerValues";
import Q6Commitment from "@/components/discover/Q6Commitment";
import AnalyzingStep from "@/components/discover/AnalyzingStep";

type Step = "welcome" | "q0" | "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "analyzing";

const STEP_INDEX: Record<Step, number> = { welcome: 0, q0: 0, q1: 1, q2: 2, q3: 3, q4: 4, q5: 5, q6: 6, analyzing: 6 };

type StoredProfile = { firstName?: string; ageRange?: string; educationLevel?: string; age?: number };

function loadUserProfile(): StoredProfile {
  try {
    const raw = localStorage.getItem("worthscope_user_profile");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function Discover() {
  return (
    <ExperienceProvider>
      <DiscoverInner />
    </ExperienceProvider>
  );
}

function DiscoverInner() {
  const navigate = useNavigate();
  const userProfile = useRef(loadUserProfile()).current;
  const mission = useRef<KokoMission>({ userName: userProfile.firstName, educationLevel: userProfile.educationLevel, userAge: userProfile.age }).current;

  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<CareerIntelligenceProfile>(emptyProfile());

  useEffect(() => {
    const wip = loadWIP();
    if (wip && wip.step !== "welcome" && wip.step !== "analyzing") {
      setProfile(wip.profile);
      setStep(wip.step as Step);
    }
  }, []);

  function advance(next: Step, patch?: Partial<CareerIntelligenceProfile>) {
    const nextProfile = patch ? { ...profile, ...patch } : profile;
    if (patch) setProfile(nextProfile);
    setStep(next);
    if (next !== "welcome" && next !== "analyzing") saveWIP(nextProfile, next);
  }

  function handlePrediction(prediction: CareerPrediction) {
    try {
      sessionStorage.setItem("worthscope_ci_just_completed", "1");
    } catch {
      // Non-critical.
    }
    navigate("/career-profile");
  }

  function handlePredictionError(message: string) {
    toast.error(message);
    // The q6->analyzing transition clears WIP before the API call — restore
    // it so a reload after a failed prediction doesn't lose the whole profile.
    saveWIP(profile, "q6");
    setStep("q6");
  }

  const showProgress = step !== "welcome" && step !== "q0" && step !== "analyzing";

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: FONT, overflowX: "clip" as "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: step === "welcome" || step === "analyzing" ? "center" : "flex-start", padding: "56px 24px 80px" }}>
      <SEO title="Career Discovery — WorthScope" description="Answer six thoughtful questions so Koko can map your career direction." path="/discover" />

      <AmbientBackground />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {showProgress && <ProgressBar step={STEP_INDEX[step]} />}

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <WelcomeStep key="welcome" firstName={userProfile.firstName || ""} onStart={() => advance("q0")} />
          )}

          {step === "q0" && (
            <QuestionZeroStep
              key="q0"
              value={profile.careerIntent}
              onChange={(v: CareerIntent) => setProfile({ ...profile, careerIntent: v })}
              onContinue={() => advance("q1", { careerIntent: profile.careerIntent })}
            />
          )}

          {step === "q1" && (
            <Q1PersonalContext
              key="q1"
              value={profile.personalContext}
              mission={mission}
              onBack={() => advance("q0")}
              onContinue={(text) => advance("q2", { personalContext: text })}
            />
          )}

          {step === "q2" && (
            <Q2ThinkingStyle
              key="q2"
              value={profile.thinkingStyle}
              onBack={() => advance("q1")}
              onContinue={(v: ThinkingStyleTrait[]) => advance("q3", { thinkingStyle: v })}
            />
          )}

          {step === "q3" && (
            <Q3Activities
              key="q3"
              value={profile.preferredActivities}
              onBack={() => advance("q2")}
              onContinue={(v: string[]) => advance("q4", { preferredActivities: v })}
            />
          )}

          {step === "q4" && (
            <Q4WorkStyle
              key="q4"
              value={profile.workStyle}
              onBack={() => advance("q3")}
              onContinue={(v: WorkStyle) => advance("q5", { workStyle: v })}
            />
          )}

          {step === "q5" && (
            <Q5CareerValues
              key="q5"
              value={profile.careerValues}
              onBack={() => advance("q4")}
              onContinue={(v: CareerValue[]) => advance("q6", { careerValues: v })}
            />
          )}

          {step === "q6" && (
            <Q6Commitment
              key="q6"
              commitment={profile.commitment}
              additionalContext={profile.additionalContext}
              onBack={() => advance("q5")}
              onContinue={(commitment: Commitment, additionalContext: string) => {
                const finalProfile = { ...profile, commitment, additionalContext, assessmentStatus: "completed" as const };
                setProfile(finalProfile);
                clearWIP();
                setStep("analyzing");
              }}
            />
          )}

          {step === "analyzing" && (
            <AnalyzingStep key="analyzing" profile={profile} onDone={handlePrediction} onError={handlePredictionError} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
