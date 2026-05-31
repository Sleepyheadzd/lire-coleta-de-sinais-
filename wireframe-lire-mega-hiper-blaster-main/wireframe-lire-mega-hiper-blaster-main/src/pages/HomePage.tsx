import { motion } from "framer-motion";
import { FileUp, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingHistory } from "@/contexts/ReadingHistoryContext";
import { useLibrasHistory } from "@/contexts/LibrasHistoryContext";
import { HistoricoCard } from "@/components/HistoricoCard";
import { LibrasHistoricoCard } from "@/components/LibrasHistoricoCard";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries: readingEntries } = useReadingHistory();
  const { entries: librasEntries } = useLibrasHistory();
  const module = localStorage.getItem("selectedModule") || "leitura";
  const profileLabel = module === "libras" ? "Usuário Ganesha" : "Usuário Sarasvati";

  const handleResume = (id: string) => {
    navigate(`/leitura?doc=${id}`);
  };

  const handleLibrasResume = (id: string) => {
    navigate(`/libras?entry=${id}`);
  };

  const isLibras = module === "libras";
  const historyEntries = isLibras ? librasEntries : readingEntries;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-1">
            Olá, <span className="text-gradient-warm">{user.name || "Usuário"}</span>
          </h1>
          <p className="text-muted-foreground text-sm">{profileLabel}</p>
        </motion.div>

        {/* Main action */}
        {module === "leitura" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/leitura")}
              className="w-full p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center mb-4">
                <FileUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Abrir documento</h3>
              <p className="text-muted-foreground text-sm">Faça upload de PDF, TXT ou imagem</p>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/libras")}
              className="w-full p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl gradient-cool flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Iniciar comunicação</h3>
              <p className="text-muted-foreground text-sm">Traduzir texto ou gestos em Libras</p>
            </motion.button>
          </motion.div>
        )}

        {/* Continue onde parou */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Continue onde parou</h2>
          </div>

          {historyEntries.length === 0 ? (
            <div className="p-6 rounded-2xl bg-card border text-center">
              <p className="text-muted-foreground text-sm">
                {isLibras
                  ? "Nenhuma interação recente. Inicie uma comunicação para começar."
                  : "Nenhum documento recente. Abra um documento para começar."}
              </p>
            </div>
          ) : isLibras ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {librasEntries.slice(0, 4).map((entry, i) => (
                <LibrasHistoricoCard key={entry.id} entry={entry} index={i} onResume={handleLibrasResume} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {readingEntries.slice(0, 4).map((entry, i) => (
                <HistoricoCard key={entry.id} entry={entry} index={i} onResume={handleResume} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
