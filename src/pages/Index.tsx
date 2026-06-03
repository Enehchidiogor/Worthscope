import { useEffect } from "react";
import { Navigate } from "react-router-dom";
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
import { getProfile, hasResults, isFirstLogin, markLoggedIn, tickStreak } from "@/lib/userState";
import { SEO } from "@/components/SEO";

const Index = () => {
  const profile = getProfile();
  const results = hasResults();

  useEffect(() => {
    if (!profile || !results) return;
    // Real streak engine — increments per consecutive day, resets if missed
    tickStreak();
    const first = isFirstLogin();

    // Always: signal floating Koko to do its strong-pulse + tooltip
    window.dispatchEvent(new CustomEvent("koko:login-pulse"));

    if (first) {
      const t = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("koko:intro"));
      }, 2000);
      // Mark logged in only after we've decided to play the intro
      markLoggedIn();
      return () => clearTimeout(t);
    }
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

          <div className="mt-6">
            <CareerOpportunitiesCard />
          </div>

          <ShareProgressCard />
        </main>
      </div>

      <MobileTabBar />
      <WelcomeToast />
    </div>
  );
};

export default Index;
