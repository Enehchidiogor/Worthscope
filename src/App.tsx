import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import Mission from "./pages/Mission.tsx";
import Skills from "./pages/Skills.tsx";
import Career from "./pages/Career.tsx";
import Assessment from "./pages/Assessment.tsx";
import CareerResults from "./pages/CareerResults.tsx";
import RoadmapLoading from "./pages/RoadmapLoading.tsx";
import Settings from "./pages/Settings.tsx";
import ParentView from "./pages/ParentView.tsx";
import ParentAccess from "./pages/ParentAccess.tsx";
import Profile from "./pages/Profile.tsx";
import Notifications from "./pages/Notifications.tsx";
import NotFound from "./pages/NotFound.tsx";
import { KokoFloatingChat } from "@/components/koko/KokoFloatingChat";
import { AuthGate } from "@/components/auth/AuthGate";

const queryClient = new QueryClient();

const Gated = ({ children }: { children: React.ReactNode }) => <AuthGate>{children}</AuthGate>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/parent/:token" element={<ParentAccess />} />
          <Route path="/parent-view/:token" element={<ParentView />} />
          <Route path="/parent-view" element={<ParentView />} />
          <Route path="/parent-dashboard" element={<ParentView />} />

          {/* Protected */}
          <Route path="/onboarding" element={<Gated><Onboarding /></Gated>} />
          <Route path="/dashboard" element={<Gated><Index /></Gated>} />
          <Route path="/roadmap" element={<Gated><Roadmap /></Gated>} />
          <Route path="/mission" element={<Gated><Mission /></Gated>} />
          <Route path="/missions" element={<Gated><Mission /></Gated>} />
          <Route path="/skills" element={<Gated><Skills /></Gated>} />
          <Route path="/career" element={<Gated><Career /></Gated>} />
          <Route path="/assessment" element={<Gated><Assessment /></Gated>} />
          <Route path="/career-results" element={<Gated><CareerResults /></Gated>} />
          <Route path="/roadmap-loading" element={<Gated><RoadmapLoading /></Gated>} />
          <Route path="/settings" element={<Gated><Settings /></Gated>} />
          <Route path="/profile" element={<Gated><Profile /></Gated>} />
          <Route path="/notifications" element={<Gated><Notifications /></Gated>} />
          <Route path="/koko" element={<Gated><Index /></Gated>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Global floating Koko chat — visible on every route */}
        <KokoFloatingChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
