import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReadingHistoryProvider } from "@/contexts/ReadingHistoryContext";
import { LibrasHistoryProvider } from "@/contexts/LibrasHistoryContext";
import { RequireAuth } from "@/components/RequireAuth";
import Onboarding from "./pages/Onboarding";
import HomePage from "./pages/HomePage";
import LeituraPage from "./pages/LeituraPage";
import HistoricoPage from "./pages/HistoricoPage";
import LibrasPage from "./pages/LibrasPage";
import BlogPage from "./pages/BlogPage";
import PerfilPage from "./pages/PerfilPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ReadingHistoryProvider>
      <LibrasHistoryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/leitura" element={<RequireAuth><LeituraPage /></RequireAuth>} />
            <Route path="/historico" element={<RequireAuth><HistoricoPage /></RequireAuth>} />
            <Route path="/libras" element={<RequireAuth><LibrasPage /></RequireAuth>} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/configuracoes" element={<RequireAuth><ConfiguracoesPage /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LibrasHistoryProvider>
      </ReadingHistoryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
