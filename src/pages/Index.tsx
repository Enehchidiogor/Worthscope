import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Greeting } from "@/components/dashboard/Greeting";
import { KokoPanel } from "@/components/dashboard/KokoPanel";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { CurrentPhase } from "@/components/dashboard/CurrentPhase";
import { Missions } from "@/components/dashboard/Missions";
import { SkillProgress } from "@/components/dashboard/SkillProgress";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { CareerSummary } from "@/components/dashboard/CareerSummary";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-poppins text-foreground">
      <Sidebar />

      <div className="md:ml-[220px]">
        <TopBar />

        <main className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-8 md:px-8 md:pb-12">
          <Greeting />
          <KokoPanel />
          <Roadmap />
          <CurrentPhase />

          <section
            className="ws-fade-up mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2"
            style={{ animationDelay: "0.65s" }}
          >
            <Missions />
            <SkillProgress />
          </section>

          <section
            className="ws-fade-up grid grid-cols-1 gap-5 lg:grid-cols-2"
            style={{ animationDelay: "0.8s" }}
          >
            <StreakCard />
            <CareerSummary />
          </section>
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
};

export default Index;
