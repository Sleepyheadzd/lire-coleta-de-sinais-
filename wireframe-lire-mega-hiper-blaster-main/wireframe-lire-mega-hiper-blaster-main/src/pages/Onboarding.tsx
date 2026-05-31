import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Hand, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, enterAnonymous } = useAuth();

  const handleModuleSelect = (mod: string) => {
    const profile = mod === "leitura" ? "sarasvati" : "ganesha";
    localStorage.setItem("selectedModule", mod);
    localStorage.setItem("selectedProfile", profile);
    if (user.isLoggedIn) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  const handleAnonymous = () => {
    enterAnonymous();
    navigate("/blog");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-navy relative overflow-hidden">
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-tangerine/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-maya-blue/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-sidebar-foreground mb-3"
          >
            Bem-vindo ao <span className="text-gradient-warm">Lire</span>
          </motion.h1>
          <p className="text-sidebar-foreground/70 text-lg">
            Escolha sua experiência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModuleSelect("leitura")}
            className="group relative p-8 rounded-2xl border border-tangerine/20 bg-tangerine/5 backdrop-blur-sm hover:bg-tangerine/10 transition-all text-left"
          >
            <div className="w-14 h-14 rounded-xl gradient-warm flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-sidebar-foreground mb-1">
              Leitura Acessível
            </h3>
            <p className="text-sm font-medium text-tangerine/80 mb-2">Perfil Sarasvati</p>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed">
              Leia documentos com personalização completa, OCR e leitura em voz alta
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModuleSelect("libras")}
            className="group relative p-8 rounded-2xl border border-maya-blue/20 bg-maya-blue/5 backdrop-blur-sm hover:bg-maya-blue/10 transition-all text-left"
          >
            <div className="w-14 h-14 rounded-xl gradient-cool flex items-center justify-center mb-4">
              <Hand className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-sidebar-foreground mb-1">
              Comunicação em Libras
            </h3>
            <p className="text-sm font-medium text-maya-blue/80 mb-2"><p className="text-sm font-medium text-maya-blue/80 mb-2">Perfil Ganesha</p></p>
            <p className="text-sidebar-foreground/60 text-sm leading-relaxed">
              Traduza texto para Libras com avatar 3D e reconheça gestos em tempo real
            </p>
          </motion.button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleAnonymous}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground/80 text-sm flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Entrar sem conta (apenas Blog)
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
