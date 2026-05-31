import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HistoricoEmpty() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">Nenhum documento recente</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        Seus documentos aparecerão aqui conforme você utilizar o módulo de leitura.
      </p>
      <Button onClick={() => navigate("/leitura")}>
        Ir para Leitura
      </Button>
    </motion.div>
  );
}
