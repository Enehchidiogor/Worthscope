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
import MultiPickStep from "@/components/discover/MultiPickStep";
import ScenariosStep from "@/components/discover/ScenariosStep";
import { STRENGTHS, EXPERIENCE, DISLIKES } from "@/lib/careerQuestions";
import { eyebrowFor, isQuestionStep, nextAfter, prevBefore, questionNumber, TOTAL_QUESTIONS, type Step } from "@/components/discover/flow";


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
    if (wip && (wip.step === "q0" || isQuestionStep(wip.step))) {
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
      <SEO title="Career Discovery — WorthScope" description="Answer a few thoughtful questions so Koko can map your career direction." path="/discover" />

      <AmbientBackground />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {showProgress && <ProgressBar step={questionNumber(step as Parameters<typeof questionNumber>[0])} total={TOTAL_QUESTIONS} />}

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
              onBack={() => advance(prevBefore("q1"))}
              onContinue={(text) => advance(nextAfter("q1"), { personalContext: text })}
            />
          )}

          {step === "q2" && (
            <Q2ThinkingStyle
              key="q2"
              value={profile.thinkingStyle}
              onBack={() => advance(prevBefore("q2"))}
              onContinue={(v: ThinkingStyleTrait[]) => advance(nextAfter("q2"), { thinkingStyle: v })}
            />
          )}

          {step === "q3" && (
            <Q3Activities
              key="q3"
              value={profile.preferredActivities}
              onBack={() => advance(prevBefore("q3"))}
              onContinue={(v: string[]) => advance(nextAfter("q3"), { preferredActivities: v })}
            />
          )}

          {step === "s1" && (
            <MultiPickStep
              key="s1"
              eyebrow={eyebrowFor("s1")}
              title="What are you strongest at in school?"
              subtitle="Pick up to 3 subjects where you do best or enjoy the most."
              hint="Not sure? Think about the subjects where you get good marks or lose track of time."
              options={STRENGTHS}
              value={profile.strengths}
              max={3}
              onBack={() => advance(prevBefore("s1"))}
              onContinue={(ids) => advance(nextAfter("s1"), { strengths: ids })}
            />
          )}

          {step === "s2" && (
            <MultiPickStep
              key="s2"
              eyebrow={eyebrowFor("s2")}
              title="What have you already tried?"
              subtitle="Pick everything you've actually done, even a little, even just for fun."
              hint="What you've really done tells Koko more than what you think you'd like."
              options={EXPERIENCE}
              value={profile.experience}
              max={6}
              optional
              onBack={() => advance(prevBefore("s2"))}
              onContinue={(ids) => advance(nextAfter("s2"), { experience: ids })}
            />
          )}

          {step === "s3" && (
            <ScenariosStep
              key="s3"
              eyebrow={eyebrowFor("s3")}
              value={profile.scenarios}
              onBack={() => advance(prevBefore("s3"))}
              onContinue={(v) => advance(nextAfter("s3"), { scenarios: v })}
            />
          )}

          {step === "q4" && (
            <Q4WorkStyle
              key="q4"
              value={profile.workStyle}
              onBack={() => advance(prevBefore("q4"))}
              onContinue={(v: WorkStyle) => advance(nextAfter("q4"), { workStyle: v })}
            />
          )}

          {step === "q5" && (
            <Q5CareerValues
              key="q5"
              value={profile.careerValues}
              onBack={() => advance(prevBefore("q5"))}
              onContinue={(v: CareerValue[]) => advance(nextAfter("q5"), { careerValues: v })}
            />
          )}

          {step === "s4" && (
            <MultiPickStep
              key="s4"
              eyebrow={eyebrowFor("s4")}
              title="What would you hate doing all day?"
              subtitle="Pick up to 3. Knowing what to avoid is as useful as knowing what you love."
              options={DISLIKES}
              value={profile.dislikes}
              max={3}
              optional
              onBack={() => advance(prevBefore("s4"))}
              onContinue={(ids) => advance(nextAfter("s4"), { dislikes: ids })}
            />
          )}

          {step === "q6" && (
            <Q6Commitment
              key="q6"
              commitment={profile.commitment}
              additionalContext={profile.additionalContext}
              onBack={() => advance(prevBefore("q6"))}
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
