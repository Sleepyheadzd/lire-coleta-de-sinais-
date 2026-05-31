import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useReadingHistory } from "@/contexts/ReadingHistoryContext";
import { HistoricoCard } from "@/components/HistoricoCard";
import { HistoricoEmpty } from "@/components/HistoricoEmpty";

const HistoricoPage = () => {
  const { entries } = useReadingHistory();
  const navigate = useNavigate();

  const handleResume = (id: string) => {
    navigate(`/leitura?doc=${id}`);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Continue onde parou</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Retome a leitura dos seus documentos recentes
          </p>
        </div>

        {entries.length === 0 ? (
          <HistoricoEmpty />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, i) => (
              <HistoricoCard key={entry.id} entry={entry} index={i} onResume={handleResume} />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HistoricoPage;
