import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index.tsx";
import JourneyPage from "./pages/JourneyPage.tsx";
import ModulePage from "./pages/ModulePage.tsx";
import ExportPage from "./pages/ExportPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import MissionFitPage from "./pages/missionFit/MissionFitPage.tsx";
import CompanyProfilePage from "./pages/missionFit/CompanyProfilePage.tsx";
import MemberReflectionPage from "./pages/missionFit/MemberReflectionPage.tsx";
import DossierPage from "./pages/missionFit/DossierPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
                <Route path="/module/:id" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
                <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
                <Route path="/mission-fit" element={<ProtectedRoute><MissionFitPage /></ProtectedRoute>} />
                <Route path="/mission-fit/company" element={<ProtectedRoute><CompanyProfilePage /></ProtectedRoute>} />
                <Route path="/mission-fit/member/:id" element={<ProtectedRoute><MemberReflectionPage /></ProtectedRoute>} />
                <Route path="/mission-fit/dossier/:id" element={<ProtectedRoute><DossierPage /></ProtectedRoute>} />
                {/* Standalone invite — no auth, so teammates can reflect privately on their own device */}
                <Route path="/mission-fit/reflect" element={<MemberReflectionPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
