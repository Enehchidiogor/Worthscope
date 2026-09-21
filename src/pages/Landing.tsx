import { SEO } from "@/components/SEO";
import { ExperienceProvider } from "@/components/experience/ExperienceContext";
import AmbientBackground from "@/components/landing/AmbientBackground";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import HeroSection from "@/components/landing/sections/HeroSection";
import DirectionGapSection from "@/components/landing/sections/DirectionGapSection";
import TalkToKokoSection from "@/components/landing/sections/TalkToKokoSection";
import WhatWorthScopeDoesSection from "@/components/landing/sections/WhatWorthScopeDoesSection";
import WorthJourneySection from "@/components/landing/sections/WorthJourneySection";
import FutureEarningSection from "@/components/landing/sections/FutureEarningSection";
import ForStudentsSection from "@/components/landing/sections/ForStudentsSection";
import ForProfessionalsSection from "@/components/landing/sections/ForProfessionalsSection";
import ForBusinessesSection from "@/components/landing/sections/ForBusinessesSection";
import BigStatementSection from "@/components/landing/sections/BigStatementSection";
import FinalCtaSection from "@/components/landing/sections/FinalCtaSection";

/* WorthScope — landing page. Black × Blue × White.
   Interactive, but structured like a landing page: hero, problem, Koko,
   product, journey, earning simulator, audiences, brand moment, final CTA. */
export default function Landing() {
  return (
    <ExperienceProvider>
      <div style={{ position: "relative", overflowX: "clip" as "hidden" }}>
        <SEO
          title="WorthScope — Know Your Worth. Build Your Direction."
          description="WorthScope is an AI-driven career intelligence platform helping students and early professionals understand their skills, discover career paths, identify skill gaps, and see what their future could be worth."
          path="/"
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WorthScope",
              url: "https://ambition-beacon.lovable.app",
              description: "AI-powered career intelligence guided by Koko.",
            },
          ]}
        />

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          body { background: #000; }
        `}</style>

        <AmbientBackground />
        <LandingNav />

        <main style={{ position: "relative", zIndex: 1 }}>
          <HeroSection />
          <DirectionGapSection />
          <TalkToKokoSection />
          <WhatWorthScopeDoesSection />
          <WorthJourneySection />
          <FutureEarningSection />
          <ForStudentsSection />
          <ForProfessionalsSection />
          <ForBusinessesSection />
          <BigStatementSection />
          <FinalCtaSection />
        </main>

        <LandingFooter />
      </div>
    </ExperienceProvider>
  );
}
