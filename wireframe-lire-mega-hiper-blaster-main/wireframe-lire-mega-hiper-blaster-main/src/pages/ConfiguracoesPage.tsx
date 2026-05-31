import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Shield, Palette, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ConfiguracoesPage = () => {
  const navigate = useNavigate();
  const module = localStorage.getItem("selectedModule") || "leitura";
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);

  const handleSwitchModule = () => {
    setShowSwitchConfirm(true);
  };

  const confirmSwitchModule = () => {
    localStorage.removeItem("selectedModule");
    localStorage.removeItem("selectedProfile");
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência</p>
        </motion.div>

        <div className="space-y-6">
          {/* Geral */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-card border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-chocolate" />
              Geral
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Tema</Label>
                <Select defaultValue="claro">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="escuro">Escuro</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Idioma</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Acessibilidade */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-egyptian-blue" />
              Acessibilidade
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Interface adaptativa</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Reduzir animações</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alto contraste</Label>
                <Switch />
              </div>
            </div>
          </motion.div>

          {/* Trocar módulo */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-card border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-chocolate" />
              Módulo ativo
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Você está usando o módulo <strong>{module === "libras" ? "Libras (Ganesha)" : "Leitura (Sarasvati)"}</strong>.
            </p>
            <Button variant="outline" onClick={handleSwitchModule}>
              Trocar módulo
            </Button>
          </motion.div>

          {/* Privacidade */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-card border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-tangerine" />
              Privacidade
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Permitir acesso à câmera</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Coletar dados de uso</Label>
                <Switch />
              </div>
              <button className="text-sm text-destructive hover:underline mt-2">
                Excluir minha conta
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AlertDialog open={showSwitchConfirm} onOpenChange={setShowSwitchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar de módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja trocar de módulo? Suas configurações atuais serão mantidas, mas a interface será alterada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitchModule}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ConfiguracoesPage;
