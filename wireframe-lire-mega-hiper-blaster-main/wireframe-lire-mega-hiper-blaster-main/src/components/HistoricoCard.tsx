import { motion } from "framer-motion";
import { FileText, Image, FileType, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ReadingEntry } from "@/contexts/ReadingHistoryContext";

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  TXT: FileType,
  Imagem: Image,
  Outro: FileText,
};

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

function progressLabel(progress: number) {
  if (progress < 10) return "Início";
  if (progress < 50) return `${progress}% lido`;
  if (progress < 90) return `${progress}% lido`;
  if (progress < 100) return "Quase lá";
  return "Concluído";
}

interface Props {
  entry: ReadingEntry;
  index: number;
  onResume: (id: string) => void;
}

export function HistoricoCard({ entry, index, onResume }: Props) {
  const Icon = typeIcons[entry.type] || FileText;

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
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{entry.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {entry.type}
                </Badge>
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(entry.lastAccessed)}
                </span>
              </div>
            </div>
          </div>

          {entry.preview && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {entry.preview}
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-primary">{progressLabel(entry.progress)}</span>
            </div>
            <Progress value={entry.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
