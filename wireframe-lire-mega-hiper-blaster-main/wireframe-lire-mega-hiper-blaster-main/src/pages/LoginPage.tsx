import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim());
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-navy relative overflow-hidden">
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-tangerine/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-maya-blue/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground/90 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <h1 className="text-3xl font-bold text-sidebar-foreground mb-1">
          {isRegister ? "Criar conta" : "Entrar"}
        </h1>
        <p className="text-sidebar-foreground/60 mb-8">
          {isRegister ? "Preencha os dados para se cadastrar" : "Acesse sua conta no Lire"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/40 border border-sidebar-foreground/10 focus:outline-none focus:ring-2 focus:ring-tangerine/50"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/40 border border-sidebar-foreground/10 focus:outline-none focus:ring-2 focus:ring-tangerine/50"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/40 border border-sidebar-foreground/10 focus:outline-none focus:ring-2 focus:ring-tangerine/50"
          />

          <Button type="submit" className="w-full py-3 h-auto gradient-warm text-primary-foreground font-medium rounded-xl hover:opacity-90">
            {isRegister ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
            {isRegister ? "Cadastrar" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sidebar-foreground/50 text-sm mt-6">
          {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-tangerine hover:underline font-medium"
          >
            {isRegister ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
