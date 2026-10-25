import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  CalendarDays,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);
  const [incomingCode, setIncomingCode] = useState("");
  const referralQuery = trpc.referral.getInfo.useQuery(undefined, {
    enabled: open,
  });

  const utils = trpc.useUtils();

  const applyCodeMutation = trpc.referral.applyCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIncomingCode("");
      utils.profile.get.invalidate();
      utils.referral.getInfo.invalidate();
      utils.voucher.getStatus.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível aplicar o código de indicação.");
    },
  });

  const refInfo = referralQuery.data;
  const link = refInfo?.referralLink || "https://meuautonomo.vercel.app";

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Estou usando o MeuAutônomo para organizar meus orçamentos, agenda e financeiro. Cadastre-se pelo meu link e ganhe 15 dias de Plano PRO grátis: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleApplyIncoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomingCode.trim()) {
      toast.error("Digite o código do amigo.");
      return;
    }
    applyCodeMutation.mutate({ code: incomingCode.trim().toUpperCase() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[28px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7f0] text-[#173a34] mb-3">
            <Gift className="h-6 w-6 text-[#8aa500]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#173a34]">
            Indique um Colega & Ganhe Dias PRO
          </DialogTitle>
          <DialogDescription className="text-sm text-[#58716b]">
            Convide outros profissionais autônomos. Você e seu amigo ganham <strong>15 dias de Plano PRO grátis</strong> a cada ativação!
          </DialogDescription>
        </DialogHeader>

        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-3 my-2">
          <div className="rounded-2xl border border-[#dce5dc] bg-[#f5f8f2] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#58716b]">
              <Users className="h-4 w-4 text-[#8aa500]" />
              <span>Colegas Indicados</span>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-[#173a34]">
              {refInfo?.referralCount ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-[#dce5dc] bg-[#f5f8f2] p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#58716b]">
              <Sparkles className="h-4 w-4 text-[#8aa500]" />
              <span>Dias PRO Ganhos</span>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-[#8aa500]">
              +{refInfo?.bonusDaysEarned ?? 0} dias
            </p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="space-y-3 rounded-2xl border border-[#cbe4d1] bg-[#f5fbf7] p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-[#173a34] block">
            Seu Link Exclusivo de Indicação:
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={link}
              readOnly
              className="h-11 rounded-xl bg-white text-xs font-mono text-[#173a34] border-[#cddbcf]"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className="h-11 shrink-0 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              {copied ? <Check className="h-4 w-4 text-[#d9f56a]" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleWhatsApp}
            className="w-full h-11 rounded-xl bg-[#25D366] text-white hover:bg-[#1fb855] font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar no WhatsApp
          </Button>
        </div>

        {/* How it works */}
        <div className="rounded-xl bg-[#f0f4ef] p-4 text-xs text-[#58716b] space-y-2">
          <p className="font-bold text-[#173a34] text-sm">Como funciona o programa:</p>
          <div className="space-y-1.5 leading-relaxed">
            <p>1. <strong>Compartilhe seu link</strong> com colegas de trabalho (marceneiros, eletricistas, manicures, encanadores, etc.).</p>
            <p>2. O amigo se cadastra usando seu link e <strong>já ganha 15 dias de PRO grátis</strong>.</p>
            <p>3. Quando o amigo ativar o sistema (montar o perfil e emitir orçamento ou agendamento), <strong>você também ganha +15 dias de PRO</strong> somados na sua conta automaticamente!</p>
          </div>
        </div>

        {/* Insert Colleague Code */}
        <form onSubmit={handleApplyIncoming} className="pt-2 border-t border-[#dce5dc] space-y-2">
          <label className="text-xs font-semibold text-[#58716b] block">
            Foi indicado por alguém? Digite o código dele:
          </label>
          <div className="flex gap-2">
            <Input
              value={incomingCode}
              onChange={(e) => setIncomingCode(e.target.value.toUpperCase())}
              placeholder="Código do colega (ex: JOAO-1234)"
              className="h-10 rounded-xl text-xs uppercase border-[#cddbcf]"
              disabled={applyCodeMutation.isPending}
            />
            <Button
              type="submit"
              disabled={applyCodeMutation.isPending || !incomingCode.trim()}
              className="h-10 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-semibold shrink-0"
            >
              {applyCodeMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  Resgatar
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
