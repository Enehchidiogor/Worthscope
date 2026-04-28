import { useEffect } from "react";
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
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { WelcomeToast } from "@/components/dashboard/WelcomeToast";

const Index = () => {
  /* On every dashboard mount: trigger Koko's "login" sequence
     (toast, button pulse + tooltip). On the FIRST login only,
     also auto-open the chat panel with intro messages. */
  useEffect(() => {
    const isFirstLogin = !localStorage.getItem("worthscope_first_login");

    // Always: signal floating Koko to do its strong-pulse + tooltip
    window.dispatchEvent(new CustomEvent("koko:login-pulse"));

    if (isFirstLogin) {
      // Auto-open the chat 2s after dashboard load with a guided intro
      const t = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("koko:intro"));
      }, 2000);
      localStorage.setItem("worthscope_first_login", "true");
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <Sidebar />

      <div className="md:ml-[220px]">
        <TopBar />

        <main className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <Greeting />
          {/* KokoPanel removed — replaced by floating chat + welcome toast */}
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

          {/* Career Opportunities — locked or unlocked */}
          <div className="mt-6">
            <CareerOpportunitiesCard />
          </div>
        </main>
      </div>

      <MobileTabBar />
      <WelcomeToast />
    </div>
  );
};

export default Index;
