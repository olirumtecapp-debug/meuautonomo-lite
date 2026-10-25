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
import { Ticket, Sparkles, CheckCircle2, Crown, Gift, Loader2 } from "lucide-react";

interface VoucherRedeemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VoucherRedeemModal({ open, onOpenChange, onSuccess }: VoucherRedeemModalProps) {
  const [code, setCode] = useState("");
  const [redeemedData, setRedeemedData] = useState<{
    message: string;
    isVipTotal: boolean;
    days?: number;
  } | null>(null);

  const utils = trpc.useUtils();

  const redeemMutation = trpc.voucher.redeem.useMutation({
    onSuccess: (data) => {
      setRedeemedData(data);
      toast.success(data.message);
      utils.profile.get.invalidate();
      utils.voucher.getStatus.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível resgatar o voucher.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Digite o código do voucher.");
      return;
    }
    redeemMutation.mutate({ code: code.trim().toUpperCase() });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCode("");
      setRedeemedData(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-[28px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7f0] text-[#173a34] mb-3">
            <Ticket className="h-6 w-6 text-[#8aa500]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#173a34]">
            Resgatar Cupom ou Voucher
          </DialogTitle>
          <DialogDescription className="text-sm text-[#58716b]">
            Insira o código do seu voucher promocional para liberar dias gratuitos de Plano PRO ou acesso VIP.
          </DialogDescription>
        </DialogHeader>

        {redeemedData ? (
          <div className="my-4 space-y-4 rounded-2xl border border-[#cbe4d1] bg-[#f5fbf7] p-5 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#173a34] text-[#d9f56a] shadow-md">
              {redeemedData.isVipTotal ? <Crown className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#173a34]">
                {redeemedData.isVipTotal ? "⭐ VIP Total Ativado!" : "🎉 Voucher Ativado com Sucesso!"}
              </h3>
              <p className="mt-1 text-sm text-[#446258]">{redeemedData.message}</p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="w-full rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              Começar a Aproveitar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#58716b] block mb-1.5">
                Código do Voucher / Cupom
              </label>
              <div className="relative">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Digite seu código promocional"
                  className="h-12 rounded-xl text-base uppercase font-bold tracking-wider pl-4 pr-10 border-[#cddbcf] focus-visible:ring-[#8aa500]"
                  disabled={redeemMutation.isPending}
                  autoFocus
                />
                <Ticket className="absolute right-3.5 top-3.5 h-5 w-5 text-[#8aa500]/60 pointer-events-none" />
              </div>
              <p className="mt-2 text-xs text-[#758d7c]">
                💡 O código não diferencia maiúsculas de minúsculas.
              </p>
            </div>

            <div className="rounded-xl bg-[#f0f4ef] p-3 text-xs text-[#58716b] space-y-1">
              <p className="font-semibold text-[#173a34] flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-[#8aa500]" />
                Tem um convite de teste?
              </p>
              <p>
                Os vouchers liberam recursos avançados como orçamentos ilimitados, fotos em orçamentos, relatórios completos e muito mais.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="rounded-xl border-[#cddbcf] text-[#58716b]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={redeemMutation.isPending || !code.trim()}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-[#d9f56a]" />
                    Ativar Voucher
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
