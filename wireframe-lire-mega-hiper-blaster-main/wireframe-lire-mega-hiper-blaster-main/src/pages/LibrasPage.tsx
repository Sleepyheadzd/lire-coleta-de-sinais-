import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrasHistory } from "@/contexts/LibrasHistoryContext";
import { useSearchParams } from "react-router-dom";
import { PremiumModal } from "@/components/PremiumModal";
import { Send, Camera, Smartphone, Volume2, Type } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LibrasPage = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("entry");
  const { entries: librasEntries, addEntry, getEntry } = useLibrasHistory();

  const resumedEntry = resumeId ? getEntry(resumeId) : null;
  const [inputText, setInputText] = useState(resumedEntry?.text || "");
  const [isTranslating, setIsTranslating] = useState(!!resumedEntry);
  const [showPremium, setShowPremium] = useState(false);
  const { user } = useAuth();

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    addEntry(inputText.trim());
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-1">Comunicação em Libras</h1>
          <p className="text-muted-foreground">
            Traduza texto para Libras ou reconheça gestos em tempo real
          </p>
        </motion.div>

        <Tabs defaultValue="texto" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="texto" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Texto → Libras
            </TabsTrigger>
            <TabsTrigger value="gestos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Gestos → Texto
            </TabsTrigger>
            <TabsTrigger value="remoto" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Comunicação Remota
            </TabsTrigger>
          </TabsList>

          <TabsContent value="texto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input area */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-card border p-6"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-egyptian-blue" />
                  Texto de entrada
                </h3>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite o texto que deseja traduzir para Libras..."
                  className="w-full h-48 p-4 rounded-xl bg-muted border-0 resize-none focus:outline-none focus:ring-2 focus:ring-egyptian-blue/50 text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleTranslate}
                    disabled={!inputText.trim()}
                    className="px-5 py-2.5 rounded-xl gradient-cool text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    Traduzir
                  </button>
                </div>
              </motion.div>

              {/* Avatar area */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-card border p-6 flex flex-col items-center justify-center min-h-[350px]"
              >
                {isTranslating ? (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full gradient-cool animate-pulse-glow mx-auto mb-4 flex items-center justify-center">
                      <span className="text-5xl">🤟</span>
                    </div>
                    <p className="text-muted-foreground">Traduzindo...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <span className="text-5xl opacity-40">🧑</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      O avatar 3D aparecerá aqui para demonstrar os sinais em Libras
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="gestos">
            {!user.isPremium ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-card border p-8 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Recurso Premium</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  O reconhecimento de gestos é exclusivo para assinantes Premium
                </p>
                <button
                  onClick={() => setShowPremium(true)}
                  className="px-6 py-3 rounded-xl gradient-warm text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  ★ Ver plano Premium
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-card border p-8 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-20 h-20 rounded-2xl gradient-cool flex items-center justify-center mb-5">
                  <Camera className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reconhecimento de Gestos</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Ative a câmera para reconhecer gestos em Libras e convertê-los em texto ou áudio
                </p>
                <button className="px-6 py-3 rounded-xl gradient-cool text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Camera className="w-5 h-5" />
                  Ativar Câmera
                </button>
                <div className="flex gap-3 mt-4">
                  <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground flex items-center gap-1">
                    <Type className="w-3 h-3" /> Saída: Texto
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Saída: Áudio
                  </span>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="remoto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-card border p-8 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-20 h-20 rounded-2xl gradient-navy flex items-center justify-center mb-5">
                <Smartphone className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunicação Remota</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Conecte um celular via rede local para enviar texto que será convertido em Libras pelo avatar
              </p>
              <div className="w-48 h-48 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-xs">QR Code aparecerá aqui</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Escaneie com o celular para conectar
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} featureName="Reconhecimento de Gestos" />
    </DashboardLayout>
  );
};

export default LibrasPage;
