import { Crown, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
}

export function PremiumModal({ open, onClose, featureName }: PremiumModalProps) {
  const { upgradeToPremium } = useAuth();

  const handleSubscribe = () => {
    upgradeToPremium();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-2">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl">Recurso Premium</DialogTitle>
          <DialogDescription className="text-center">
            A funcionalidade <strong className="text-foreground">{featureName}</strong> é exclusiva para assinantes do plano Premium.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted p-4 text-center my-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recurso bloqueado</span>
          </div>
          <p className="text-2xl font-bold">
            R$ 20,00<span className="text-sm font-normal text-muted-foreground">/mês</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button onClick={handleSubscribe} className="w-full gradient-warm text-primary-foreground hover:opacity-90">
            <Crown className="w-4 h-4 mr-2" />
            Assinar Premium
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
