import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  QrCode,
  Copy,
  ArrowRight,
  HelpCircle,
  Clock,
  Zap,
  Users,
  Building2,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  Ticket,
  Gift,
  Crown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { VoucherRedeemModal } from "@/components/VoucherRedeemModal";

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<"solo" | "team" | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const profileQuery = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const userAccountType = (profileQuery.data as any)?.accountType || "individual";
  const [viewMode, setViewMode] = useState<"individual" | "equipe">("individual");

  useEffect(() => {
    if (profileQuery.data?.accountType) {
      setViewMode(profileQuery.data.accountType);
    }
  }, [profileQuery.data?.accountType]);

  // Estado do PIX real do Asaas
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    paymentId: string;
    encodedImage: string;
    payload: string;
    invoiceUrl: string;
  } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Preços
  const PRICE_SOLO = "R$ 59,90";
  const PRICE_TEAM = "R$ 99,90";

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleOpenCheckout = async (plan: "solo" | "team") => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setPixData(null);
    setPixError(null);
    setPixLoading(true);
    setPixModalOpen(true);
    stopPolling();

    try {
      const res = await fetch("/api/asaas/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setPixError(data?.error || "Erro ao carregar PIX. Tente novamente.");
        setPixLoading(false);
        return;
      }

      setPixData(data);
      setPixLoading(false);

      // Inicia polling para detectar pagamento confirmado automaticamente
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/asaas/payment-status/${data.paymentId}`,
            { credentials: "include" }
          );
          const statusData = await statusRes.json();
          if (statusData.confirmed) {
            clearInterval(interval);
            setPollingInterval(null);
            setPaymentSuccess(true);
            toast.success("🎉 Pagamento confirmado! Plano ativado automaticamente.");
            utils.profile.get.invalidate();
          }
        } catch {
          // silently ignore polling errors
        }
      }, 3000); // verifica a cada 3s
      setPollingInterval(interval);
    } catch {
      setPixError("Erro de conexão. Verifique sua internet e tente novamente.");
      setPixLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.payload) return;
    navigator.clipboard?.writeText(pixData.payload);
    toast.success("Código PIX Copia e Cola copiado!");
  };

  const handleCloseModal = () => {
    stopPolling();
    setPixModalOpen(false);
  };

  const handleSimulateWebhookSuccess = async () => {
    setSimulatingPayment(true);
    try {
      // Simula a confirmação via webhook do Asaas (apenas admin)
      const res = await fetch("/api/webhooks/asaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "asaas-access-token": "meuautonomo-asaas-webhook-secret-token",
        },
        body: JSON.stringify({
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_sim_" + Date.now(),
            customer: "cus_sim_" + Date.now(),
            value: selectedPlan === "solo" ? 59.9 : 99.9,
            netValue: selectedPlan === "solo" ? 59.9 : 99.9,
            billingType: "PIX",
            status: "RECEIVED",
            description: selectedPlan === "solo" ? "MeuAutônomo PRO Individual – Vitalício" : "MeuAutônomo PRO Equipe & Estúdio – Vitalício",
            externalReference: profileQuery.data?.userId ? String(profileQuery.data.userId) : "1",
          },
        }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        toast.success("Pagamento simulado via Webhook do Asaas!");
        utils.profile.get.invalidate();
      } else {
        toast.error("Erro na simulação do webhook.");
      }
    } catch (err) {
      toast.error("Erro ao simular webhook.");
    } finally {
      setSimulatingPayment(false);
    }
  };

  const currentPlan = profileQuery.data?.plan || "free";
  const isAdmin = (profileQuery.data as any)?.role === "admin";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f5f7f2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* CABEÇALHO */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-[#173a34] text-[#d9f56a] hover:bg-[#173a34] text-xs font-bold px-3 py-1 mb-3 rounded-full border-0">
              ✨ Sem Mensalidades • Pagamento Único no PIX
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173a34] tracking-tight">
              Planos Transparentes para o seu Sucesso
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#617770] leading-relaxed">
              Comece 100% grátis com 10 orçamentos por mês. Quando seu negócio crescer, desbloqueie o acesso vitalício com taxa única e garantia incondicional de 7 dias.
            </p>
          </div>

          {/* BANNER DE VOUCHER / DEGUSTAÇÃO */}
          <div className="rounded-2xl border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-sm">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#173a34] flex items-center gap-2">
                  Possui um Cupom ou Voucher de Teste?
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#173a34] text-[#d9f56a] px-2 py-0.5 rounded-full">
                    Ativação Imediata
                  </span>
                </h4>
                <p className="text-xs text-[#58716b] mt-0.5">
                  Recebeu um convite de teste ou código promocional? Digite aqui para liberar dias gratuitos de Plano PRO ou acesso VIP.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setVoucherModalOpen(true)}
              className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              <Ticket className="mr-2 h-4 w-4 text-[#d9f56a]" />
              Digitar Código do Voucher
            </Button>
          </div>

          {/* SELETOR DE MODO: INDIVIDUAL vs EQUIPE */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[#dce5dc] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#173a34] text-[#d9f56a] font-bold">
                {viewMode === "individual" ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#173a34] block">
                  Visualizando planos para: <strong className="text-emerald-800">{viewMode === "individual" ? "👤 Autônomo Individual" : "👥 Equipe & Estúdio"}</strong>
                </span>
                <span className="text-[11px] text-[#71867f]">
                  {viewMode === "individual"
                    ? "Para quem trabalha sozinho e quer o sistema enxuto sem telas de equipe"
                    : "Para salões, estúdios, oficinas e negócios com ajudantes ou parceiras"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#f5f7f2] rounded-xl w-full sm:w-auto border border-[#e2e9df]">
              <button
                type="button"
                onClick={() => setViewMode("individual")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  viewMode === "individual"
                    ? "bg-[#173a34] text-white shadow-xs"
                    : "text-[#58716b] hover:text-[#173a34] hover:bg-white/50"
                }`}
              >
                <span>👤 Individual</span>
                {userAccountType === "individual" && (
                  <span className="text-[10px] bg-[#d9f56a] text-[#173a34] px-1.5 py-0.5 rounded-full font-black">
                    Sua Conta
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("equipe")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  viewMode === "equipe"
                    ? "bg-purple-900 text-white shadow-xs"
                    : "text-[#58716b] hover:text-purple-900 hover:bg-white/50"
                }`}
              >
                <span>👥 Equipe & Estúdio</span>
                {userAccountType === "equipe" && (
                  <span className="text-[10px] bg-purple-200 text-purple-950 px-1.5 py-0.5 rounded-full font-black">
                    Sua Conta
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* VIEW MODE: INDIVIDUAL */}
          {viewMode === "individual" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

                {/* PLANO INDIVIDUAL 1: GRÁTIS */}
                <Card className="rounded-[28px] border-2 border-[#dce5dc] bg-white p-6 shadow-sm flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Degustação Solo
                      </span>
                      {currentPlan === "free" && userAccountType === "individual" && (
                        <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px] font-bold">
                          Seu Plano Atual
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#173a34] mt-4">Grátis Individual</h3>
                    <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                      Perfeito para quem trabalha sozinho e quer testar orçamentos e agendamentos no dia a dia.
                    </p>

                    <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#173a34]">R$ 0</span>
                        <span className="text-xs text-[#71867f] font-semibold">/ sempre</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                        ✓ Sem cartão de crédito
                      </span>
                    </div>

                    {/* ITENS INCLUSOS */}
                    <ul className="space-y-3 text-xs text-[#38584f]">
                      <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>10 orçamentos grátis</strong> todo mês</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Até 20 clientes cadastrados</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Link do cartão digital para WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Chave PIX manual nas propostas</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <span>QR Code PIX automático na tela</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <span>Relatórios financeiros avançados</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button
                      disabled={currentPlan === "free" && userAccountType === "individual"}
                      variant="outline"
                      className="w-full min-h-[48px] py-2.5 px-3 rounded-xl border-[#dce5dc] font-bold text-xs text-[#38584f]"
                    >
                      {currentPlan === "free" && userAccountType === "individual" ? "Plano em Uso" : "Permanecer Grátis"}
                    </Button>
                  </div>
                </Card>

                {/* PLANO INDIVIDUAL 2: PRO INDIVIDUAL VITALÍCIO (DESTAQUE) */}
                <Card className="rounded-[28px] border-2 border-[#173a34] bg-white p-5 sm:p-6 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d9f56a] text-[#173a34] font-black text-[10px] sm:text-[11px] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap z-20 border border-[#b8dc2e]">
                    🔥 Mais Escolhido por Autônomos
                  </div>

                  <div>
                    <div className="flex items-center justify-between mt-5">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                        Acesso Vitalício Solo
                      </span>
                      {currentPlan === "pro" && (
                        <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                          Ativo na sua Conta
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#173a34] mt-4">PRO Individual</h3>
                    <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                      Feito sob medida para o autônomo solo fechar serviços sem limites com visual profissional de ponta.
                    </p>

                    <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-[#173a34]">{PRICE_SOLO}</span>
                        <span className="text-xs text-[#71867f] font-semibold">taxa única</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                        ✓ Paga uma vez, usa para sempre (Sem mensalidades!)
                      </span>
                    </div>

                    {/* ITENS INCLUSOS */}
                    <ul className="space-y-3 text-xs text-[#38584f]">
                      <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Orçamentos ILIMITADOS</strong> no WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Clientes e agenda ILIMITADOS</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>QR Code PIX Automático</strong> na tela de aprovação</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Zero taxas de intermediação (100% seu no PIX)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Painel financeiro com gráficos e extrato</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Sua Marca & Foto em Destaque</strong> nas propostas</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Garantia de 7 dias com devolução total no PIX</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={() => handleOpenCheckout("solo")}
                      className="w-full min-h-[48px] py-2.5 px-2 sm:px-3 rounded-xl bg-[#173a34] hover:bg-[#28564d] font-black text-xs sm:text-sm text-white shadow-lg active:scale-95 transition whitespace-normal text-center flex flex-wrap items-center justify-center gap-1.5 cursor-pointer leading-tight"
                    >
                      <span>Garantir Acesso Vitalício ({PRICE_SOLO})</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Button>
                  </div>
                </Card>

              </div>

              {/* BANNER DE MIGRAÇÃO / EQUIPE */}
              <div className="max-w-4xl mx-auto rounded-2xl border border-purple-200 bg-purple-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-purple-950">Precisa gerenciar sócios, ajudantes ou salão?</h5>
                    <p className="text-xs text-purple-800">
                      Para ter portal individual por colaboradora e cálculo automático de comissões, conheça o <strong>Plano Equipe & Estúdio ({PRICE_TEAM} vitalício)</strong>.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewMode("equipe")}
                  className="border-purple-300 text-purple-900 bg-white hover:bg-purple-100 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Ver Plano Equipe & Estúdio →
                </Button>
              </div>
            </div>
          )}

          {/* VIEW MODE: EQUIPE */}
          {viewMode === "equipe" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

                {/* PLANO EQUIPE 1: GRÁTIS */}
                <Card className="rounded-[28px] border-2 border-[#dce5dc] bg-white p-6 shadow-sm flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                        Degustação Equipe
                      </span>
                      {currentPlan === "free" && userAccountType === "equipe" && (
                        <Badge variant="outline" className="border-purple-600 text-purple-700 bg-purple-50 text-[11px] font-bold">
                          Seu Plano Atual
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#173a34] mt-4">Grátis Equipe</h3>
                    <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                      Teste a gestão de sua equipe com até 2 membros para ver como funciona no seu espaço.
                    </p>

                    <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#173a34]">R$ 0</span>
                        <span className="text-xs text-[#71867f] font-semibold">/ sempre</span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-bold block mt-1">
                        ✓ Sem compromisso
                      </span>
                    </div>

                    {/* ITENS INCLUSOS */}
                    <ul className="space-y-3 text-xs text-[#38584f]">
                      <li className="flex items-start gap-2.5 font-bold text-purple-950">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>10 orçamentos grátis</strong> todo mês</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Até 2 membros na equipe</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Agenda simultânea básica</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <span>Equipe ilimitada</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-400">
                        <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <span>Portal seguro exclusivo no celular delas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button
                      disabled={currentPlan === "free" && userAccountType === "equipe"}
                      variant="outline"
                      className="w-full min-h-[48px] py-2.5 px-3 rounded-xl border-[#dce5dc] font-bold text-xs text-[#38584f]"
                    >
                      {currentPlan === "free" && userAccountType === "equipe" ? "Plano em Uso" : "Permanecer Grátis"}
                    </Button>
                  </div>
                </Card>

                {/* PLANO EQUIPE 2: PRO EQUIPE & ESTÚDIO VITALÍCIO (DESTAQUE) */}
                <Card className="rounded-[28px] border-2 border-purple-500 bg-white p-5 sm:p-6 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-700 text-white font-black text-[10px] sm:text-[11px] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap z-20">
                    👑 Para Salões, Estúdios & Oficinas
                  </div>

                  <div>
                    <div className="flex items-center justify-between mt-5">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                        Acesso Vitalício Equipe
                      </span>
                      {currentPlan === "team" && (
                        <Badge className="bg-purple-600 text-white text-[11px] font-bold">
                          Ativo na sua Conta
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#173a34] mt-4">PRO Equipe & Estúdio</h3>
                    <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                      Para quem tem salão de beleza, barbearia, estética ou oficina com colaboradoras e parceiras.
                    </p>

                    <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-[#173a34]">{PRICE_TEAM}</span>
                        <span className="text-xs text-[#71867f] font-semibold">taxa única</span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-bold block mt-1">
                        ✓ Valor único para todo o seu time (Sem mensalidades!)
                      </span>
                    </div>

                    {/* ITENS INCLUSOS */}
                    <ul className="space-y-3 text-xs text-[#38584f]">
                      <li className="flex items-start gap-2.5 font-bold text-purple-950">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>Tudo do Plano Individual</strong> incluso</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-purple-950">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>Colaboradoras e parceiras ILIMITADAS</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-purple-950">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>Portal Seguro no celular de cada funcionária</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Privacidade total (elas não veem seu lucro geral)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Cálculo automático de comissões e repasses</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>Extrato pronto para WhatsApp da parceira</span>
                      </li>
                      <li className="flex items-start gap-2.5 font-bold text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Garantia de 7 dias com devolução total no PIX</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={() => handleOpenCheckout("team")}
                      className="w-full min-h-[48px] py-2.5 px-2 sm:px-3 rounded-xl bg-purple-700 hover:bg-purple-800 font-black text-xs sm:text-sm text-white shadow-lg active:scale-95 transition whitespace-normal text-center flex flex-wrap items-center justify-center gap-1.5 cursor-pointer leading-tight"
                    >
                      <span>Desbloquear Modo Equipe ({PRICE_TEAM})</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Button>
                  </div>
                </Card>

              </div>

              {/* BANNER DE VOLTAR PARA INDIVIDUAL */}
              <div className="max-w-4xl mx-auto rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#173a34] text-[#d9f56a] flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#173a34]">Trabalha 100% sozinho sem sócios nem ajudantes?</h5>
                    <p className="text-xs text-[#58716b]">
                      Você pode economizar e assinar o <strong>Plano PRO Individual por apenas {PRICE_SOLO} vitalício</strong> sem excesso de telas de equipe.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewMode("individual")}
                  className="border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-100 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Ver Plano Individual →
                </Button>
              </div>
            </div>
          )}

          {/* BANNER DE GARANTIA INCONDICIONAL DE 7 DIAS (CDC) */}
          <div className="rounded-[28px] border border-[#d2e4c4] bg-gradient-to-r from-[#f6fbf2] via-white to-[#f0f8ed] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#173a34] text-[#d9f56a] flex items-center justify-center text-3xl font-black shrink-0 shadow-md">
              🛡️
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mb-2">
                Proteção Total ao Consumidor (Artigo 49 do CDC)
              </div>
              <h3 className="text-xl font-bold text-[#173a34]">
                Garantia Incondicional de 7 Dias com Devolução Total
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5a726a] leading-relaxed">
                Adquira seu plano com risco zero. Se por qualquer motivo você achar que o sistema não facilitou o seu dia a dia, basta solicitar o reembolso em até 7 dias da compra. O valor é devolvido 100% integral via PIX pelo Asaas, sem perguntas nem letras miúdas.
              </p>
            </div>
          </div>

          {/* PERGUNTAS FREQUENTES */}
          <div className="bg-white rounded-[28px] border border-[#dce5dc] p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-[#173a34] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#8aa500]" />
              Dúvidas Frequentes sobre os Planos
            </h3>

            <div className="grid gap-4 md:grid-cols-2 text-xs sm:text-sm text-[#526d64]">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Existe alguma mensalidade escondida?</h4>
                <p>Não! Ao adquirir o PRO Solo ou PRO Equipe, você paga uma taxa única no PIX e o acesso é vitalício para a sua conta.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Como funciona o limite de 10 orçamentos do plano grátis?</h4>
                <p>Todo mês você tem direito a gerar até 10 propostas completas no WhatsApp. O contador é zerado no dia 1º de cada mês.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Como as minhas colaboradoras acessam no salão?</h4>
                <p>Você cadastra a parceira e o sistema gera um link individual para ela. Ela abre no próprio celular e só vê a agenda dela.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">A plataforma cobra porcentagem sobre o que eu ganho?</h4>
                <p>Nunca! 0% de comissão. Todo o dinheiro pago pelos seus clientes via PIX cai direto no seu banco pessoal.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE CHECKOUT PIX (ASAAS REAL) */}
      <Dialog open={pixModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[28px] max-w-md p-6 bg-white border border-[#dce5dc]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#173a34] flex items-center gap-2">
              <span>💳 Ativação Instantânea via PIX</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#71867f]">
              {selectedPlan === "solo"
                ? "Plano PRO Solo Vitalício — Acesso Ilimitado sem Mensalidades"
                : "Plano PRO Estúdio & Equipe — Acesso Ilimitado para todo o seu Time"}
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-black animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-[#173a34]">Parabéns! Seu Plano foi Ativado!</h4>
              <p className="text-xs text-[#526d64]">
                O Webhook do Asaas confirmou o recebimento do PIX. Todos os recursos ilimitados já estão liberados na sua conta!
              </p>
              <Button
                onClick={handleCloseModal}
                className="w-full mt-4 h-11 rounded-xl bg-[#173a34] text-white font-bold"
              >
                Voltar e Aproveitar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center bg-[#f5f8f2] p-3.5 rounded-2xl border border-[#dce5dc]">
                <div>
                  <span className="text-[11px] font-bold text-[#71867f] uppercase block">Valor a Pagar</span>
                  <span className="text-2xl font-black text-[#173a34]">
                    {selectedPlan === "solo" ? PRICE_SOLO : PRICE_TEAM}
                  </span>
                </div>
                <Badge className="bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                  PIX Asaas Oficial
                </Badge>
              </div>

              {/* QR CODE PIX REAL DO ASAAS */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl text-center space-y-3 shadow-inner">
                <div className="w-44 h-44 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow">
                  {pixLoading && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-[#d9f56a] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-500 font-bold">Carregando PIX...</span>
                    </div>
                  )}
                  {!pixLoading && pixError && (
                    <div className="text-center p-2">
                      <span className="text-red-500 text-xs font-bold block">⚠️ Erro</span>
                      <span className="text-slate-500 text-[10px] block mt-1">{pixError}</span>
                    </div>
                  )}
                  {!pixLoading && pixData?.encodedImage && (
                    <img
                      src={`data:image/png;base64,${pixData.encodedImage}`}
                      alt="QR Code PIX Asaas"
                      className="w-40 h-40 object-contain"
                    />
                  )}
                </div>
                <div className="text-xs font-bold text-[#d9f56a]">
                  {pixLoading
                    ? "Aguarde, carregando seu QR Code..."
                    : "Abra o aplicativo do seu banco e aponte a câmera"}
                </div>
                <p className="text-[11px] text-white/70">
                  Liberação 100% automática em segundos via Webhook Asaas.
                </p>
              </div>

              {/* BOTÃO COPIAR PIX COPIA E COLA */}
              <Button
                onClick={handleCopyPix}
                disabled={!pixData?.payload || pixLoading}
                variant="outline"
                className="w-full h-11 rounded-xl border-[#dce5dc] font-bold text-xs text-[#173a34] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Copy className="w-4 h-4 text-emerald-700" />
                <span>Copiar Código PIX Copia e Cola</span>
              </Button>



              {/* BOTÃO DE SIMULAÇÃO DE WEBHOOK (APENAS ADMIN) */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    onClick={handleSimulateWebhookSuccess}
                    disabled={simulatingPayment}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-[#d9f56a]" />
                    <span>{simulatingPayment ? "Processando..." : "Admin: Simular Pagamento"}</span>
                  </Button>
                  <span className="text-[10px] text-slate-400 text-center block mt-1">
                    (Visível apenas para administradores)
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <VoucherRedeemModal open={voucherModalOpen} onOpenChange={setVoucherModalOpen} />
    </DashboardLayout>
  );
}
