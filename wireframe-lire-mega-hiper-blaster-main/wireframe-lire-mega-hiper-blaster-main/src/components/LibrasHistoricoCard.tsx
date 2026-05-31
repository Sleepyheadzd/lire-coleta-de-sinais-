import { motion } from "framer-motion";
import { MessageCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LibrasEntry } from "@/contexts/LibrasHistoryContext";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

interface Props {
  entry: LibrasEntry;
  index: number;
  onResume: (id: string) => void;
}

export function LibrasHistoricoCard({ entry, index, onResume }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
        onClick={() => onResume(entry.id)}
      >
        <CardContent className="p-5 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-2">{entry.text}</p>
              <span className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {formatDate(entry.lastAccessed)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
