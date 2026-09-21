import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { claimDailyWelcome } from "@/lib/authClient";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Greeting } from "@/components/dashboard/Greeting";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { CurrentPhase } from "@/components/dashboard/CurrentPhase";
import { Missions } from "@/components/dashboard/Missions";
import { SkillProgress } from "@/components/dashboard/SkillProgress";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { CareerSummary } from "@/components/dashboard/CareerSummary";
import { CareerOpportunitiesCard } from "@/components/dashboard/CareerOpportunitiesCard";
import { ShareProgressCard } from "@/components/dashboard/ShareProgressCard";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { WelcomeToast } from "@/components/dashboard/WelcomeToast";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { getProfile, hasResults, isFirstLogin, markLoggedIn, tickStreak } from "@/lib/userState";
import { SEO } from "@/components/SEO";

const Index = () => {
  const profile = getProfile();
  const results = hasResults();

  const [welcomeToday, setWelcomeToday] = useState(false);

  useEffect(() => {
    if (!profile || !results) return;
    // Real streak engine — increments per consecutive day, resets if missed
    tickStreak();

    let cancelled = false;
    let introTimer: number | undefined;
    (async () => {
      // Welcome at most once per calendar day (gated by profiles.last_welcomed_at)
      // so the greeting/pulse/intro don't fire on every visit or refresh.
      const eligible = await claimDailyWelcome();
      if (cancelled || !eligible) return;
      setWelcomeToday(true);
      window.dispatchEvent(new CustomEvent("koko:login-pulse"));
      if (isFirstLogin()) {
        markLoggedIn();
        introTimer = window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("koko:intro"));
        }, 2000);
      }
    })();

    return () => {
      cancelled = true;
      if (introTimer) clearTimeout(introTimer);
    };
  }, [profile, results]);

  if (!profile) return <Navigate to="/onboarding" replace />;
  if (!results) return <Navigate to="/assessment" replace />;

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <SEO
        title="Dashboard — WorthScope"
        description="Your WorthScope dashboard — current phase, active missions, and progress at a glance."
        path="/dashboard"
      />
      <Sidebar activePath="/dashboard" />

      <div className="md:ml-[220px]">
        <TopBar />

        <main className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <Greeting />
          <Roadmap />
          <CurrentPhase />

          <section
            className="ws-fade-up mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2"
            style={{ animationDelay: "0.5s" }}
          >
            <Missions />
            <SkillProgress />
          </section>

          <section
            className="ws-fade-up grid grid-cols-1 gap-5 lg:grid-cols-2"
            style={{ animationDelay: "0.65s" }}
          >
            <StreakCard />
            <CareerSummary />
          </section>

          <div data-tour="career" className="mt-6">
            <CareerOpportunitiesCard />
          </div>

          <ShareProgressCard />
        </main>
      </div>

      <MobileTabBar />
      {welcomeToday && <WelcomeToast />}
      <OnboardingTour />
    </div>
  );
};

export default Index;
