import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, BookOpen, Hand, Cloud, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const PerfilPage = () => {
  const { user, isAnonymous } = useAuth();
  const navigate = useNavigate();
  const profile = localStorage.getItem("selectedProfile") || "sarasvati";

  // Anonymous users clicking Perfil get redirected to login
  useEffect(() => {
    if (!user.isLoggedIn && isAnonymous) {
      navigate("/login", { replace: true });
    }
  }, [user.isLoggedIn, isAnonymous, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-card border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">{user.name || "Usuário"}</h2>
                <p className="text-muted-foreground text-sm">
                  Perfil: {profile === "sarasvati" ? "Sarasvati" : "Ganesha"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${profile === "sarasvati" ? "bg-tangerine/10 text-chocolate" : "bg-muted text-muted-foreground"}`}>
                <BookOpen className="w-4 h-4" />
                Leitura
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${profile === "ganesha" ? "bg-maya-blue/10 text-egyptian-blue" : "bg-muted text-muted-foreground"}`}>
                <Hand className="w-4 h-4" />
                Libras
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-maya-blue" />
              Sincronização
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-chocolate" />
              <span>Dados sincronizados localmente</span>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilPage;
