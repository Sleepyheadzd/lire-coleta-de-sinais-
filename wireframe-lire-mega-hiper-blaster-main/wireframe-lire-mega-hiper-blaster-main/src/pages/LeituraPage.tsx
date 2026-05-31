import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingHistory } from "@/contexts/ReadingHistoryContext";
import { useSearchParams } from "react-router-dom";
import { PremiumModal } from "@/components/PremiumModal";
import {
  Upload,
  Type,
  SunMoon,
  Volume2,
  Focus,
  ScanText,
  Minus,
  Plus,
  AlignLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LeituraPage = () => {
  const [hasDocument, setHasDocument] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [font, setFont] = useState("system");
  const [focusMode, setFocusMode] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { user } = useAuth();
  const { addEntry, updateProgress, getEntry } = useReadingHistory();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);

  const sampleText = `A leitura acessível transforma a experiência de aprender. Com ferramentas de personalização, cada pessoa pode adaptar o texto às suas necessidades específicas.

Fontes como OpenDyslexic foram projetadas especialmente para facilitar a leitura de pessoas com dislexia. O espaçamento entre letras, palavras e linhas também pode fazer uma grande diferença na compreensão.

O modo foco ajuda a concentrar a atenção em uma parte específica do texto, reduzindo distrações visuais e melhorando a retenção de informações.`;

  // Resume from history
  useEffect(() => {
    const docId = searchParams.get("doc");
    if (docId) {
      const entry = getEntry(docId);
      if (entry) {
        setHasDocument(true);
        setCurrentDocId(docId);
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = entry.scrollPosition;
          }
        }, 100);
      }
    }
  }, [searchParams, getEntry]);

  const handleUpload = () => {
    const id = addEntry({
      name: "Documento de exemplo",
      type: "TXT",
      preview: sampleText.slice(0, 120),
      progress: 0,
      scrollPosition: 0,
    });
    setCurrentDocId(id);
    setHasDocument(true);
  };

  const handleScroll = useCallback(() => {
    if (!contentRef.current || !currentDocId) return;
    const el = contentRef.current;
    const progress = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100) || 0;
    updateProgress(currentDocId, progress, el.scrollTop);
  }, [currentDocId, updateProgress]);

  const fontFamily =
    font === "opendyslexic"
      ? "'OpenDyslexic', sans-serif"
      : font === "comic"
        ? "'Comic Sans MS', cursive"
        : "'Space Grotesk', system-ui, sans-serif";

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-[calc(100vh-5rem)]">
        {/* Main reading area */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-4"
          >
            <h1 className="text-2xl font-bold">Leitura</h1>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setTtsActive(!ttsActive)}
                className={`p-2 rounded-lg border transition-colors ${ttsActive ? "bg-chocolate text-primary-foreground" : "hover:bg-muted"}`}
                title="Texto para voz"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 rounded-lg border transition-colors ${focusMode ? "bg-chocolate text-primary-foreground" : "hover:bg-muted"}`}
                title="Modo foco"
              >
                <Focus className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!user.isPremium) {
                    setShowPremium(true);
                    return;
                  }
                }}
                className="p-2 rounded-lg border hover:bg-muted transition-colors relative"
                title="OCR"
              >
                <ScanText className="w-5 h-5" />
                {!user.isPremium && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-warm flex items-center justify-center text-[8px] text-primary-foreground font-bold">★</span>
                )}
              </button>
            </div>
          </motion.div>

          {!hasDocument ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <button
                onClick={handleUpload}
                className="w-full max-w-md p-12 rounded-2xl border-2 border-dashed border-chocolate/30 hover:border-chocolate/60 hover:bg-chocolate/5 transition-all flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg mb-1">Envie seu documento</p>
                  <p className="text-muted-foreground text-sm">PDF, TXT ou imagem</p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-auto rounded-2xl bg-card border p-8"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineSpacing,
                letterSpacing: `${letterSpacing}px`,
                fontFamily,
              }}
            >
              {focusMode ? (
                <div className="space-y-4">
                  {sampleText.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="p-4 rounded-xl hover:bg-tangerine/10 transition-colors cursor-pointer"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="whitespace-pre-line">{sampleText}</div>
              )}
            </motion.div>
          )}
        </div>

        {/* Settings panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-72 shrink-0 rounded-2xl bg-card border p-5 overflow-auto"
        >
          <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-chocolate" />
            Personalização
          </h2>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Fonte</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System (Space Grotesk)</SelectItem>
                  <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                  <SelectItem value="comic">Comic Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Tamanho: {fontSize}px
              </Label>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="p-1 rounded border hover:bg-muted">
                  <Minus className="w-4 h-4" />
                </button>
                <Slider
                  value={[fontSize]}
                  onValueChange={(v) => setFontSize(v[0])}
                  min={12}
                  max={32}
                  step={1}
                  className="flex-1"
                />
                <button onClick={() => setFontSize(Math.min(32, fontSize + 1))} className="p-1 rounded border hover:bg-muted">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Espaçamento de linha: {lineSpacing.toFixed(1)}
              </Label>
              <Slider
                value={[lineSpacing]}
                onValueChange={(v) => setLineSpacing(v[0])}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Espaçamento de letras: {letterSpacing}px
              </Label>
              <Slider
                value={[letterSpacing]}
                onValueChange={(v) => setLetterSpacing(v[0])}
                min={0}
                max={5}
                step={0.5}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Modo foco</Label>
              <Switch checked={focusMode} onCheckedChange={setFocusMode} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Leitura em voz alta</Label>
              <Switch checked={ttsActive} onCheckedChange={setTtsActive} />
            </div>
          </div>
        </motion.div>
      </div>
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} featureName="OCR (Reconhecimento de Texto)" />
    </DashboardLayout>
  );
};

export default LeituraPage;
