import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Megaphone,
  MessageSquare,
  Video,
  Building2,
  Target,
  Clock,
  Smartphone,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
  Ticket,
  Crown,
  Plus,
  ExternalLink,
  Globe,
  BookOpen,
  Gift,
  ArrowUpRight,
  QrCode,
  Receipt,
  Banknote,
  Info,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { COOKIE_NAME } from "@shared/const";

import { SimulatorTour } from "@/components/SimulatorTour";

// Gerador Oficial de Payload PIX Padrão BACEN / EMV BRCode (compatível com todos os bancos)
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

function generatePixBRCode(key: string, name: string, city: string, amount: number, txid = "***"): string {
  let cleanKey = key.trim();
  const digitsOnly = cleanKey.replace(/\D/g, "");
  // Padrão BACEN: Telefone celular no EMV precisa iniciar com +55 (código internacional do Brasil)
  if (!cleanKey.includes("@") && (digitsOnly.length === 10 || digitsOnly.length === 11)) {
    cleanKey = `+55${digitsOnly}`;
  } else if (!cleanKey.includes("@") && (digitsOnly.length === 14 || digitsOnly.length === 11)) {
    cleanKey = digitsOnly;
  }

  const cleanName = (name || "PRESTADOR MEUAUTONOMO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 25)
    .toUpperCase() || "PRESTADOR";

  const cleanCity = (city || "SAO PAULO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 15)
    .toUpperCase() || "SAO PAULO";

  const formattedAmount = amount > 0 ? amount.toFixed(2) : "";

  // 26: Merchant Account Information
  const merchantInfo = formatEMV("00", "br.gov.bcb.pix") + formatEMV("01", cleanKey);
  const cleanTxId = (txid || "***").replace(/[^a-zA-Z0-9*]/g, "").slice(0, 25) || "***";
  const additionalData = formatEMV("05", cleanTxId);

  let payload =
    formatEMV("00", "01") +
    formatEMV("26", merchantInfo) +
    formatEMV("52", "0000") +
    formatEMV("53", "986") +
    (formattedAmount ? formatEMV("54", formattedAmount) : "") +
    formatEMV("58", "BR") +
    formatEMV("59", cleanName) +
    formatEMV("60", cleanCity) +
    formatEMV("62", additionalData) +
    "6304";

  payload += crc16(payload);
  return payload;
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "vouchers" | "marketing" | "simulator" | "screens" | "homologacao" | "transacoes">("homologacao");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Estados do Simulador de Transações & PIX Direto
  const [testPixKey, setTestPixKey] = useState("contato@autonomo.com.br");
  const [testPixType, setTestPixType] = useState<"telefone" | "cpf" | "cnpj" | "email" | "aleatoria">("email");
  const [testProName, setTestProName] = useState("João Eletricista Silva");
  const [testClientName, setTestClientName] = useState("Dona Maria Silva");
  const [testServiceDesc, setTestServiceDesc] = useState("Troca de Disjuntor Geral e Fiação do Chuveiro");
  const [testAmount, setTestAmount] = useState("350,00");
  const [testPaymentMethod, setTestPaymentMethod] = useState<"pix" | "cartao" | "dinheiro">("pix");
  const [testPaymentCondition, setTestPaymentCondition] = useState<"integral" | "sinal">("sinal");
  const [testDepositPercent, setTestDepositPercent] = useState(50);
  const [testCopiedPix, setTestCopiedPix] = useState(false);
  const [testCopiedBRCode, setTestCopiedBRCode] = useState(false);
  const [testCopiedRawKey, setTestCopiedRawKey] = useState(false);
  const [isTestConfirmedReceived, setIsTestConfirmedReceived] = useState(false);
  const [testReceiptCopied, setTestReceiptCopied] = useState(false);

  // Voucher form states
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherDescInput, setVoucherDescInput] = useState("");
  const [voucherDaysInput, setVoucherDaysInput] = useState(20);
  const [voucherPlanInput, setVoucherPlanInput] = useState<"pro" | "team">("pro");
  const [voucherIsVipInput, setVoucherIsVipInput] = useState(false);
  const [voucherMaxUsesInput, setVoucherMaxUsesInput] = useState(1);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  // WhatsApp Voucher Share Modal states
  const [whatsAppModalVoucher, setWhatsAppModalVoucher] = useState<any | null>(null);
  const [whatsAppRecipientPhone, setWhatsAppRecipientPhone] = useState("");
  const [whatsAppDomain, setWhatsAppDomain] = useState("https://meuautonomo.vercel.app");
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState(false);

  // Gerador de Mensagens de Boas-Vindas para Prospects (VIP 20 Dias)
  const [prospectModule, setProspectModule] = useState<"individual" | "equipe">("individual");
  const [prospectName, setProspectName] = useState("");
  const [prospectPhone, setProspectPhone] = useState("");
  const [prospectVoucher, setProspectVoucher] = useState("VIP20DIAS");
  const [prospectDomain, setProspectDomain] = useState("https://meuautonomo.vercel.app");
  const [copiedProspectMsg, setCopiedProspectMsg] = useState(false);

  const getProspectWelcomeMessage = () => {
    const nome = prospectName.trim() ? `Olá *${prospectName.trim()}*!` : "Olá! Tudo bem?";

    if (prospectModule === "equipe") {
      return (
        `${nome} 🚀\n\n` +
        `Conforme conversamos, estou liberando para você um *Acesso VIP de 20 Dias* no *MeuAutônomo* com o *Módulo Equipe & Estúdio* 100% liberado!\n\n` +
        `O MeuAutônomo foi feito sob medida para salões, estúdios, barbearias e clínicas gerenciarem o dia a dia sem burocracia:\n` +
        `👥 *Múltiplos Profissionais:* Cadastre parceiros com comissões personalizadas (em conformidade com a Lei 13.352);\n` +
        `📅 *Agenda Concorrente:* Atendimentos simultâneos no mesmo horário sem conflito;\n` +
        `💰 *Fechamento Automático:* O sistema apura na hora a retenção da casa, repasses e lucro líquido;\n` +
        `📱 *Extrato WhatsApp:* Envie o demonstrativo com a chave PIX de cada parceiro com 1 clique.\n\n` +
        `🎁 *Seu Convite VIP de Cortesia:*\n` +
        `• Cupom VIP: *${prospectVoucher || "EQUIPE20"}*\n` +
        `• Benefício: *20 Dias Grátis do Módulo Equipe Completo*\n\n` +
        `👉 *Como ativar seu acesso em 30 segundos:*\n` +
        `1. Acesse o link oficial: ${prospectDomain}\n` +
        `2. Crie sua conta rápida ou faça login;\n` +
        `3. No menu *Equipe* ou *Meu Plano*, clique em *Resgatar Cupom* e digite: *${prospectVoucher || "EQUIPE20"}*.\n\n` +
        `Fique à vontade para testar com sua equipe e me avisar o que achou! Qualquer dúvida, estou por aqui! ✨`
      );
    }

    return (
      `${nome} 🚀\n\n` +
      `Conforme conversamos, estou liberando para você um *Acesso VIP de 20 Dias* no *MeuAutônomo* com todas as funções profissionais liberadas!\n\n` +
      `A plataforma foi criada para o profissional autônomo economizar tempo, fechar mais serviços e ter total controle:\n` +
      `📄 *Orçamentos no WhatsApp:* Monte propostas com fotos, cálculo automático de desconto e link público para o cliente aprovar em 1 toque;\n` +
      `💳 *PIX Direto e Sem Taxas:* Receba seus pagamentos 100% direto na sua conta, sem intermediação nem retenção de saldo;\n` +
      `🧾 *Recibo Formal Digital:* Emita comprovantes de quitação com chave de autenticidade (Lei 14.063/2020) prontos para enviar no WhatsApp;\n` +
      `📅 *Agenda e Clientes:* Histórico completo de serviços e controle financeiro simplificado.\n\n` +
      `🎁 *Seu Convite VIP de Cortesia:*\n` +
      `• Cupom VIP: *${prospectVoucher || "VIP20DIAS"}*\n` +
      `• Benefício: *20 Dias de Plano PRO Grátis (Todas as Funções Liberadas)*\n\n` +
      `👉 *Como ativar seu acesso em 30 segundos:*\n` +
      `1. Acesse o link oficial: ${prospectDomain}\n` +
      `2. Crie sua conta rápida (leva menos de 1 minuto);\n` +
      `3. No menu *Meu Plano* ou no perfil, clique em *Resgatar Cupom* e digite: *${prospectVoucher || "VIP20DIAS"}*.\n\n` +
      `Pronto! Aproveite esses 20 dias para turbinar seus orçamentos e atendimentos. Qualquer dúvida, estou à disposição! 💼✨`
    );
  };

  const getVoucherWhatsAppMessage = (voucher: any, domain: string) => {
    if (!voucher) return "";
    const benefit = voucher.isVipTotal
      ? "Acesso VIP Vitalício Ilimitado"
      : `${voucher.days || 20} dias de Plano ${(voucher.plan || "pro").toUpperCase()} Grátis (Todas as Funcionalidades Liberadas)`;

    return `Olá! Tudo bem? 🚀\n\nEstou liberando um acesso VIP de cortesia para você experimentar o *MeuAutônomo* — a plataforma feita para profissionais autônomos e prestadores de serviços organizarem orçamentos profissionais com 1 clique, agenda inteligente e controle financeiro direto no WhatsApp.\n\n🎁 *Seu Voucher com Acesso Total Liberado:*\n• Código do Voucher: *${voucher.code}*\n• Benefício: *${benefit}*\n\n👉 *Como começar em menos de 1 minuto:*\n1. Acesse o link: ${domain}\n2. Faça seu cadastro rápido (leva 30 segundos)\n3. No menu *Meu Plano* (ou no perfil), digite o código *${voucher.code}*\n\nPronto! Todas as funções profissionais estarão liberadas para você impressionar seus clientes e fechar mais serviços com total credibilidade. Se tiver qualquer dúvida, estou por aqui! 💼✨`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedScript(id);
    toast.success("Roteiro copiado para a área de transferência!");
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const copyVoucherToClipboard = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedVoucher(code);
    toast.success(`Código ${code} copiado para envio!`);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery();
  const metricsQuery = trpc.admin.getMetrics.useQuery(undefined, {
    enabled: meQuery.data?.role === "admin",
    retry: false,
  });
  const usersQuery = trpc.admin.listUsers.useQuery(undefined, {
    enabled: meQuery.data?.role === "admin",
    retry: false,
  });
  const vouchersQuery = trpc.admin.listVouchers.useQuery(undefined, {
    enabled: meQuery.data?.role === "admin",
    retry: false,
  });

  const createVoucherMutation = trpc.admin.createVoucher.useMutation({
    onSuccess: (data) => {
      toast.success(`🎉 Cupom ${data.code} criado com sucesso!`);
      setVoucherCodeInput("");
      setVoucherDescInput("");
      vouchersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar voucher.");
    },
  });

  const toggleVoucherMutation = trpc.admin.toggleVoucher.useMutation({
    onSuccess: () => {
      toast.success("Status do voucher atualizado!");
      vouchersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar voucher.");
    },
  });

  const deleteVoucherMutation = trpc.admin.deleteVoucher.useMutation({
    onSuccess: () => {
      toast.success("Voucher removido com sucesso!");
      vouchersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao excluir voucher.");
    },
  });

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: async (data) => {
      if (data.sessionToken) {
        try {
          localStorage.setItem("manus-token", data.sessionToken);
          sessionStorage.setItem("manus-token", data.sessionToken);
        } catch (e) {
          console.error("Storage error:", e);
        }
      }
      toast.success("Autenticado como administrador com sucesso!");
      utils.auth.me.setData(undefined, {
        id: 0,
        openId: "admin_master",
        name: "Administrador do Sistema",
        email: data.email || "admin@meuautonomo.com.br",
        role: "admin",
        loginMethod: "admin-panel",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      } as any);
      await utils.auth.me.invalidate();
      await meQuery.refetch();
      await metricsQuery.refetch();
      await usersQuery.refetch();
      await vouchersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Credenciais incorretas.");
    },
  });

  const resetMutation = trpc.admin.resetDatabase.useMutation({
    onSuccess: () => {
      toast.success("Banco de dados reiniciado com sucesso! Todos os dados de teste foram limpos.");
      setShowResetModal(false);
      setResetConfirmInput("");
      metricsQuery.refetch();
      usersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao zerar o banco.");
    },
  });

  const toggleDemoMutation = trpc.admin.setDemoMode.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.demoMode
          ? "Modo Demonstração ATIVADO (contas de teste visíveis no login)."
          : "Modo Demonstração DESATIVADO (sistema blindado para produção)."
      );
      metricsQuery.refetch();
    },
  });

  const cleanGhostMutation = trpc.admin.cleanGhostSessions.useMutation({
    onSuccess: (data) => {
      toast.success(`Higienização concluída! ${data.deletedGhostCount} sessões antigas e ${data.deletedAdminDuplicates} duplicatas removidas.`);
      metricsQuery.refetch();
      usersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao higienizar sessões.");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      try {
        localStorage.removeItem("manus-token");
        sessionStorage.removeItem("manus-token");
        sessionStorage.removeItem("manus-cookie");
        localStorage.removeItem("manus-runtime-user-info");
        document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = "manus-auth-session-token=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch (e) {}
      toast.info("Sessão administrativa encerrada.");
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      await meQuery.refetch();
    },
  });

  if (meQuery.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7f1]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#173a34] border-t-transparent" />
          <p className="text-sm font-medium text-[#71867f]">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }

  const isAdmin = meQuery.data?.role === "admin";

  const money = (cents = 0) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // TELA DE LOGIN ADMINISTRATIVO
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f1] p-4 sm:p-6">
        <Card className="w-full max-w-md rounded-[28px] border-0 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(19,42,39,0.08)]">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#173a34]">Painel Administrativo</h1>
            <p className="mt-1 text-xs text-[#71867f]">
              Área restrita para controle de testes e gestão do MeuAutônomo
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate({ email, password });
            }}
            className="space-y-4"
            autoComplete="off"
          >
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-[#38584f]">
                Usuário ou E-mail do Administrador
              </Label>
              <Input
                type="text"
                placeholder="Digite seu usuário ou e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-[#38584f]">
                Senha de Acesso
              </Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="h-11 w-full rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] font-bold text-sm cursor-pointer mt-2"
            >
              {loginMutation.isPending ? "Validando credenciais..." : "Entrar no Painel Admin"}
            </Button>

            <div className="pt-2 text-center">
              <Link href="/app" className="inline-flex items-center text-xs font-semibold text-[#71867f] hover:text-[#173a34]">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Voltar para o aplicativo
              </Link>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const metrics = metricsQuery.data;

  // Cálculo e Geração do Payload Oficial PIX (Padrão BACEN / BRCode)
  const numTestAmount = parseFloat(testAmount.replace(/\./g, "").replace(",", ".")) || 0;
  const calculatedPixAmount = testPaymentCondition === "sinal" ? numTestAmount * 0.5 : numTestAmount;
  const brCodePayload = generatePixBRCode(
    testPixKey,
    testProName,
    "SAO PAULO",
    calculatedPixAmount
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(brCodePayload)}`;

  // PAINEL ADMINISTRATIVO AUTENTICADO
  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      {/* HEADER DO ADMIN */}
      <header className="border-b border-[#dce5dc] bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/app">
              <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto object-contain cursor-pointer" />
            </Link>
            <span className="rounded-full bg-[#173a34] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#d9f56a]">
              Admin Master
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/planos"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d9f56a] bg-[#f7fbe8] hover:bg-[#edf7d7] text-xs font-bold text-[#173a34] transition shadow-2xs"
              title="Abrir página de Planos e Checkout PIX em nova aba"
            >
              <CreditCard className="h-3.5 w-3.5 text-[#8aa500]" />
              <span>Ver Planos</span>
              <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
            </a>
            <a
              href="/app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-xs font-semibold text-[#173a34] transition shadow-2xs"
              title="Abrir área de trabalho do autônomo em nova aba"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-[#2d7d54]" />
              <span>Meu Espaço</span>
              <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
            </a>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              className="h-9 rounded-xl text-xs text-rose-600 hover:bg-rose-50"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* TÍTULO E NAVEGAÇÃO DE ABAS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#173a34]">
              Painel de Controle e Gestão
            </h1>
            <p className="mt-1 text-sm text-[#71867f]">
              Monitore métricas de teste, zere dados quando necessário, gerencie cupons e acesse qualquer tela da plataforma.
            </p>
          </div>

          {/* TOGGLE MODO DEMO */}
          {metrics && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#dce5dc] bg-white p-3 shadow-xs">
              <div className="text-left">
                <span className="block text-xs font-bold text-[#173a34]">
                  Modo Demonstração / Testes
                </span>
                <span className="text-[11px] text-[#71867f]">
                  {metrics.demoMode ? "Ativo (contas de teste visíveis)" : "Desativado (blindado para produção)"}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleDemoMutation.mutate({ enabled: !metrics.demoMode })}
                disabled={toggleDemoMutation.isPending}
                className={
                  metrics.demoMode
                    ? "rounded-xl border-[#d9f56a] bg-[#f4fadc] text-[#556b10]"
                    : "rounded-xl border-[#dce5dc] text-[#71867f]"
                }
              >
                {metrics.demoMode ? (
                  <>
                    <ToggleRight className="mr-1 h-4 w-4 text-[#8aa500]" /> Ativo
                  </>
                ) : (
                  <>
                    <ToggleLeft className="mr-1 h-4 w-4" /> Inativo
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* BANNER DE ACESSO RÁPIDO A TODAS AS JANELAS */}
        <div className="rounded-2xl border border-[#dce5dc] bg-white p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-[#173a34] block">
                  Central de Acesso Rápido às Janelas do Aplicativo
                </span>
                <span className="text-[11px] text-[#71867f]">
                  Clique para abrir qualquer parte do sistema diretamente em uma nova aba:
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <a
                href="/planos"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#d9f56a] bg-[#f7fbe8] hover:bg-[#edf7d7] text-[#173a34] transition shadow-2xs"
              >
                <CreditCard className="h-3.5 w-3.5 text-[#8aa500]" />
                <span>Planos & PIX</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Meu Espaço</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/agenda"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <Calendar className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Agenda</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/orcamentos"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Orçamentos</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/financeiro"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <DollarSign className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Financeiro</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/cartao"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <Smartphone className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Cartão Digital</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/demo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <Video className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Vídeo Demo</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7f0] text-[#173a34] transition shadow-2xs"
              >
                <Globe className="h-3.5 w-3.5 text-[#2d7d54]" />
                <span>Página Inicial</span>
                <ArrowUpRight className="h-3 w-3 text-[#71867f]" />
              </a>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="flex flex-wrap border-b border-[#dce5dc] gap-2 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("homologacao")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] cursor-pointer ${
              activeTab === "homologacao"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Status de Homologação</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              Aprovado
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("screens")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] cursor-pointer ${
              activeTab === "screens"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Globe className="h-4 w-4 text-[#8aa500]" />
            <span>Janelas & Telas do Sistema</span>
            <span className="rounded-full bg-[#173a34] px-2 py-0.5 text-[10px] font-bold text-[#d9f56a]">
              Todas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "simulator"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#8aa500]" />
            <span>Simulador Visual dos Fluxos</span>
            <span className="rounded-full bg-[#d9f56a] px-2 py-0.5 text-[10px] font-bold text-[#173a34]">
              Interativo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "overview"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Visão Geral & Métricas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vouchers")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "vouchers"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Ticket className="h-4 w-4 text-[#8aa500]" />
            <span>Cupons & Vouchers</span>
            <span className="rounded-full bg-[#173a34] px-2 py-0.5 text-[10px] font-bold text-[#d9f56a]">
              Novo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marketing")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "marketing"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Megaphone className="h-4 w-4 text-[#8aa500]" />
            <span>Plano de Vendas</span>
            <span className="rounded-full bg-[#eef5d2] px-2 py-0.5 text-[10px] font-bold text-[#556b10]">
              Estratégia
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transacoes")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] cursor-pointer ${
              activeTab === "transacoes"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Banknote className="h-4 w-4 text-emerald-600" />
            <span>Simulador de Pagamento & PIX</span>
            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-black uppercase">
              Passo a Passo
            </span>
          </button>

          <Link href="/demo">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#173a34] hover:bg-[#d9f56a]/30 rounded-t-2xl transition border-b-2 border-transparent -mb-[2px]"
            >
              <Video className="h-4 w-4 text-emerald-700" />
              <span>Vídeo / Reels de Vantagens</span>
              <span className="rounded-full bg-[#173a34] px-2 py-0.5 text-[10px] font-bold text-[#d9f56a]">
                Novo
              </span>
            </button>
          </Link>
        </div>

        {/* CONTEÚDO DA ABA: STATUS DE HOMOLOGAÇÃO */}
        {activeTab === "homologacao" && (
          <div className="space-y-8">
            {/* CARD PRINCIPAL DE STATUS */}
            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#173a34] via-[#1b433c] to-[#0f2824] p-7 text-white shadow-xl">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#d9f56a]/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f56a] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#173a34]">
                      <ShieldCheck className="h-4 w-4" />
                      Aprovado para Lançamento Controlado
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-xs">
                      <Calendar className="h-3.5 w-3.5 text-[#d9f56a]" />
                      Data da Homologação: 29/09/2026
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Certificado de Homologação & QA Operacional
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/80">
                    O sistema MeuAutônomo foi submetido a auditoria ponta a ponta em ambiente de produção com dados sintéticos. Todas as rotinas de cálculo financeiro, integridade de sessões, resgate de cupons e controle de permissões foram validadas e aprovadas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-center">
                    <p className="text-[11px] font-semibold text-white/70 uppercase">Ambiente Avaliado</p>
                    <p className="text-sm font-bold text-[#d9f56a] mt-0.5">Produção Publicada</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 text-center">
                    <p className="text-[11px] font-semibold text-white/70 uppercase">Taxa de Conformidade</p>
                    <p className="text-sm font-bold text-white mt-0.5">14 de 14 Fluxos (100%)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MATRIZ FINANCEIRA DE REFERÊNCIA & VOUCHER SINTÉTICO */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Card Financeiro */}
              <Card className="rounded-[22px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)] lg:col-span-2">
                <div className="flex items-center justify-between pb-4 border-b border-[#eef2f0]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#173a34]">Matriz Financeira de Referência (QA)</h3>
                      <p className="text-xs text-[#71867f]">Valores exatos apurados no teste comissionado de atendimento</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Cálculo 100% Exato
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-[#71867f] uppercase">Faturamento Bruto</p>
                    <p className="text-xl font-black text-[#173a34] mt-1">R$ 180,00</p>
                    <span className="text-[11px] font-medium text-emerald-600 mt-1 inline-block">100% Recebido</span>
                  </div>

                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-[#71867f] uppercase">Comissão Profissional</p>
                    <p className="text-xl font-black text-[#819815] mt-1">R$ 81,00</p>
                    <span className="text-[11px] font-medium text-[#71867f] mt-1 inline-block">45% (Camila QA)</span>
                  </div>

                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-[#71867f] uppercase">Retenção Estúdio</p>
                    <p className="text-xl font-black text-[#173a34] mt-1">R$ 99,00</p>
                    <span className="text-[11px] font-medium text-[#71867f] mt-1 inline-block">55% Margem Líquida</span>
                  </div>

                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-[#71867f] uppercase">Atendimentos</p>
                    <p className="text-xl font-black text-[#173a34] mt-1">1 Realizado</p>
                    <span className="text-[11px] font-medium text-[#71867f] mt-1 inline-block">Serviço concluído</span>
                  </div>

                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-[#71867f] uppercase">Inadimplência / Pendente</p>
                    <p className="text-xl font-black text-[#173a34] mt-1">R$ 0,00</p>
                    <span className="text-[11px] font-medium text-emerald-600 mt-1 inline-block">Sem pendências</span>
                  </div>

                  <div className="rounded-2xl bg-[#fafbf9] border border-[#eef2f0] p-4">
                    <p className="text-xs font-semibold text-emerald-600 mt-1">R$ 0,00</p>
                    <span className="text-[11px] font-medium text-emerald-600 mt-1 inline-block">Zero divergência</span>
                  </div>
                </div>
              </Card>

              {/* Card Voucher Sintético */}
              <Card className="rounded-[22px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between pb-4 border-b border-[#eef2f0]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e1effa] text-[#23638e]">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#173a34]">Cupom Homologado</h3>
                      <p className="text-xs text-[#71867f]">Voucher de teste sintético</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                    Auditado
                  </Badge>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="rounded-xl bg-[#f5f8f7] p-3.5 border border-[#e6eee9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#71867f]">Código do Cupom</span>
                    <p className="text-base font-black text-[#173a34] tracking-wide mt-0.5">QA-ADMIN-20260929</p>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#eef2f0]">
                    <span className="text-[#71867f]">Benefício Aplicado:</span>
                    <span className="font-bold text-[#173a34]">7 Dias PRO Cortesia</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#eef2f0]">
                    <span className="text-[#71867f]">Capacidade de Usos:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">1 / 1 (Esgotado)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-[#eef2f0]">
                    <span className="text-[#71867f]">Tentativa Reincidente:</span>
                    <span className="font-bold text-emerald-700">Bloqueio 409 (Validado)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[#71867f]">Esgotamento Global:</span>
                    <span className="font-bold text-emerald-700">Bloqueio 400 (Validado)</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* TABELA DE FLUXOS FUNCIONAIS HOMOLOGADOS */}
            <Card className="rounded-[22px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eef2f0] gap-2">
                <div>
                  <h3 className="font-black text-lg text-[#173a34]">Matriz de Fluxos Funcionais Validados</h3>
                  <p className="text-xs text-[#71867f]">Verificação completa de ponta a ponta executada antes da liberação</p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  14 de 14 Aprovados
                </span>
              </div>

              <div className="mt-5 divide-y divide-[#f0f4f2]">
                {[
                  {
                    id: 1,
                    modulo: "Autenticação Admin",
                    descricao: "Login seguro de administrador com geração de token bearer e validação de credenciais",
                    status: "Aprovado",
                  },
                  {
                    id: 2,
                    modulo: "Persistência e Logout",
                    descricao: "Persistência da sessão através de cookies seguros / localStorage e encerramento limpo",
                    status: "Aprovado",
                  },
                  {
                    id: 3,
                    modulo: "Anti-Inflação de Usuários",
                    descricao: "Eliminação da duplicação de sessões no banco ao navegar ou recarregar rotas públicas",
                    status: "Aprovado",
                  },
                  {
                    id: 4,
                    modulo: "Higienização de Sessões",
                    descricao: "Exclusão segura de 116 sessões órfãs e 31 duplicatas com preservação total de dados reais",
                    status: "Aprovado",
                  },
                  {
                    id: 5,
                    modulo: "Agenda e Agendamentos",
                    descricao: "Criação, listagem, visualização de detalhes e atualização de status de atendimentos",
                    status: "Aprovado",
                  },
                  {
                    id: 6,
                    modulo: "Gestão de Clientes e Serviços",
                    descricao: "Cadastro de clientes, serviços com preços, durações e vinculação profissional",
                    status: "Aprovado",
                  },
                  {
                    id: 7,
                    modulo: "Painel Financeiro",
                    descricao: "Lançamento de receitas e despesas, cálculo de fluxo de caixa e status de recebimento",
                    status: "Aprovado",
                  },
                  {
                    id: 8,
                    modulo: "Cálculo de Comissões (45%)",
                    descricao: "Divisão exata do repasse de R$ 81,00 para a profissional Camila sem arredondamentos errados",
                    status: "Aprovado",
                  },
                  {
                    id: 9,
                    modulo: "Retenção do Estúdio (55%)",
                    descricao: "Retenção líquida correta de R$ 99,00 sobre o faturamento de R$ 180,00 sem duplicidade",
                    status: "Aprovado",
                  },
                  {
                    id: 10,
                    modulo: "Módulo Equipe & Colaboradores",
                    descricao: "Gestão de membros da equipe, cálculo de repasses individuais e relatórios de produtividade",
                    status: "Aprovado",
                  },
                  {
                    id: 11,
                    modulo: "Emissão de Orçamentos",
                    descricao: "Geração de propostas comerciais com envio e compartilhamento por link / WhatsApp",
                    status: "Aprovado",
                  },
                  {
                    id: 12,
                    modulo: "Criação de Vouchers no Painel",
                    descricao: "Interface administrativa para emissão de códigos promocionais com limite de uso e validade",
                    status: "Aprovado",
                  },
                  {
                    id: 13,
                    modulo: "Resgate de Voucher pelo App",
                    descricao: "Aplicação imediata de benefício PRO na conta do usuário com feedback visual e ativação",
                    status: "Aprovado",
                  },
                  {
                    id: 14,
                    modulo: "Auditoria e Travas de Cupom",
                    descricao: "Histórico de resgates persistido, bloqueio contra reutilização e esgotamento de cota",
                    status: "Aprovado",
                  },
                ].map((item) => (
                  <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eef5d2] text-[#556b10] text-xs font-bold shrink-0">
                        {item.id}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#173a34]">{item.modulo}</p>
                        <p className="text-xs text-[#71867f]">{item.descricao}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* DIRETRIZES OPERACIONAIS DE LANÇAMENTO */}
            <div className="rounded-[22px] border border-amber-200 bg-amber-50/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#173a34]">Diretrizes e Recomendações Operacionais</h4>
                  <p className="text-xs text-amber-900/80">Normas para o período de lançamento e ativação dos primeiros clientes</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs text-[#173a34]">
                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Lançamento Controlado</span>
                    Acompanhar o cadastro dos primeiros profissionais reais em lotes pequenos antes de campanhas de tráfego massivo.
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Proteção dos Dados Reais</span>
                    Não utilizar o botão "Zerar dados de teste" em produção, pois ele apaga todos os registros operacionais cadastrados.
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Higienização Controlada</span>
                    As sessões fantasma foram eliminadas em definitivo. Caso necessário, o script de limpeza segura permanece disponível.
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Segurança da Senha Master</span>
                    Recomenda-se atualizar a senha do administrador antes da abertura ao público geral para garantir sigilo das métricas.
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Cupons & Vouchers Ativos</span>
                    Configurar novos vouchers com datas de expiração e limites compatíveis com as campanhas de marketing planejadas.
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Disparos e Notificações</span>
                    Testes foram mantidos sem disparos para números reais de terceiros, garantindo total integridade e privacidade.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 1: VISÃO GERAL & TESTES */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* MÉTRICAS GERAIS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Profissionais</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.profilesCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.usersCount} profissionais ativos` : "Carregando..."}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Clientes Cadastrados</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1effa] text-[#23638e]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.clientsCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  Clientes na base dos prestadores
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Orçamentos</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1effa] text-[#23638e]">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.quotesCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.acceptedQuotesCount} propostas aceitas` : "Carregando..."}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Total Orçado</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e3f5e3] text-[#2c7a45]">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? money(metrics.totalQuotedCents) : "..."}
                </div>
                <p className="mt-1 text-xs text-[#2c7a45] font-semibold">
                  {metrics ? `${money(metrics.acceptedQuotedCents)} em propostas aprovadas` : ""}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Atendimentos</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4d7] text-[#906815]">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.appointmentsCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.servicesCount} serviços cadastrados` : ""}
                </p>
              </Card>
            </div>

            {/* ÁREA CRÍTICA: ZERAR DADOS PARA NOVOS TESTES */}
            <Card className="rounded-[24px] border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-950">
                      Zerar e Reiniciar Banco de Testes
                    </h3>
                    <p className="mt-1 max-w-xl text-xs sm:text-sm text-rose-800/80 leading-relaxed">
                      Apaga todos os clientes, propostas, atendimentos, serviços criados e despesas registradas durante seus testes, restaurando o sistema para um estado limpo de primeiro uso.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="shrink-0 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Zerar dados de teste
                </Button>
              </div>
            </Card>

            {/* LISTAGEM DE USUÁRIOS E PERFIS */}
            <Card className="rounded-[24px] border-0 bg-white shadow-[0_10px_35px_rgba(19,42,39,0.05)] overflow-hidden">
              <CardHeader className="border-b border-[#edf1eb] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#173a34]">
                      Contas e Profissionais Cadastrados
                    </CardTitle>
                    <p className="mt-1 text-xs text-[#71867f]">
                      Usuários criados no banco de dados e seus respectivos espaços públicos.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cleanGhostMutation.mutate()}
                      disabled={cleanGhostMutation.isPending}
                      className="rounded-xl border-[#dce5dc] text-xs font-semibold text-[#38584f] hover:bg-[#f2f7f0]"
                      title="Remove com segurança apenas sessões fantasmas sem nome e sem e-mail"
                    >
                      {cleanGhostMutation.isPending ? "Higienizando..." : "Limpar Sessões Antigas"}
                    </Button>
                    <Badge variant="outline" className="rounded-lg border-[#dce5dc]">
                      {usersQuery.data?.length || 0} registros
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f7f9f5] border-b border-[#edf1eb] text-[#5c756d] font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Nome / Profissão</th>
                        <th className="px-6 py-3.5">E-mail</th>
                        <th className="px-6 py-3.5">Localização</th>
                        <th className="px-6 py-3.5">Perfil Público</th>
                        <th className="px-6 py-3.5 text-center">Clientes</th>
                        <th className="px-6 py-3.5 text-center">Orçamentos</th>
                        <th className="px-6 py-3.5">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1eb] text-[#38584f]">
                      {usersQuery.data && usersQuery.data.length > 0 ? (
                        usersQuery.data.map((u) => (
                          <tr key={u.id} className="hover:bg-[#fbfcf9] transition">
                            <td className="px-6 py-4 font-semibold text-[#173a34]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{u.profileName || u.name}</span>
                                {u.role === "admin" && (
                                   <Badge className="bg-[#173a34] text-[#d9f56a] text-[10px] py-0 px-1.5 h-4">
                                     Admin
                                   </Badge>
                                 )}
                                {u.isIncomplete && (
                                  <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200 text-[10px] py-0 px-1.5 h-4">
                                    Sessão Antiga
                                  </Badge>
                                )}
                              </div>
                              {u.profession && (
                                <span className="block text-[11px] font-normal text-[#71867f]">
                                  {u.profession}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">{u.city || "—"}</td>
                            <td className="px-6 py-4">
                              {u.slug ? (
                                <a
                                  href={`/p/${u.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-[#7a961f] hover:underline"
                                >
                                  /p/{u.slug}
                                </a>
                              ) : (
                                <span className="text-[#a4b5ad]">Sem espaço</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#e1effa] text-[#1b5074]">
                                {u.clientsCount ?? 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#eef7ee] text-[#206030]">
                                {u.quotesCount ?? 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#71867f]">
                              {new Date(u.lastSignedIn).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-[#82948e]">
                            Nenhum usuário encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CONTEÚDO DA ABA: GESTÃO DE CUPONS & VOUCHERS */}
        {activeTab === "vouchers" && (
          <div className="space-y-8">
            {/* CARDS DE RESUMO DE VOUCHERS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Cupons Cadastrados</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                    <Ticket className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {vouchersQuery.data ? vouchersQuery.data.vouchers.length : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  Disponíveis no banco de dados
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Cupons Ativos</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1f5ec] text-[#1c784e]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {vouchersQuery.data ? vouchersQuery.data.vouchers.filter(v => v.active).length : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  Prontos para resgate imediato
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Resgates Realizados</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1effa] text-[#23638e]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {vouchersQuery.data ? vouchersQuery.data.redemptions.length : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  Usuários que ativaram cupons
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Vouchers VIP Total</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fef6e0] text-[#a1750d]">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {vouchersQuery.data ? vouchersQuery.data.vouchers.filter(v => v.isVipTotal).length : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  Acesso Vitalício ilimitado
                </p>
              </Card>
            </div>

            {/* CARD DESTACADO: GERADOR DE MENSAGENS DE BOAS-VINDAS & CONVITE VIP 20 DIAS PARA PROSPECTS */}
            <Card className="rounded-[28px] border-2 border-[#b5dc98] bg-linear-to-br from-[#f8fcf5] via-white to-[#edf7e9] p-6 sm:p-8 shadow-[0_16px_45px_rgba(23,58,52,0.07)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#dcead2] gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#e3f4d6] border border-[#b2d99d] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#2c5b1c]">
                        Conversão de Prospects
                      </span>
                      <span className="rounded-full bg-[#173a34] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#d9f56a]">
                        VIP 20 Dias
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#173a34] mt-1">
                      Gerador de Mensagem de Boas-Vindas para WhatsApp
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#527065] max-w-sm">
                  Gere mensagens personalizadas e prontas para fechar prospects com acesso de 20 dias grátis nos módulos Individual ou Equipe.
                </p>
              </div>

              {/* SELEÇÃO DO MÓDULO ALVO */}
              <div className="mt-6">
                <Label className="block text-xs font-bold uppercase tracking-wider text-[#355348] mb-2">
                  Escolha o Módulo do Prospect:
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProspectModule("individual");
                      setProspectVoucher("VIP20DIAS");
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex items-start gap-3.5 ${
                      prospectModule === "individual"
                        ? "border-[#173a34] bg-white shadow-md ring-2 ring-[#8aa500]/20"
                        : "border-[#d8e6d2] bg-[#f9fcf7] hover:border-[#adc9a4]"
                    }`}
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${
                      prospectModule === "individual" ? "bg-[#173a34] text-[#d9f56a]" : "bg-[#e5ede1] text-[#4f6d61]"
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#173a34]">Módulo Individual / Solo</strong>
                        {prospectModule === "individual" && (
                          <span className="text-[10px] font-bold bg-[#8aa500] text-white px-2 py-0.5 rounded-full">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#587168] mt-1 leading-snug">
                        Para autônomos que atendem sozinhos: orçamentos no WhatsApp, recibos formais, PIX direto e catálogo próprio.
                      </p>
                      <span className="inline-block mt-2 font-mono text-[11px] font-bold text-[#2d6e49] bg-[#e1f3e7] px-2 py-0.5 rounded-md">
                        Cupom padrão: VIP20DIAS (20d PRO)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProspectModule("equipe");
                      setProspectVoucher("EQUIPE20");
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex items-start gap-3.5 ${
                      prospectModule === "equipe"
                        ? "border-[#173a34] bg-white shadow-md ring-2 ring-[#8aa500]/20"
                        : "border-[#d8e6d2] bg-[#f9fcf7] hover:border-[#adc9a4]"
                    }`}
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${
                      prospectModule === "equipe" ? "bg-[#173a34] text-[#d9f56a]" : "bg-[#e5ede1] text-[#4f6d61]"
                    }`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#173a34]">Módulo Equipe / Estúdio & Salão</strong>
                        {prospectModule === "equipe" && (
                          <span className="text-[10px] font-bold bg-[#8aa500] text-white px-2 py-0.5 rounded-full">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#587168] mt-1 leading-snug">
                        Para estúdios e salões com múltiplos parceiros: comissões Lei 13.352, agenda concorrente e extrato WhatsApp.
                      </p>
                      <span className="inline-block mt-2 font-mono text-[11px] font-bold text-[#23638e] bg-[#e1effa] px-2 py-0.5 rounded-md">
                        Cupom padrão: EQUIPE20 (20d Equipe)
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* CAMPOS DE PERSONALIZAÇÃO */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="block text-xs font-semibold text-[#355348] mb-1">
                    Nome do Prospect (Opcional):
                  </Label>
                  <Input
                    placeholder="Ex: Mariana, Carlos, Dr. Felipe"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    className="h-10 rounded-xl border-[#cddfc8] bg-white text-xs"
                  />
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-[#355348] mb-1">
                    WhatsApp do Prospect:
                  </Label>
                  <Input
                    placeholder="Ex: (11) 98888-7777"
                    value={prospectPhone}
                    onChange={(e) => setProspectPhone(e.target.value)}
                    className="h-10 rounded-xl border-[#cddfc8] bg-white text-xs"
                  />
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-[#355348] mb-1">
                    Código do Cupom VIP:
                  </Label>
                  <Input
                    placeholder="Ex: VIP20DIAS, EQUIPE20"
                    value={prospectVoucher}
                    onChange={(e) => setProspectVoucher(e.target.value.toUpperCase().replace(/\s+/g, "-"))}
                    className="h-10 rounded-xl border-[#cddfc8] bg-white font-mono font-bold text-xs"
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setProspectVoucher("VIP20DIAS")}
                      className="text-[10px] text-[#4f6d61] hover:text-[#173a34] bg-[#e6ede3] hover:bg-[#d6e3d2] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      VIP20DIAS
                    </button>
                    <button
                      type="button"
                      onClick={() => setProspectVoucher("EQUIPE20")}
                      className="text-[10px] text-[#4f6d61] hover:text-[#173a34] bg-[#e6ede3] hover:bg-[#d6e3d2] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      EQUIPE20
                    </button>
                    <button
                      type="button"
                      onClick={() => setProspectVoucher("BETA20")}
                      className="text-[10px] text-[#4f6d61] hover:text-[#173a34] bg-[#e6ede3] hover:bg-[#d6e3d2] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      BETA20
                    </button>
                    <button
                      type="button"
                      onClick={() => setProspectVoucher("VIPTOTAL")}
                      className="text-[10px] text-[#4f6d61] hover:text-[#173a34] bg-[#e6ede3] hover:bg-[#d6e3d2] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      VIPTOTAL
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-[#355348] mb-1">
                    Link de Acesso Oficial:
                  </Label>
                  <select
                    value={prospectDomain}
                    onChange={(e) => setProspectDomain(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#cddfc8] bg-white px-3 text-xs text-[#173a34] font-medium"
                  >
                    <option value="https://meuautonomo.vercel.app">meuautonomo.vercel.app (Oficial Vercel)</option>
                    <option value="https://meuautonomo.creativeam.com.br">meuautonomo.creativeam.com.br (Domínio Customizado)</option>
                  </select>
                </div>
              </div>

              {/* CAIXA DE PREVIEW DA MENSAGEM */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#355348] flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-[#25D366]" />
                    Mensagem Formatada Pronta para o WhatsApp:
                  </span>
                  <span className="text-[11px] text-[#6d8a7f]">
                    Emojis, formatação e instruções inclusas
                  </span>
                </div>
                <div className="rounded-2xl border border-[#cbe4d1] bg-white p-4 font-sans text-xs text-[#223d34] leading-relaxed whitespace-pre-wrap shadow-inner max-h-64 overflow-y-auto">
                  {getProspectWelcomeMessage()}
                </div>
              </div>

              {/* BOTÕES DE AÇÃO RÁPIDA */}
              <div className="mt-5 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#dcead2]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(getProspectWelcomeMessage());
                    setCopiedProspectMsg(true);
                    toast.success("Mensagem completa copiada para a área de transferência!");
                    setTimeout(() => setCopiedProspectMsg(false), 2500);
                  }}
                  className="rounded-xl border-[#b8d4b3] bg-white text-[#173a34] hover:bg-[#edf5e8] font-bold text-xs h-10 px-5 cursor-pointer flex items-center gap-2"
                >
                  {copiedProspectMsg ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Mensagem Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[#2e5d48]" />
                      Copiar Mensagem Pronta
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    const cleanPhone = prospectPhone.replace(/\D/g, "");
                    const msg = encodeURIComponent(getProspectWelcomeMessage());
                    if (cleanPhone) {
                      window.open(`https://wa.me/55${cleanPhone.replace(/^55/, "")}?text=${msg}`, "_blank");
                    } else {
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }
                  }}
                  className="rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs h-10 px-6 cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Enviar Direto no WhatsApp
                  {prospectPhone.trim() && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </Card>

            {/* CARD: CRIAR NOVO CUPOM / VOUCHER */}
            <Card className="rounded-[28px] border-0 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(19,42,39,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-[#edf1eb] gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#173a34] flex items-center gap-2">
                    <Plus className="h-5 w-5 text-[#8aa500]" />
                    Criar Novo Cupom / Voucher Promocional
                  </h3>
                  <p className="text-xs text-[#71867f] mt-1">
                    Gere códigos especiais para suas primeiras testadoras, parceiras estratégicas ou promoções de lançamento.
                  </p>
                </div>

                {/* BOTÕES DE PRESETS RÁPIDOS */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVoucherCodeInput("VIP20TESTE");
                      setVoucherDescInput("20 Dias PRO para Testadora");
                      setVoucherDaysInput(20);
                      setVoucherIsVipInput(false);
                      setVoucherPlanInput("pro");
                      setVoucherMaxUsesInput(1);
                    }}
                    className="rounded-xl border-[#dce5dc] text-xs font-bold text-[#173a34] hover:bg-[#edf5da]"
                  >
                    + Preset 20 Dias
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVoucherCodeInput("PRO30DIAS");
                      setVoucherDescInput("30 Dias Grátis de PRO");
                      setVoucherDaysInput(30);
                      setVoucherIsVipInput(false);
                      setVoucherPlanInput("pro");
                      setVoucherMaxUsesInput(10);
                    }}
                    className="rounded-xl border-[#dce5dc] text-xs font-bold text-[#173a34] hover:bg-[#edf5da]"
                  >
                    + Preset 30 Dias (10 Usos)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVoucherCodeInput("VIPTOTAL-SOCIO");
                      setVoucherDescInput("VIP Total Vitalício");
                      setVoucherDaysInput(0);
                      setVoucherIsVipInput(true);
                      setVoucherPlanInput("pro");
                      setVoucherMaxUsesInput(1);
                    }}
                    className="rounded-xl border-[#f0deab] bg-[#fdf9ee] text-xs font-bold text-[#8a6405] hover:bg-[#faeed0]"
                  >
                    👑 Preset VIP Total Vitalício
                  </Button>
                </div>
              </div>

              {/* FORMULÁRIO */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!voucherCodeInput.trim()) return toast.error("Informe o código do cupom.");
                  createVoucherMutation.mutate({
                    code: voucherCodeInput.trim(),
                    description: voucherDescInput.trim() || undefined,
                    days: voucherDaysInput,
                    plan: voucherPlanInput,
                    isVipTotal: voucherIsVipInput,
                    maxUses: voucherMaxUsesInput,
                  });
                }}
                className="mt-6 space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label className="text-xs font-bold text-[#173a34] mb-1.5 block">
                      Código do Cupom / Voucher *
                    </Label>
                    <Input
                      placeholder="Ex: VIP20DIAS, PRO15, TESTE30"
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase().replace(/\s+/g, "-"))}
                      required
                      className="h-11 rounded-xl border-[#dce5dc] font-mono font-bold tracking-wider uppercase text-base"
                    />
                    <p className="text-[11px] text-[#71867f] mt-1">
                      Letras maiúsculas, números e traços.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-[#173a34] mb-1.5 block">
                      Descrição / Finalidade (Opcional)
                    </Label>
                    <Input
                      placeholder="Ex: Degustação da primeira cliente testadora"
                      value={voucherDescInput}
                      onChange={(e) => setVoucherDescInput(e.target.value)}
                      className="h-11 rounded-xl border-[#dce5dc]"
                    />
                    <p className="text-[11px] text-[#71867f] mt-1">
                      Identificação interna para você saber quem ganhou.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-[#173a34] mb-1.5 block">
                      Limite de Resgates (Quantas pessoas podem usar?)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={99999}
                      value={voucherMaxUsesInput}
                      onChange={(e) => setVoucherMaxUsesInput(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                      className="h-11 rounded-xl border-[#dce5dc]"
                    />
                    <p className="text-[11px] text-[#71867f] mt-1">
                      Use 1 para cupom exclusivo de uma única pessoa.
                    </p>
                  </div>
                </div>

                {/* TIPO: DIAS VS VIP TOTAL */}
                <div className="rounded-2xl border border-[#dce5dc] bg-[#f9faf7] p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl transition ${voucherIsVipInput ? "bg-[#d9f56a] text-[#173a34]" : "bg-emerald-100 text-emerald-800"}`}>
                        {voucherIsVipInput ? <Crown className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#173a34]">
                          {voucherIsVipInput ? "Acesso VIP Total (Vitalício / Permanente)" : "Acesso Temporário por Dias (Degustação)"}
                        </h4>
                        <p className="text-xs text-[#71867f] mt-0.5">
                          {voucherIsVipInput
                            ? "Nunca expira! A pessoa terá acesso total a todos os recursos da plataforma para sempre."
                            : "Válido pela quantidade de dias escolhida. Quando expirar, o plano volta para Grátis sem perda de dados."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#173a34]">
                        <input
                          type="checkbox"
                          checked={voucherIsVipInput}
                          onChange={(e) => setVoucherIsVipInput(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#173a34]"
                        />
                        <span>Tornar este voucher VIP TOTAL VITALÍCIO</span>
                      </label>
                    </div>
                  </div>

                  {!voucherIsVipInput && (
                    <div className="mt-4 pt-4 border-t border-[#e8eee4] grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-bold text-[#173a34] mb-1.5 block">
                          Quantidade de Dias de Degustação *
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            value={voucherDaysInput}
                            onChange={(e) => setVoucherDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                            className="h-11 rounded-xl border-[#dce5dc] font-bold text-base"
                          />
                          <div className="flex gap-1">
                            {[10, 15, 20, 30].map(d => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setVoucherDaysInput(d)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${voucherDaysInput === d ? "bg-[#173a34] text-[#d9f56a]" : "bg-white border border-[#dce5dc] text-[#38584f] hover:bg-[#edf5da]"}`}
                              >
                                {d}d
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-[#173a34] mb-1.5 block">
                          Plano a ser Concedido
                        </Label>
                        <select
                          value={voucherPlanInput}
                          onChange={(e) => setVoucherPlanInput(e.target.value as "pro" | "team")}
                          className="h-11 w-full rounded-xl border border-[#dce5dc] bg-white px-3 text-sm font-semibold text-[#173a34] outline-none"
                        >
                          <option value="pro">Plano PRO (Individual / Autônomo)</option>
                          <option value="team">Plano Equipe (Salões, Barbearias e Estúdios)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={createVoucherMutation.isPending}
                    className="h-12 px-8 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] font-bold text-sm shadow-md cursor-pointer"
                  >
                    {createVoucherMutation.isPending ? "Cadastrando..." : "Cadastrar Voucher no Banco"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* TABELA DE CUPONS CADASTRADOS */}
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_12px_40px_rgba(19,42,39,0.06)] overflow-hidden">
              <CardHeader className="p-6 border-b border-[#edf1eb]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-[#173a34] flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-[#8aa500]" />
                    Cupons & Vouchers Cadastrados
                  </CardTitle>
                  <span className="text-xs text-[#71867f]">
                    {vouchersQuery.data ? `${vouchersQuery.data.vouchers.length} cupons no sistema` : "Carregando..."}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8faf6] text-xs font-bold text-[#537067] uppercase border-b border-[#edf1eb]">
                      <tr>
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Descrição / Tipo</th>
                        <th className="px-6 py-4">Benefício Concedido</th>
                        <th className="px-6 py-4">Usos</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1eb]">
                      {vouchersQuery.data?.vouchers && vouchersQuery.data.vouchers.length > 0 ? (
                        vouchersQuery.data.vouchers.map((v) => (
                          <tr key={v.id} className="hover:bg-[#fcfdfa] transition">
                            <td className="px-6 py-4 font-mono font-bold text-[#173a34]">
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-[#edf5da] px-2.5 py-1 text-xs text-[#4c630f] border border-[#d2e4a8]">
                                  {v.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyVoucherToClipboard(v.code)}
                                  className="text-[#71867f] hover:text-[#173a34] transition p-1 cursor-pointer"
                                  title="Copiar código"
                                >
                                  {copiedVoucher === v.code ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block font-semibold text-[#173a34] text-xs">{v.description || "—"}</span>
                              <span className="text-[11px] text-[#71867f] capitalize">Plano {v.plan}</span>
                            </td>
                            <td className="px-6 py-4">
                              {v.isVipTotal ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-black">
                                  <Crown className="h-3 w-3" /> VIP TOTAL VITALÍCIO
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                                  <Clock className="h-3 w-3" /> {v.days} Dias de Degustação
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-[#38584f]">
                              <span className="font-bold text-[#173a34]">{v.usedCount}</span> / {v.maxUses >= 9999 ? "∞ Ilimitado" : v.maxUses}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => toggleVoucherMutation.mutate({ id: v.id, active: !v.active })}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${v.active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                              >
                                {v.active ? (
                                  <>
                                    <ToggleRight className="h-4 w-4 text-emerald-600" /> Ativo
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="h-4 w-4" /> Inativo
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    setWhatsAppModalVoucher(v);
                                    setWhatsAppRecipientPhone("");
                                    setCopiedWhatsAppMsg(false);
                                  }}
                                  className="h-8 px-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg cursor-pointer font-bold text-xs shadow-2xs flex items-center gap-1.5"
                                  title="Enviar Convite com Voucher no WhatsApp"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir o voucher ${v.code}?`)) {
                                      deleteVoucherMutation.mutate({ id: v.id });
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Excluir voucher"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#82948e]">
                            Nenhum voucher cadastrado ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* CARD: HISTÓRICO DE RESGATES */}
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_12px_40px_rgba(19,42,39,0.06)] overflow-hidden">
              <CardHeader className="p-6 border-b border-[#edf1eb]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-[#173a34] flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#23638e]" />
                    Histórico de Resgates Realizados por Usuários
                  </CardTitle>
                  <span className="text-xs text-[#71867f]">
                    {vouchersQuery.data ? `${vouchersQuery.data.redemptions.length} resgates registrados` : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8faf6] text-xs font-bold text-[#537067] uppercase border-b border-[#edf1eb]">
                      <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">E-mail</th>
                        <th className="px-6 py-4">Espaço / Perfil</th>
                        <th className="px-6 py-4">Cupom Utilizado</th>
                        <th className="px-6 py-4">Data do Resgate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1eb]">
                      {vouchersQuery.data?.redemptions && vouchersQuery.data.redemptions.length > 0 ? (
                        vouchersQuery.data.redemptions.map((r) => (
                          <tr key={r.id} className="hover:bg-[#fcfdfa] transition">
                            <td className="px-6 py-4 font-bold text-[#173a34]">{r.userName}</td>
                            <td className="px-6 py-4 text-[#5c756d] text-xs">{r.userEmail}</td>
                            <td className="px-6 py-4 text-[#38584f] text-xs font-semibold">{r.profileName}</td>
                            <td className="px-6 py-4 font-mono font-bold text-xs text-[#7a961f]">
                              {r.voucherCode}
                            </td>
                            <td className="px-6 py-4 text-xs text-[#71867f]">
                              {new Date(r.redeemedAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#82948e]">
                            Nenhum cupom foi resgatado por usuários até o momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: PLANO DE PROPAGANDA & VENDAS */}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            {/* CARD IMPORTANTE: MODELO DE NEGÓCIO E NÃO-INTERMEDIAÇÃO */}
            <div className="rounded-[24px] border border-[#b8dfc4] bg-[#f0f9f3] p-6 text-[#173a34] shadow-xs">
              <div className="flex items-center gap-3 font-bold text-base text-[#173a34] mb-2">
                <ShieldCheck className="h-6 w-6 text-[#2e6e4a]" />
                <span>Pilar Fundamental: Como o MeuAutônomo Lucra (E Como NÃO Cobra Nada de Serviços)</span>
              </div>
              <p className="text-sm leading-6 text-[#2f5546]">
                Para que o profissional autônomo confie e use o sistema com entusiasmo, <strong>a plataforma nunca cobra porcentagem ou comissão sobre o serviço dele</strong> e <strong>não retém o dinheiro pago pelos clientes</strong>.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl bg-white p-3.5 border border-[#cbe4d4] shadow-xs">
                  <strong className="block text-[#173a34] text-sm mb-1">💰 Pagamento dos Serviços (100% Direto):</strong>
                  O cliente final acerta direto com o profissional (na máquina física de cartão do prestador, em dinheiro ou transferência/PIX). Sem intermediação bancária obrigatória nem retenção de saldo.
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-[#cbe4d4] shadow-xs">
                  <strong className="block text-[#173a34] text-sm mb-1">📈 Como a Plataforma Fatura (SaaS Mensal):</strong>
                  Monetização por assinatura de software: versão Gratuita para o autônomo começar a usar, e <strong>Plano PRO por apenas R$ 24,90/mês</strong> para orçamentos ilimitados, fotos e relatórios.
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: VISÃO DE MERCADO */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)] lg:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#6b820a]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#173a34]">Tamanho da Oportunidade no Brasil</h3>
                    <p className="text-xs text-[#71867f]">Mercado gigantesco e subatendido pela tecnologia</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[#4c6960] leading-relaxed">
                  <p>
                    No Brasil existem mais de <strong>15 milhões de MEIs</strong> e mais de <strong>25 milhões de trabalhadores autônomos ou informais</strong>.
                  </p>
                  <p>
                    A esmagadora maioria ainda trabalha no <strong>caderninho de papel</strong>, mensagens perdidas no WhatsApp e papéis de orçamento rabiscados, o que gera calotes, esquecimento de cobranças e impressão de amadorismo.
                  </p>
                  <div className="mt-4 rounded-xl border border-[#dce5dc] bg-[#fbfcf9] p-4 font-medium text-xs text-[#173a34]">
                    🎯 <strong>A Proposta Única de Valor (Slogan):</strong><br />
                    <em>"O aplicativo mais simples e direto do Brasil para o trabalhador autônomo organizar sua agenda, enviar orçamentos profissionais pelo WhatsApp e receber direto — sem burocracia e sem o cliente precisar baixar nada."</em>
                  </div>
                </div>
              </Card>

              {/* CARD PRECIFICAÇÃO PRO */}
              <Card className="rounded-[24px] border-2 border-[#d9f56a] bg-gradient-to-b from-[#f8fbe9] to-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-[#173a34] text-[#d9f56a] text-[11px] font-bold">Plano PRO Recomendado</Badge>
                  <Sparkles className="h-5 w-5 text-[#8aa500]" />
                </div>
                <div className="mt-2 text-3xl font-black text-[#173a34]">
                  R$ 24,90 <span className="text-sm font-normal text-[#71867f]">/ mês</span>
                </div>
                <p className="text-xs text-[#526d64] mt-1 font-medium">
                  Ou R$ 199,00/ano no PIX (equivale a R$ 16,58/mês)
                </p>
                <div className="mt-4 space-y-2 text-xs text-[#38584f]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Orçamentos e propostas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Emissão ilimitada de Recibos Digitais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Fotos de antes/depois nos orçamentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Relatório financeiro de lucro mensal</span>
                  </div>
                </div>
                <p className="mt-4 rounded-xl bg-white p-3 text-[11px] text-[#5c756d] border border-[#e1ecc8]">
                  💡 <strong>Por que este preço?</strong> Menos que uma pizza. Se o profissional fechar 1 orçamento a mais no mês por passar confiança, a ferramenta já se pagou com sobras.
                </p>
              </Card>
            </div>

            {/* SEÇÃO 2: AS 4 PERSONAS E GANCHOS */}
            <div>
              <h3 className="text-lg font-bold text-[#173a34] mb-3">
                Públicos-Alvo Prioritários & Ganchos de Venda
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🔨</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Obras & Reparos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Eletricista, Encanador, Pintor, Marceneiro, Ar Condicionado</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Perde propostas por demora ou passa impressão de amadorismo; cliente chora desconto.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Envie propostas com cara de empresa grande em 1 minuto direto no WhatsApp."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">💅</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Beleza & Estética</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Manicure, Cabeleireira, Lash Designer, Maquiadora</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Clientes furando horários e desorganização da agenda no WhatsApp misturada com a vida pessoal.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Tenha seu cartão virtual com catálogo e agendamento direto na bio do Instagram."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">📱</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Reparos Rápidos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Conserto de Celular, Eletrodomésticos, Informática</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Aprovação de peças, registro formal de garantia e necessidade de sinal de entrada.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Orçamento aprovado pelo cliente com aceite registrado e opção de chave PIX direta."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🧹</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Serviços & Eventos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Diarista, Personal Organizer, Buffet/Doceria, Fotógrafo</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Falta de controle financeiro do mês, recibos manuais improvisados e esquecimentos.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Emita recibos digitais em 1 clique e saiba exatamente quanto sobrou no final do mês."</em>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: OS 4 CANAIS DE AQUISIÇÃO */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <h3 className="text-lg font-bold text-[#173a34] mb-1">
                Os 4 Canais Práticos de Divulgação
              </h3>
              <p className="text-xs text-[#71867f] mb-6">
                Estratégias de baixo custo com foco em presença onde o profissional autônomo já circula todos os dias.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Building2 className="h-5 w-5 text-[#2e6e4a]" />
                    <span>Canal 1: Parcerias Físicas B2B (Custo Quase Zero)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Eletricistas e encanadores vão toda semana à loja de materiais de construção. Manicures vão a distribuidores de cosméticos.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li>Colocar display de balcão com QR Code: <em>"Pare de mandar orçamento em papel de pão. Teste o MeuAutônomo grátis."</em></li>
                    <li>Oferecer comissão simbólica ou brinde para os balconistas indicarem o app para quem compra no balcão.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Video className="h-5 w-5 text-[#8aa500]" />
                    <span>Canal 2: Vídeos Curtos de Humor (TikTok / Reels)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Vídeos curtos de identificação da rotina do autônomo viralizam organicamente sem gastar com anúncios.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li><strong>Roteiro Humor:</strong> Profissional procurando caderno no porta-luvas bagunçado: <em>"Quem nunca perdeu R$ 300 porque esqueceu de cobrar o cliente?"</em> Mostra gerando o recibo em 2 segundos.</li>
                    <li><strong>Roteiro Autoridade:</strong> <em>"Como cobrar mais pelo seu serviço sem o cliente pedir desconto?"</em> Mostra a página do orçamento digital profissional.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Smartphone className="h-5 w-5 text-[#1b75bb]" />
                    <span>Canal 3: Meta Ads Hiperlocal (Instagram & Facebook)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Campanhas locais com orçamento acessível (R$ 15 a R$ 30 por dia).
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li><strong>Público:</strong> Homens e Mulheres de 22 a 55 anos na sua região, com interesses em MEI, Ferramentas, Pequenos Negócios, Salão de Beleza.</li>
                    <li><strong>Formato:</strong> Vídeo gravado no próprio celular (estilo autêntico UGC, sem parecer propaganda corporativa).</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <MessageSquare className="h-5 w-5 text-[#173a34]" />
                    <span>Canal 4: Grupos Regionais & WhatsApp</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Apresentar o <strong>Cartão Digital Gratuito</strong> como um presente nas comunidades de bairro e associações comerciais.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li>O trabalhador adora receber um link profissional com o próprio nome (<code>/p/seunome</code>) para colocar na bio.</li>
                    <li>Uma vez dentro da plataforma, ele descobre naturalmente os orçamentos e a agenda.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: SCRIPTS DE WHATSAPP COM COPIAR COM 1 CLIQUE */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#173a34]">
                    Scripts Prontos para Abordagem no WhatsApp
                  </h3>
                  <p className="text-xs text-[#71867f]">
                    Copie com 1 clique e envie para novos profissionais cadastrados ou contatos da sua lista.
                  </p>
                </div>
                <Badge className="bg-[#173a34] text-white">Copiar em 1 Clique</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* SCRIPT 1 */}
                <div className="rounded-2xl border border-[#dce5dc] bg-[#f8faf6] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs font-bold text-[#173a34] uppercase tracking-wider">
                        Script 1: Boas-Vindas & Ativação do Cartão
                      </strong>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `Olá [Nome], tudo bem? Aqui é da equipe do MeuAutônomo!\n\nVi que você acabou de criar seu espaço para atender como [Profissão].\n\nSeu cartão digital já está pronto no link: meuautonomo.com.br/p/[slug]\n\nVocê já pode colocar esse link no seu WhatsApp ou Instagram. Se precisar de ajuda para cadastrar seu primeiro serviço ou enviar um orçamento de teste, estou por aqui!`,
                            "script1"
                          )
                        }
                        className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#173a34]"
                      >
                        {copiedScript === "script1" ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5 text-[#8aa500]" /> Copiar Script
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-white p-4 font-mono text-xs leading-5 text-[#38584f] border border-[#e8ece7] whitespace-pre-wrap">
{`Olá [Nome], tudo bem? Aqui é da equipe do MeuAutônomo!

Vi que você acabou de criar seu espaço para atender como [Profissão].

Seu cartão digital já está pronto no link:
👉 meuautonomo.com.br/p/[slug]

Você já pode colocar esse link no seu WhatsApp ou Instagram. Se precisar de ajuda para cadastrar seu primeiro serviço ou enviar um orçamento de teste, estou por aqui!`}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#71867f]">
                    💡 Use assim que um profissional fizer o cadastro para acelerar a primeira proposta.
                  </p>
                </div>

                {/* SCRIPT 2 */}
                <div className="rounded-2xl border border-[#dce5dc] bg-[#f8faf6] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs font-bold text-[#173a34] uppercase tracking-wider">
                        Script 2: Oferta do Plano PRO (Upgrade)
                      </strong>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `Parabéns [Nome]! Você já gerou 3 propostas pelo MeuAutônomo e seus clientes estão adorando a agilidade.\n\nLiberamos para você um cupom de 30 dias com desconto no Plano PRO (orçamentos ilimitados, fotos de trabalhos e relatórios financeiros por apenas R$ 19,90 no primeiro mês).\n\nQuer ativar para experimentar no seu próximo serviço?`,
                            "script2"
                          )
                        }
                        className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#173a34]"
                      >
                        {copiedScript === "script2" ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5 text-[#8aa500]" /> Copiar Script
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-white p-4 font-mono text-xs leading-5 text-[#38584f] border border-[#e8ece7] whitespace-pre-wrap">
{`Parabéns [Nome]! Você já gerou 3 propostas pelo MeuAutônomo e seus clientes estão adorando a agilidade.

Liberamos para você um cupom de 30 dias com desconto no Plano PRO (orçamentos ilimitados, fotos de trabalhos e relatórios financeiros por apenas R$ 19,90 no primeiro mês).

Quer ativar para experimentar no seu próximo serviço?`}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#71867f]">
                    💡 Dispare quando o profissional criar a 3ª ou 4ª proposta gratuita. Taxa de conversão estimada em 15% a 25%.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: CRONOGRAMA DE 60 DIAS */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-[#2e6e4a]" />
                <h3 className="text-lg font-bold text-[#173a34]">
                  Plano de Ação para os Primeiros 60 Dias
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#8aa500]">Fase 1</span>
                    <Badge variant="outline" className="border-[#8aa500] text-[#556b10] text-[10px]">Dias 1 a 15</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Piloto & Validação</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Cadastrar 10 a 20 profissionais conhecidos (eletricista que conserta sua casa, manicure, etc.).</li>
                    <li>Acompanhar o envio do 1º orçamento real.</li>
                    <li>Utilizar o botão <em>"Zerar dados"</em> no painel admin para reiniciar testes sempre que necessário.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#23638e]">Fase 2</span>
                    <Badge variant="outline" className="border-[#23638e] text-[#23638e] text-[10px]">Dias 16 a 30</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Lançamento Orgânico</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Gravar e postar 3 vídeos por semana no Reels e TikTok mostrando o fluxo: Cartão -&gt; Orçamento -&gt; Aceite -&gt; Recibo.</li>
                    <li>Deixar displays de balcão com QR Code em 3 lojas parceiras de materiais ou beleza.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#2c7a45]">Fase 3</span>
                    <Badge variant="outline" className="border-[#2c7a45] text-[#2c7a45] text-[10px]">Dias 31 a 60</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Escala & Primeiros Pagantes</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Iniciar anúncios Meta Ads locais (R$ 20/dia).</li>
                    <li>Ativar checkout de assinatura PRO por R$ 24,90/mês.</li>
                    <li><strong>Meta inicial:</strong> 100 usuários ativos e 15 a 20 assinantes PRO recorrentes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: SIMULADOR VISUAL DE EXPERIÊNCIA */}
        {activeTab === "simulator" && <SimulatorTour />}

        {/* CONTEÚDO DA ABA: TODAS AS JANELAS & TELAS DO SISTEMA */}
        {activeTab === "screens" && (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-sm">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#173a34]">
                      Central Executiva de Janelas e Telas do MeuAutônomo
                    </h3>
                    <p className="text-xs text-[#526d64] mt-0.5 max-w-2xl">
                      Acesse, teste e inspecione diretamente qualquer tela da aplicação com um único clique. Todos os links estão prontos e operacionais em produção.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/planos"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173a34] hover:bg-[#28564d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 text-[#d9f56a]" />
                    <span>Ver Página de Planos</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/60" />
                  </a>
                </div>
              </div>
            </div>

            {/* GRID DAS JANELAS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Planos & Upgrade (Checkout PIX)",
                  path: "/planos",
                  badge: "Monetização",
                  badgeColor: "bg-[#d9f56a] text-[#173a34]",
                  icon: CreditCard,
                  desc: "Página oficial de planos: Grátis (R$ 0), PRO Individual (R$ 59,90 vitalício) e PRO Equipe & Estúdio (R$ 99,90 vitalício), com resgate de voucher e webhook do Asaas.",
                },
                {
                  title: "Simulador Visual dos Fluxos",
                  action: () => setActiveTab("simulator"),
                  isInternal: true,
                  badge: "Demonstração",
                  badgeColor: "bg-[#e1f5ec] text-[#1c784e]",
                  icon: Sparkles,
                  desc: "Simula o fluxo completo da plataforma: do orçamento no WhatsApp à aprovação com QR Code PIX e recibo digital.",
                },
                {
                  title: "Visão Geral (Meu Espaço)",
                  path: "/app",
                  badge: "Área Logada",
                  badgeColor: "bg-blue-100 text-blue-900",
                  icon: LayoutDashboard,
                  desc: "Painel central do autônomo com resumo diário, faturamento do mês, próximos clientes e atalhos rápidos.",
                },
                {
                  title: "Meu Dia (Operacional)",
                  path: "/meu-dia",
                  badge: "Rotina Diária",
                  badgeColor: "bg-amber-100 text-amber-900",
                  icon: Clock,
                  desc: "Tela otimizada para o celular focada exclusivamente nos atendimentos e tarefas marcadas para hoje.",
                },
                {
                  title: "Agenda de Atendimentos",
                  path: "/agenda",
                  badge: "Calendário",
                  badgeColor: "bg-emerald-100 text-emerald-900",
                  icon: Calendar,
                  desc: "Calendário de compromissos com controle de status (agendado, confirmado, concluído) e configuração de disponibilidade.",
                },
                {
                  title: "Orçamentos & Propostas",
                  path: "/orcamentos",
                  badge: "Vendas",
                  badgeColor: "bg-purple-100 text-purple-900",
                  icon: FileText,
                  desc: "Emissor de orçamentos com fotos, itens, totais, link público para o cliente aprovar e chave PIX automática.",
                },
                {
                  title: "Controle Financeiro",
                  path: "/financeiro",
                  badge: "Fluxo de Caixa",
                  badgeColor: "bg-emerald-100 text-emerald-900",
                  icon: DollarSign,
                  desc: "Gestão de receitas, custos com materiais, lucro líquido do mês, pendências e histórico financeiro.",
                },
                {
                  title: "Gestão de Clientes",
                  path: "/clientes",
                  badge: "CRM Simples",
                  badgeColor: "bg-slate-100 text-slate-800",
                  icon: Users,
                  desc: "Cadastro completo de clientes com histórico de serviços prestados, orçamentos e botão de WhatsApp direto.",
                },
                {
                  title: "Catálogo de Serviços",
                  path: "/servicos",
                  badge: "Tabela de Preços",
                  badgeColor: "bg-sky-100 text-sky-900",
                  icon: Target,
                  desc: "Lista de serviços prestados com nome, preço, tempo de execução e permissão de agendamento online.",
                },
                {
                  title: "Equipe & Parceiros (Salões)",
                  path: "/equipe",
                  badge: "Plano Equipe",
                  badgeColor: "bg-pink-100 text-pink-900",
                  icon: Users,
                  desc: "Gestão de colaboradoras com divisão de comissão, sem expor faturamento do dono e com link seguro individual.",
                },
                {
                  title: "Cartão de Visitas Digital & Bio",
                  path: "/cartao",
                  badge: "Marketing",
                  badgeColor: "bg-lime-100 text-lime-900",
                  icon: Smartphone,
                  desc: "Página pública com foto, bio, botões de WhatsApp, localização e QR Code pronto para impressão em balcão.",
                },
                {
                  title: "Tutorial: Modo Individual (Solo)",
                  path: "/guia",
                  badge: "Tutorial Solo",
                  badgeColor: "bg-emerald-100 text-emerald-900",
                  icon: BookOpen,
                  desc: "Manual prático com 6 passos para quem trabalha sozinho: catálogo de serviços, orçamentos no WhatsApp, agenda e financeiro pessoal.",
                },
                {
                  title: "Tutorial: Modo Equipe & Estúdio",
                  path: "/guia",
                  badge: "Tutorial Equipe",
                  badgeColor: "bg-purple-100 text-purple-900",
                  icon: Building2,
                  desc: "Manual prático com 7 passos para salões e oficinas: gestão de colaboradoras, segurança, comissões (Lei 13.352) e links individuais.",
                },
                {
                  title: "Vídeo / Reels de Demonstração",
                  path: "/demo",
                  badge: "Pitch Comercial",
                  badgeColor: "bg-rose-100 text-rose-900",
                  icon: Video,
                  desc: "Vídeo vertical para redes sociais demonstrando as vantagens práticas do aplicativo para atrair novos profissionais.",
                },
                {
                  title: "Página Inicial Pública",
                  path: "/",
                  badge: "Landing Page",
                  badgeColor: "bg-teal-100 text-teal-900",
                  icon: Globe,
                  desc: "Página de entrada da plataforma com proposta de valor, apresentação de recursos e formulário de cadastro.",
                },
              ].map((screen, idx) => (
                <Card
                  key={idx}
                  className="rounded-[24px] border border-[#dce5dc] bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4f7f1] text-[#173a34]">
                        <screen.icon className="h-5 w-5 text-[#2d7d54]" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${screen.badgeColor}`}>
                        {screen.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#173a34]">
                      {screen.title}
                    </h4>

                    {screen.path && (
                      <p className="font-mono text-[11px] text-[#7a961f] font-semibold mt-0.5">
                        {screen.path}
                      </p>
                    )}

                    <p className="text-xs text-[#6e857e] mt-2 leading-relaxed">
                      {screen.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#edf1eb] flex items-center justify-between gap-2">
                    {screen.isInternal ? (
                      <Button
                        type="button"
                        onClick={screen.action}
                        className="w-full h-10 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#d9f56a]" />
                        Abrir Simulador Agora
                      </Button>
                    ) : (
                      <>
                        <a
                          href={screen.path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#173a34] hover:bg-[#28564d] text-white text-xs font-bold transition shadow-2xs"
                        >
                          <span>Abrir em Nova Aba</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-white/70" />
                        </a>
                        <Link href={screen.path!}>
                          <Button
                            variant="outline"
                            className="h-10 px-3 rounded-xl border-[#dce5dc] text-xs font-semibold text-[#38584f]"
                            title="Navegar diretamente"
                          >
                            Ir
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA: SIMULADOR DE PAGAMENTO & PIX */}
        {activeTab === "transacoes" && (
          <div className="space-y-8">
            {/* HERO BANNER EXPLICATIVO */}
            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#173a34] via-[#1e4840] to-[#0f2824] p-7 text-white shadow-xl">
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#d9f56a]/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f56a] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#173a34]">
                      <Banknote className="h-4 w-4" />
                      Laboratório de Pagamentos Diretos
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#d9f56a]" />
                      Zero Taxas de Intermediação (0% Retido)
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Como Funciona o Pagamento no MeuAutônomo?
                  </h2>
                  <p className="text-sm text-[#e0ece6] leading-relaxed">
                    Aqui você pode <strong>testar na prática</strong> o fluxo completo de pagamento: como o cliente paga (no PIX, maquininha de cartão ou dinheiro vivo), a blindagem de transparência onde fica 100% claro que o acordo é direto entre as duas partes, e como o autônomo confirma o recebimento no seu próprio aplicativo.
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 text-center">
                    <span className="text-[11px] font-bold uppercase text-[#d9f56a] block">Comissão da Plataforma</span>
                    <span className="text-3xl font-black text-white">0,00%</span>
                    <span className="text-[10px] text-white/70 block mt-0.5">O dinheiro NUNCA é retido pelo app</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESPOSTA DIRETA ÀS 3 PRINCIPAIS DÚVIDAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="rounded-[22px] border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        Dúvida 1
                      </span>
                      <h4 className="text-sm font-bold text-[#173a34]">Por que 'PIX Automático'?</h4>
                    </div>
                  </div>
                  <p className="text-xs text-[#5c756d] leading-relaxed">
                    No vídeo de demonstração, o termo <em>"PIX automático"</em> refere-se à <strong>geração instantânea do QR Code e Chave Copia-e-Cola</strong> na tela do cliente. O cliente não precisa ficar pedindo a chave no chat do WhatsApp; a tela da proposta já abre com os dados bancários do autônomo prontos para pagar. O dinheiro vai <strong>direto para a conta bancária do profissional</strong> (sem intermediários).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#edf1eb] text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Dinheiro cai 100% na conta particular do prestador</span>
                </div>
              </Card>

              <Card className="rounded-[22px] border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
                        Dúvida 2
                      </span>
                      <h4 className="text-sm font-bold text-[#173a34]">E Cartão ou Dinheiro Vivo?</h4>
                    </div>
                  </div>
                  <p className="text-xs text-[#5c756d] leading-relaxed">
                    Ao criar a proposta ou orçamento, o autônomo seleciona a forma combinada: <strong>"Cartão na Maquininha do Profissional"</strong> ou <strong>"Dinheiro à Vista na Entrega"</strong>. A proposta do cliente exibe em letras garrafais que o pagamento será feito pessoalmente através da maquininha ou dinheiro, com aviso prévio se necessitar de troco.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#edf1eb] text-[11px] font-semibold text-blue-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Total flexibilidade: PIX, maquininha ou dinheiro</span>
                </div>
              </Card>

              <Card className="rounded-[22px] border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                        Dúvida 3
                      </span>
                      <h4 className="text-sm font-bold text-[#173a34]">Como o Autônomo Confirma?</h4>
                    </div>
                  </div>
                  <p className="text-xs text-[#5c756d] leading-relaxed">
                    O autônomo verifica o saldo no seu aplicativo bancário (no caso de PIX), confere o comprovante da maquininha ou o dinheiro na mão. Em seguida, clica no botão <strong>"Confirmar Recebimento (Dar Baixa)"</strong> dentro do MeuAutônomo. O sistema registra a receita no fluxo de caixa e gera um <strong>Recibo Oficial em PDF com termo de quitação</strong> para enviar ao cliente.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#edf1eb] text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Controle total nas mãos do profissional autônomo</span>
                </div>
              </Card>
            </div>

            {/* SEÇÃO 2: O AVISO DE TRANSPARÊNCIA E ISENÇÃO LEGAL */}
            <Card className="rounded-[24px] border-2 border-amber-300 bg-amber-50/60 p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-200 text-amber-900 shadow-xs">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-amber-950">
                      Termo de Transparência Exibido a Todo Cliente Antes de Concluir
                    </h3>
                    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      Blindagem Jurídica Ativa
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-sans">
                    Em <strong>todas as propostas e orçamentos públicos</strong> gerados pelo sistema, o cliente lê este aviso obrigatório em destaque antes de aprovar qualquer serviço ou efetuar pagamentos:
                  </p>
                  <div className="rounded-xl border border-amber-300/80 bg-white p-4 text-xs text-slate-800 space-y-2 shadow-xs">
                    <p className="font-bold text-[#173a34] flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-emerald-600 shrink-0" />
                      Aviso Legal ao Consumidor (Artigo de Transparência Financeira):
                    </p>
                    <p className="italic text-slate-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                      "A plataforma MeuAutônomo é uma ferramenta de tecnologia e gestão para profissionais autônomos. <strong>Nós NÃO cobramos taxas ou comissões sobre os serviços, NÃO intermediamos transações financeiras e NÃO retemos o dinheiro contratado.</strong> O valor total é pago <strong>diretamente ao prestador contratado</strong>, seja presencialmente através da <strong>maquininha de cartão do próprio profissional</strong>, em <strong>dinheiro vivo</strong> ou <strong>transferência bancária/PIX acordada entre as partes</strong>."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* SEÇÃO 3: LABORATÓRIO DE TESTE PRÁTICO (DIGITE SUA CHAVE PIX E VEJA) */}
            <Card className="rounded-[26px] border-[#dce5dc] bg-white p-6 shadow-sm">
              <div className="border-b border-[#edf1eb] pb-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[#8aa500] tracking-wider">
                      Painel de Simulação em Tempo Real
                    </span>
                    <h3 className="text-lg font-black text-[#173a34]">
                      Personalize os Dados para Testar o Fluxo
                    </h3>
                    <p className="text-xs text-[#71867f] mt-0.5">
                      Digite qualquer chave PIX sua, altere os valores e veja exatamente como fica para o cliente e para o autônomo.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTestPixKey("11987654321");
                      setTestPixType("telefone");
                      setTestProName("Carlos Eletricista & Instalações");
                      setTestClientName("Dona Maria Silva");
                      setTestServiceDesc("Troca de Disjuntor Geral e Fiação do Chuveiro");
                      setTestAmount("350,00");
                      setTestPaymentMethod("pix");
                      setTestPaymentCondition("sinal");
                      setIsTestConfirmedReceived(false);
                      toast.info("Dados de teste redefinidos.");
                    }}
                    className="rounded-xl border-[#dce5dc] text-xs font-semibold text-[#5c756d]"
                  >
                    Restaurar Padrão
                  </Button>
                </div>
              </div>

              {/* FORMULÁRIO DE ENTRADA DE DADOS DE TESTE */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 bg-[#fbfcf9] p-5 rounded-2xl border border-[#edf1eb]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-bold text-[#38584f]">
                      Chave PIX do Autônomo:
                    </Label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      BACEN EMV
                    </span>
                  </div>
                  <Input
                    type="text"
                    value={testPixKey}
                    onChange={(e) => setTestPixKey(e.target.value)}
                    placeholder="Ex: seu CPF, Celular, E-mail ou CNPJ"
                    className="h-10 rounded-xl border-[#dce5dc] text-xs font-mono font-bold"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTestPixKey("11999998888");
                        setTestPixType("telefone");
                        setTestProName("Prestador Exemplo");
                        toast.success("Chave Telefone de exemplo ativada!");
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition border ${
                        testPixKey === "11999998888"
                          ? "bg-emerald-700 text-white border-emerald-800"
                          : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300"
                      }`}
                    >
                      📱 Exemplo Celular
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestPixKey("contato@autonomo.com.br");
                        setTestPixType("email");
                        setTestProName("Prestador Exemplo");
                        toast.success("Chave E-mail de exemplo ativada!");
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition border ${
                        testPixKey === "contato@autonomo.com.br"
                          ? "bg-blue-700 text-white border-blue-800"
                          : "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300"
                      }`}
                    >
                      ✉️ Exemplo E-mail
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Tipo de Chave PIX:
                  </Label>
                  <select
                    value={testPixType}
                    onChange={(e: any) => setTestPixType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#dce5dc] bg-white px-3 text-xs font-medium text-[#173a34] focus:outline-hidden"
                  >
                    <option value="telefone">Celular / Telefone</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Nome do Profissional / Empresa:
                  </Label>
                  <Input
                    type="text"
                    value={testProName}
                    onChange={(e) => setTestProName(e.target.value)}
                    placeholder="Ex: Carlos Eletricista"
                    className="h-10 rounded-xl border-[#dce5dc] text-xs"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Nome do Cliente:
                  </Label>
                  <Input
                    type="text"
                    value={testClientName}
                    onChange={(e) => setTestClientName(e.target.value)}
                    placeholder="Ex: Dona Maria Silva"
                    className="h-10 rounded-xl border-[#dce5dc] text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Descrição do Serviço:
                  </Label>
                  <Input
                    type="text"
                    value={testServiceDesc}
                    onChange={(e) => setTestServiceDesc(e.target.value)}
                    placeholder="Ex: Instalação Elétrica Completa"
                    className="h-10 rounded-xl border-[#dce5dc] text-xs"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Valor Total do Serviço (R$):
                  </Label>
                  <Input
                    type="text"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="350,00"
                    className="h-10 rounded-xl border-[#dce5dc] text-xs font-bold font-mono text-emerald-800"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                    Condição de Pagamento:
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTestPaymentCondition("sinal")}
                      className={`flex-1 h-10 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        testPaymentCondition === "sinal"
                          ? "bg-[#173a34] text-white border-[#173a34]"
                          : "bg-white text-[#71867f] border-[#dce5dc]"
                      }`}
                    >
                      50% Sinal
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPaymentCondition("integral")}
                      className={`flex-1 h-10 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        testPaymentCondition === "integral"
                          ? "bg-[#173a34] text-white border-[#173a34]"
                          : "bg-white text-[#71867f] border-[#dce5dc]"
                      }`}
                    >
                      100% Final
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 lg:col-span-4 pt-2">
                  <Label className="mb-2 block text-xs font-bold text-[#38584f]">
                    Escolha a Forma de Pagamento para Simular:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setTestPaymentMethod("pix")}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition text-left cursor-pointer ${
                        testPaymentMethod === "pix"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs"
                          : "border-[#dce5dc] bg-white text-[#5c756d] hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${testPaymentMethod === "pix" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">1. PIX Direto</div>
                        <div className="text-[11px] text-[#71867f]">QR Code + Copia e Cola</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTestPaymentMethod("cartao")}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition text-left cursor-pointer ${
                        testPaymentMethod === "cartao"
                          ? "border-blue-600 bg-blue-50 text-blue-950 shadow-xs"
                          : "border-[#dce5dc] bg-white text-[#5c756d] hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${testPaymentMethod === "cartao" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">2. Cartão na Maquininha</div>
                        <div className="text-[11px] text-[#71867f]">No local do atendimento</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTestPaymentMethod("dinheiro")}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition text-left cursor-pointer ${
                        testPaymentMethod === "dinheiro"
                          ? "border-amber-600 bg-amber-50 text-amber-950 shadow-xs"
                          : "border-[#dce5dc] bg-white text-[#5c756d] hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${testPaymentMethod === "dinheiro" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">3. Dinheiro em Espécie</div>
                        <div className="text-[11px] text-[#71867f]">Cédulas na entrega</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* AS DUAS PONTAS: TELA DO CLIENTE VS TELA DO AUTÔNOMO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* LADO ESQUERDO: O QUE O CLIENTE VÊ NO WHATSAPP / NAVEGADOR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                        1
                      </div>
                      <h4 className="text-sm font-bold text-[#173a34]">
                        O que o Cliente Vê no Celular:
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-[#71867f]">
                      Link público da proposta
                    </span>
                  </div>

                  {/* MOCKUP DO SMARTPHONE DO CLIENTE */}
                  <div className="rounded-[28px] border-4 border-slate-800 bg-[#f4f7f1] p-4 shadow-xl text-[#173a34] max-w-md mx-auto">
                    {/* TOPO DO SMARTPHONE */}
                    <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#173a34] grid place-items-center text-white font-bold text-xs">
                          {testProName.charAt(0) || "P"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#173a34] leading-tight">{testProName}</div>
                          <div className="text-[10px] text-[#71867f]">Orçamento Oficial #2026-081</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-0">
                        Proposta Aberta
                      </Badge>
                    </div>

                    {/* DADOS DO CLIENTE E SERVIÇO */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#edf1eb] shadow-2xs space-y-2 mb-3">
                      <div className="text-[10px] font-bold uppercase text-[#71867f]">Destinatário:</div>
                      <div className="text-xs font-bold text-slate-800">{testClientName}</div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[#5c756d]">{testServiceDesc}</span>
                        <span className="font-mono font-black text-[#173a34]">R$ {testAmount}</span>
                      </div>
                    </div>

                    {/* CONDIÇÃO E DETALHE DO PAGAMENTO SELECIONADO */}
                    {testPaymentMethod === "pix" && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-3 shadow-2xs">
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          <QrCode className="h-3 w-3" />
                          PIX Direto ao Profissional
                        </div>

                        {/* BOTÕES DE TESTE DIRETO COM CHAVES REAIS DE MURILO */}
                        <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-300 space-y-1.5 shadow-2xs">
                          <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block">
                            👇 Testar com Chave de Exemplo:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setTestPixKey("11999998888");
                                setTestPixType("telefone");
                                setTestProName("Prestador Exemplo");
                                toast.success("📱 Chave Telefone de exemplo ativada!");
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer leading-tight ${
                                testPixKey === "11999998888"
                                  ? "bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-400"
                                  : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                              }`}
                            >
                              📱 Exemplo Celular
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTestPixKey("contato@autonomo.com.br");
                                setTestPixType("email");
                                setTestProName("Prestador Exemplo");
                                toast.success("✉️ Chave E-mail de exemplo ativada!");
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer leading-tight ${
                                testPixKey === "contato@autonomo.com.br"
                                  ? "bg-blue-700 text-white border-blue-800 shadow-xs ring-2 ring-blue-400"
                                  : "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
                              }`}
                            >
                              ✉️ Exemplo E-mail
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-emerald-950 font-medium">
                          {testPaymentCondition === "sinal"
                            ? `Pague o sinal de 50% para reservar a data:`
                            : `Pagamento do valor total acordado:`}
                        </div>

                        <div className="text-2xl font-black text-emerald-900 font-mono">
                          R$ {calculatedPixAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        {/* QR CODE GERADO COM PAYLOAD OFICIAL BACEN */}
                        <div className="mx-auto w-44 h-44 bg-white p-2 rounded-2xl border-2 border-emerald-400 shadow-md grid place-items-center">
                          <img
                            src={qrCodeUrl}
                            alt="QR Code PIX Oficial Padrão Banco Central"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>

                        {/* CHAVE E DADOS */}
                        <div className="space-y-1">
                          <div className="text-[11px] text-emerald-950 font-bold">
                            Chave ({testPixType.toUpperCase()}): <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">{testPixKey}</span>
                          </div>
                          <div className="text-[10px] text-emerald-800 font-medium">Favorecido: {testProName}</div>
                          <div className="text-[10px] text-emerald-800 bg-emerald-100/80 p-1.5 rounded-lg border border-emerald-200 text-left">
                            🎯 <strong>Padrão Oficial Banco Central (BR Code):</strong> Aponte a câmera do aplicativo do seu banco (Nubank, Itaú, Inter, etc.) para o QR Code acima ou use o Copia e Cola abaixo!
                          </div>
                        </div>

                        {/* BOTÕES DE COPIAR */}
                        <div className="space-y-1.5 pt-1">
                          <Button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(brCodePayload);
                              setTestCopiedBRCode(true);
                              toast.success("✅ Código PIX Copia e Cola (Padrão Banco Central) copiado! Pode colar na área 'Pix Copia e Cola' do seu banco.");
                              setTimeout(() => setTestCopiedBRCode(false), 2500);
                            }}
                            className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            {testCopiedBRCode ? <Check className="h-4 w-4 text-[#d9f56a]" /> : <Copy className="h-4 w-4" />}
                            <span>{testCopiedBRCode ? "Código Copiado! Cole no App do Banco" : "Copiar PIX Copia e Cola (Padrão Banco)"}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard?.writeText(testPixKey);
                              setTestCopiedRawKey(true);
                              toast.success(`Chave simples "${testPixKey}" copiada!`);
                              setTimeout(() => setTestCopiedRawKey(false), 2000);
                            }}
                            className="w-full h-8 rounded-xl border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {testCopiedRawKey ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{testCopiedRawKey ? "Chave Copiada!" : `Copiar Somente a Chave: ${testPixKey}`}</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {testPaymentMethod === "cartao" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-2.5 shadow-2xs">
                        <div className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          <CreditCard className="h-3 w-3" />
                          Cartão de Crédito / Débito
                        </div>
                        <div className="text-xl font-black text-blue-950 font-mono">
                          R$ {testAmount}
                        </div>
                        <p className="text-xs text-blue-900 leading-relaxed">
                          O profissional <strong>{testProName}</strong> levará sua <strong>maquininha de cartão</strong> física até o local do atendimento no dia agendado.
                        </p>
                        <div className="text-[11px] text-blue-800 bg-white p-2.5 rounded-xl border border-blue-200 font-medium">
                          💳 Débito à vista ou Crédito parcelado (conforme acordado previamente com o profissional).
                        </div>
                      </div>
                    )}

                    {testPaymentMethod === "dinheiro" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2.5 shadow-2xs">
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          <Banknote className="h-3 w-3" />
                          Pagamento em Dinheiro Vivo
                        </div>
                        <div className="text-xl font-black text-amber-950 font-mono">
                          R$ {testAmount}
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed">
                          O pagamento será realizado em cédulas diretamente a <strong>{testProName}</strong> na conclusão da entrega do serviço.
                        </p>
                        <div className="text-[11px] text-amber-800 bg-white p-2.5 rounded-xl border border-amber-200 font-medium">
                          💵 Caso necessite de troco, favor avisar o profissional antecipadamente pelo WhatsApp.
                        </div>
                      </div>
                    )}

                    {/* AVISO DE ISENÇÃO VISÍVEL PARA O CLIENTE */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-600 leading-tight">
                      🔒 <strong>Transação Direta:</strong> A plataforma MeuAutônomo não retém valores. A transação e a forma de quitação são acordadas exclusivamente entre cliente e prestador.
                    </div>

                    {/* BOTÃO DE APROVAÇÃO DO CLIENTE */}
                    <Button
                      type="button"
                      onClick={() => {
                        toast.success("Orçamento aprovado pelo cliente! Notificação enviada para o autônomo.");
                      }}
                      className="w-full mt-3 h-10 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#d9f56a]" />
                      <span>Aprovar Orçamento e Confirmar Termos</span>
                    </Button>
                  </div>
                </div>

                {/* LADO DIREITO: COMO O AUTÔNOMO CONFIRMA NO APP DELE */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-700 text-white text-xs font-bold">
                        2
                      </div>
                      <h4 className="text-sm font-bold text-[#173a34]">
                        Como o Autônomo Confirma no Aplicativo:
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Painel do Prestador
                    </span>
                  </div>

                  <Card className="rounded-[28px] border-2 border-[#dce5dc] bg-white p-5 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-[#edf1eb] pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#71867f]">Orçamento Ativo</span>
                        <h5 className="text-sm font-bold text-[#173a34]">{testServiceDesc}</h5>
                      </div>
                      <Badge
                        className={`text-xs font-bold border-0 ${
                          isTestConfirmedReceived
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {isTestConfirmedReceived ? "PAGO & RECEBIDO ✅" : "Aguardando Recebimento ⏳"}
                      </Badge>
                    </div>

                    {/* PASSO A PASSO DA CONFERÊNCIA */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8faf6] border border-[#edf1eb]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#173a34] text-[10px] font-bold text-[#d9f56a]">
                          A
                        </span>
                        <div>
                          <strong className="text-[#173a34] block">Conferência no Banco / Maquininha / Bolso:</strong>
                          <span className="text-[#5c756d] text-[11px]">
                            O autônomo abre o aplicativo do seu próprio banco (Nubank, Caixa, Itaú, etc.), confere se o PIX caiu, ou se o cliente passou o cartão ou pagou em dinheiro.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8faf6] border border-[#edf1eb]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#173a34] text-[10px] font-bold text-[#d9f56a]">
                          B
                        </span>
                        <div>
                          <strong className="text-[#173a34] block">Dar Baixa no Sistema:</strong>
                          <span className="text-[#5c756d] text-[11px]">
                            Assim que o dinheiro é confirmado em mãos ou em conta, ele aperta o botão abaixo no MeuAutônomo para dar a quitação oficial:
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTÃO DE CONFIRMAR RECEBIMENTO (DAR BAIXA) */}
                    {!isTestConfirmedReceived ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setIsTestConfirmedReceived(true);
                          toast.success("✅ Recebimento confirmado com sucesso! Recibo de Quitação gerado.");
                        }}
                        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.01]"
                      >
                        <CheckCircle2 className="h-5 w-5 text-[#d9f56a]" />
                        <span>Confirmar Recebimento de R$ {testAmount} (Dar Baixa)</span>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Recebimento Confirmado & Quitado no Sistema!</span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Valor de <strong>R$ {testAmount}</strong> lançado automaticamente no Fluxo de Caixa do autônomo.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsTestConfirmedReceived(false);
                            toast.info("Status revertido para pendente de recebimento.");
                          }}
                          className="w-full h-9 rounded-xl border-[#dce5dc] text-xs font-semibold text-[#71867f]"
                        >
                          Simular novamente (Desfazer Baixa)
                        </Button>
                      </div>
                    )}

                    {/* RECIBO OFICIAL DE QUITAÇÃO (GERADO AUTOMATICAMENTE) */}
                    {isTestConfirmedReceived && (
                      <div className="pt-2 border-t border-[#edf1eb] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#173a34] flex items-center gap-1.5">
                            <Receipt className="h-4 w-4 text-emerald-600" />
                            Recibo de Quitação Emitido:
                          </span>
                          <span className="text-[10px] font-mono text-[#71867f]">#REC-2026-9842</span>
                        </div>

                        {/* CORPO DO RECIBO */}
                        <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#dce5dc] font-sans text-xs space-y-2 text-[#173a34]">
                          <div className="text-center pb-2 border-b border-slate-200">
                            <strong className="block text-sm font-black text-[#173a34] uppercase tracking-wide">
                              Comprovante de Quitação de Serviço
                            </strong>
                            <span className="text-[10px] text-[#71867f]">Emitido através da plataforma MeuAutônomo</span>
                          </div>

                          <div className="space-y-1 text-[11px] leading-relaxed">
                            <div><strong>Prestador:</strong> {testProName}</div>
                            <div><strong>Cliente:</strong> {testClientName}</div>
                            <div><strong>Serviço Realizado:</strong> {testServiceDesc}</div>
                            <div><strong>Valor Total Quitado:</strong> <span className="font-mono font-bold text-emerald-800">R$ {testAmount}</span></div>
                            <div><strong>Forma de Pagamento:</strong> {testPaymentMethod.toUpperCase()} (Acordada diretamente)</div>
                            <div><strong>Data da Quitação:</strong> {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-100/60 border border-emerald-200 text-[10px] text-emerald-900 italic text-center">
                            "Declaramos para os devidos fins que o valor acima foi devidamente recebido e o serviço considerado liquidado e quitado."
                          </div>
                        </div>

                        {/* BOTÕES DE COMPARTILHAMENTO DO RECIBO */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              const receiptText = `*COMPROVANTE DE QUITAÇÃO & RECIBO* 📄✨\n\n• *Prestador:* ${testProName}\n• *Cliente:* ${testClientName}\n• *Serviço:* ${testServiceDesc}\n• *Valor Total:* R$ ${testAmount} (QUITADO ✅)\n• *Forma:* ${testPaymentMethod.toUpperCase()}\n• *Data:* ${new Date().toLocaleDateString("pt-BR")}\n\nAgradecemos pela preferência e confiança! 🤝`;
                              navigator.clipboard?.writeText(receiptText);
                              setTestReceiptCopied(true);
                              toast.success("Recibo copiado para envio no WhatsApp!");
                              setTimeout(() => setTestReceiptCopied(false), 2000);
                            }}
                            className="flex-1 h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>{testReceiptCopied ? "Copiado!" : "Copiar Recibo p/ WhatsApp"}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </Card>

            {/* SEÇÃO 4: RESUMO DE GARANTIA E SEGURANÇA */}
            <div className="rounded-[22px] bg-white border border-[#dce5dc] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#173a34]">
                    Total Clareza: Seu Negócio Protegido e o Autônomo Valorizado
                  </h4>
                  <p className="text-xs text-[#5c756d]">
                    O MeuAutônomo não tem custódia de dinheiro, não cobra taxa de transação e não se responsabiliza por inadimplência. Tudo é pactuado e quitado diretamente entre as partes.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setActiveTab("homologacao")}
                className="rounded-xl bg-[#173a34] text-white text-xs font-bold px-4 py-2 shrink-0 cursor-pointer"
              >
                Voltar à Homologação
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE RESET SEGURO */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md rounded-[28px] border-0 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-950">Confirmar Reset Geral</h3>
                <p className="text-xs text-rose-700">Esta ação é irreversível.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5c756d] leading-relaxed">
              Todos os registros gerados nos testes (orçamentos, clientes, agenda, faturamento) serão apagados para deixar o banco 100% zerado.
            </p>

            <div>
              <Label className="mb-1 block text-xs font-semibold text-[#38584f]">
                Digite a palavra <strong className="text-rose-600">ZERAR</strong> para confirmar:
              </Label>
              <Input
                type="text"
                placeholder="ZERAR"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value.toUpperCase())}
                className="h-10 rounded-xl border-[#dce5dc] font-bold tracking-widest text-center"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput("");
                }}
                className="rounded-xl border-[#dce5dc]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={resetConfirmInput !== "ZERAR" || resetMutation.isPending}
                onClick={() => resetMutation.mutate()}
                className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {resetMutation.isPending ? "Zerando..." : "Sim, zerar dados"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL DE ENVIO DE VOUCHER POR WHATSAPP */}
      {whatsAppModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg rounded-[28px] border-0 bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#edf1eb] pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#25D366]/20 text-[#173a34]">
                  <MessageSquare className="h-5 w-5 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#173a34]">
                    Enviar Convite via WhatsApp
                  </h3>
                  <p className="text-xs text-[#71867f]">
                    Voucher: <strong className="font-mono text-[#4c630f] bg-[#edf5da] px-1.5 py-0.5 rounded border border-[#d2e4a8]">{whatsAppModalVoucher.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalVoucher(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[#71867f] hover:text-[#173a34] hover:bg-slate-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                  Número do WhatsApp do Autônomo (Opcional):
                </Label>
                <Input
                  type="text"
                  placeholder="Ex: 11999998888 (ou deixe vazio para escolher o contato no WhatsApp)"
                  value={whatsAppRecipientPhone}
                  onChange={(e) => setWhatsAppRecipientPhone(e.target.value)}
                  className="h-10 rounded-xl border-[#dce5dc] text-sm"
                />
                <span className="text-[11px] text-[#71867f]">
                  Se preenchido com DDD, abre a conversa direta. Se vazio, abre o WhatsApp para você selecionar qualquer contato ou grupo.
                </span>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-bold text-[#38584f]">
                  Link da Plataforma:
                </Label>
                <Input
                  type="text"
                  value={whatsAppDomain}
                  onChange={(e) => setWhatsAppDomain(e.target.value)}
                  className="h-10 rounded-xl border-[#dce5dc] font-mono text-xs text-[#173a34]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-bold text-[#38584f]">
                    Prévia da Mensagem Formatada:
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = getVoucherWhatsAppMessage(whatsAppModalVoucher, whatsAppDomain);
                      navigator.clipboard?.writeText(msg);
                      setCopiedWhatsAppMsg(true);
                      toast.success("Mensagem completa copiada!");
                      setTimeout(() => setCopiedWhatsAppMsg(false), 2000);
                    }}
                    className="text-xs font-bold text-[#173a34] hover:text-[#4c630f] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWhatsAppMsg ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedWhatsAppMsg ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#dce5dc] text-xs font-sans text-[#173a34] whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {getVoucherWhatsAppMessage(whatsAppModalVoucher, whatsAppDomain)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWhatsAppModalVoucher(null)}
                className="rounded-xl border-[#dce5dc] text-xs font-bold"
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const msg = getVoucherWhatsAppMessage(whatsAppModalVoucher, whatsAppDomain);
                  const cleanPhone = whatsAppRecipientPhone.replace(/\D/g, "");
                  const url = cleanPhone
                    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(msg)}`
                    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                  window.open(url, "_blank");
                  toast.success("Abrindo WhatsApp...");
                }}
                className="rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Enviar no WhatsApp</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      <footer className="mt-12 pt-6 border-t border-[#dce5dc] pb-8 text-center text-xs text-[#71867f]">
        <p>
          Painel de Controle MeuAutônomo • Desenvolvido com excelência por <strong className="text-[#173a34]">CreativeAM</strong>
        </p>
      </footer>
    </div>
  );
}
