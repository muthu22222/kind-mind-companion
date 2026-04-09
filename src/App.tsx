import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import MoodPage from "./pages/MoodPage";
import JournalPage from "./pages/JournalPage";
import DashboardPage from "./pages/DashboardPage";
import BreathePage from "./pages/BreathePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/mood" element={<MoodPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/breathe" element={<BreathePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
