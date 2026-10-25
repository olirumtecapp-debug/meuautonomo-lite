import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatBrl } from "@/utils/currency";
import { cn } from "@/lib/utils";
import { getTeamRoleSuggestionsForProfession } from "@/data/servicesCatalog";
import {
  Briefcase,
  Building2,
  Check,
  CircleDollarSign,
  Clock,
  Coins,
  HelpCircle,
  Pencil,
  Percent,
  Plus,
  Share2,
  Upload,
  UserCheck,
  UserX,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Page,
  HelpButton,
  Metric,
  EmptyState,
  Field,
  FormSelect,
} from "./Workspace";

const money = (cents = 0) => formatBrl(cents);

export const PARTNER_BADGE_COLORS = [
  { name: "Verde Floresta", hex: "#28564d" },
  { name: "Roxo Estúdio", hex: "#7c3aed" },
  { name: "Rosa Elegante", hex: "#be123c" },
  { name: "Âmbar Dourado", hex: "#b45309" },
  { name: "Azul Profissional", hex: "#1d4ed8" },
  { name: "Turquesa", hex: "#0f766e" },
  { name: "Magenta Vibrante", hex: "#c026d3" },
  { name: "Chumbo", hex: "#334155" },
];

export function parsePartnerAvatar(notes?: string | null): {
  avatarUrl: string | null;
  cleanNotes: string;
} {
  if (!notes) return { avatarUrl: null, cleanNotes: "" };
  const match = notes.match(/\[avatar:([^\]]+)\]/);
  if (match) {
    return {
      avatarUrl: match[1],
      cleanNotes: notes.replace(/\[avatar:[^\]]+\]\s*/, "").trim(),
    };
  }
  return { avatarUrl: null, cleanNotes: notes };
}

export function IndividualTeamPromo() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const setTypeMutation = trpc.profile.setAccountType.useMutation({
    onSuccess: () => {
      toast.success("Modo Equipe & Estúdio ativado com sucesso!");
      utils.profile.get.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao mudar de modo.");
    },
  });

  return (
    <Page
      title="Módulo Equipe & Parceiros"
      eyebrow="Gerenciamento Avançado"
      description="Gerencie estúdios, oficinas, salões de beleza e colaboradores parceiros."
    >
      <div className="mx-auto max-w-2xl text-center py-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-purple-100 text-purple-700 mb-5 shadow-xs">
          <Users className="h-8 w-8" />
        </div>
        <span className="rounded-full bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 uppercase tracking-wider">
          Modo Equipe & Estúdio
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173a34] mt-3">
          Você está no modo MeuAutônomo Individual
        </h2>
        <p className="mt-3 text-sm text-[#5f756d] leading-relaxed max-w-xl mx-auto">
          No modo <strong>Individual</strong>, seu sistema foi configurado para ser ágil e focado exclusivamente nos seus atendimentos diretos, sem menus de equipe ou divisão de comissões.
        </p>

        <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50/50 p-6 text-left space-y-3 shadow-xs">
          <h4 className="font-bold text-sm text-purple-950 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-700" />
            Precisa gerenciar parceiros, salão ou ajudantes?
          </h4>
          <p className="text-xs text-purple-900/80 leading-relaxed">
            Ao ativar o <strong>Modo Equipe & Estúdio</strong>, você desbloqueia:
          </p>
          <ul className="text-xs text-purple-950 space-y-2 pl-1">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Cadastro de colaboradores e parceiros com fotos e especialidades</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Divisão automática de comissões e repasses (Lei do Salão-Parceiro)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Agenda simultânea para múltiplos profissionais sem conflito de horário</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Extrato de acerto no WhatsApp com chave PIX do parceiro</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => setTypeMutation.mutate({ accountType: "equipe" })}
            disabled={setTypeMutation.isPending}
            className="w-full sm:w-auto h-12 rounded-xl bg-purple-700 text-white hover:bg-purple-800 font-bold px-6 text-sm cursor-pointer shadow-sm"
          >
            <Users className="mr-2 h-4 w-4" /> Ativar Modo Equipe & Estúdio Agora
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/app")}
            className="w-full sm:w-auto h-12 rounded-xl border-[#dce5dc] bg-white text-[#173a34] font-semibold px-6 text-sm cursor-pointer"
          >
            Voltar ao Meu Início
          </Button>
        </div>
      </div>
    </Page>
  );
}

export function TeamPage() {
  const [period, setPeriod] = useState<"hoje" | "semana" | "mes" | "tudo">("mes");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const range = useMemo(() => {
    const now = new Date();
    if (period === "hoje") {
      const dStr = now.toISOString().split("T")[0];
      return { from: `${dStr}T00:00:00.000Z`, to: `${dStr}T23:59:59.999Z` };
    }
    if (period === "semana") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (period === "mes") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (from || to) {
      return {
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
      };
    }
    return { from: undefined, to: undefined };
  }, [period, from, to]);

  const report = trpc.team.report.useQuery(range);
  const teamList = trpc.team.list.useQuery();
  const profile = trpc.profile.get.useQuery();
  const services = trpc.service.list.useQuery();
  const utils = trpc.useUtils();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const emptyForm = {
    name: "",
    role: "",
    phone: "",
    email: "",
    pixKey: "",
    pixKeyType: "cpf" as "cpf" | "email" | "telefone" | "aleatoria",
    commissionPercent: "50",
    color: "#28564d",
    avatarUrl: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const uploadAvatarMutation = trpc.team.uploadAvatar.useMutation();

  const createMember = trpc.team.create.useMutation({
    onSuccess: () => {
      toast.success("Profissional parceiro(a) cadastrado(a) com sucesso!");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
      setModalOpen(false);
      setEditingMember(null);
    },
    onError: (err) => {
      const msg = err.message || "";
      if (msg.includes("email") || msg.includes("Invalid email") || msg.includes("invalid_string")) {
        toast.error("E-mail do parceiro inválido.");
      } else {
        toast.error(msg || "Erro ao cadastrar parceiro.");
      }
    },
  });

  const updateMember = trpc.team.update.useMutation({
    onSuccess: () => {
      toast.success("Dados do parceiro atualizados.");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
      setModalOpen(false);
      setEditingMember(null);
    },
    onError: (err) => {
      const msg = err.message || "";
      if (msg.includes("email") || msg.includes("Invalid email") || msg.includes("invalid_string")) {
        toast.error("E-mail do parceiro inválido.");
      } else {
        toast.error(msg || "Erro ao atualizar parceiro.");
      }
    },
  });

  const toggleActive = trpc.team.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status do profissional atualizado.");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
    },
  });

  const openNew = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (member: any) => {
    setEditingMember(member);
    const parsed = parsePartnerAvatar(member.notes);
    setForm({
      name: member.name,
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      pixKey: member.pixKey || "",
      pixKeyType: member.pixKeyType || "cpf",
      commissionPercent: String(member.commissionPercent || 50),
      color: member.color || "#28564d",
      avatarUrl: parsed.avatarUrl || "",
      notes: parsed.cleanNotes || "",
    });
    setModalOpen(true);
  };

  const submitMember = () => {
    if (!form.name.trim())
      return toast.error("Informe o nome do profissional parceiro.");
    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return toast.error("Telefone/WhatsApp do parceiro deve conter DDD e 8 ou 9 dígitos.");
      }
    }
    if (form.email && form.email.trim()) {
      const emailTrim = form.email.trim();
      if (!emailTrim.includes("@") || !emailTrim.includes(".")) {
        return toast.error("Informe um e-mail válido para o parceiro.");
      }
    }
    const comm = Number(form.commissionPercent);
    if (isNaN(comm) || comm < 0 || comm > 100)
      return toast.error("A comissão deve ser uma porcentagem entre 0% e 100%.");

    let combinedNotes = form.notes.trim();
    if (form.avatarUrl) {
      combinedNotes = `[avatar:${form.avatarUrl}]\n${combinedNotes}`.trim();
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || "Profissional Parceiro(a)",
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      pixKey: form.pixKey.trim() || undefined,
      pixKeyType: form.pixKeyType,
      commissionPercent: comm,
      color: form.color,
      notes: combinedNotes || undefined,
    };

    if (editingMember) {
      updateMember.mutate({ id: editingMember.id, ...payload });
    } else {
      createMember.mutate(payload);
    }
  };

  const periodLabel =
    period === "hoje"
      ? "Hoje"
      : period === "semana"
      ? "Esta Semana"
      : period === "mes"
      ? "Este Mês"
      : "Geral / Período Selecionado";

  const handleSendWhatsAppReport = (memberStats: any, memberInfo: any) => {
    const studioName = profile.data?.displayName || "Nosso Espaço";
    const partnerName = memberInfo?.name || "Parceiro(a)";
    const totalAppointments = memberStats?.count || 0;
    const gross = money(memberStats?.grossCents || 0);
    const commVal = money(memberStats?.commissionCents || 0);
    const commPct = memberInfo?.commissionPercent ?? 50;
    const studioNet = money(memberStats?.studioCents || 0);
    const pix = memberInfo?.pixKey
      ? `${(memberInfo.pixKeyType || "PIX").toUpperCase()}: ${memberInfo.pixKey}`
      : "A combinar";

    const text =
      `*FECHAMENTO DE REPASSES - ${studioName.toUpperCase()}*\n\n` +
      `Olá *${partnerName}*! Segue o extrato de atendimentos e comissões referente a *${periodLabel}*:\n\n` +
      `💅 *Atendimentos realizados:* ${totalAppointments}\n` +
      `💰 *Faturamento Total Gerado:* ${gross}\n` +
      `✂️ *Sua Comissão (${commPct}%):* ${commVal}\n` +
      `🏢 *Retenção Estúdio/Espaço:* ${studioNet}\n\n` +
      `🔑 *Dados PIX para Acerto:*\n${pix}\n\n` +
      `_Extrato emitido com base na Lei do Salão-Parceiro (Lei 13.352). Qualquer dúvida estou à disposição!_`;

    const rawPhone = (memberInfo?.phone || "").replace(/\D/g, "");
    if (rawPhone) {
      window.open(
        `https://wa.me/55${rawPhone.replace(/^55/, "")}?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else {
      navigator.clipboard?.writeText(text);
      toast.success(
        "Extrato copiado para a área de transferência! Cole no WhatsApp do profissional."
      );
    }
  };

  const roleData = useMemo(() => {
    return getTeamRoleSuggestionsForProfession(
      profile.data?.professionName,
      profile.data?.professionCategory || undefined
    );
  }, [profile.data?.professionName, profile.data?.professionCategory]);

  const activeMembersCount = (teamList.data || []).filter((m) => m.active).length;

  return (
    <Page
      title="Equipe & Parceiros"
      eyebrow="Módulo Estúdio & Salão-Parceiro"
      description="Gerencie profissionais parceiros, acompanhe a produção de cada um, apure repasses de comissão e envie o extrato direto no WhatsApp."
      help={
        <HelpButton title="Como funciona o Módulo de Equipe?">
          <p>
            <strong>Salão e Estúdio Parceiro (Lei 13.352/2016):</strong>
          </p>
          <p>
            Permite que você cadastre múltiplos profissionais autônomos que atendem no seu espaço com divisão transparente de comissões (ex: 50%/50%, 60%/40%).
          </p>
          <p>
            <strong>Vantagens:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Agendamentos simultâneos:</strong> Profissionais diferentes podem atender clientes no mesmo horário sem choque de agenda.
            </li>
            <li>
              <strong>Cálculo Automático:</strong> Toda receita registrada calcula na hora o repasse do parceiro e o lucro líquido do salão.
            </li>
            <li>
              <strong>Extrato no WhatsApp:</strong> Em 1 clique, você envia o demonstrativo detalhado com os totais apurados e a chave PIX do parceiro.
            </li>
          </ul>
        </HelpButton>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {(["hoje", "semana", "mes", "tudo"] as const).map((key) => {
              const label =
                key === "hoje"
                  ? "Hoje"
                  : key === "semana"
                  ? "Semana"
                  : key === "mes"
                  ? "Mês"
                  : "Geral";
              return (
                <Button
                  key={key}
                  variant="ghost"
                  onClick={() => setPeriod(key)}
                  className={cn(
                    "h-9 rounded-lg px-3 text-xs",
                    period === key
                      ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white"
                      : "text-[#71867f]"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <Button
            onClick={openNew}
            className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo(a) parceiro(a)
          </Button>
        </div>
      }
    >
      <div className="mb-6 rounded-2xl border border-[#d9e7bf] bg-[#f7faed] p-4 text-xs leading-relaxed text-[#4d6642]">
        <div className="flex items-center gap-2 font-bold text-[#2d4724] text-sm mb-1">
          <Building2 className="h-4 w-4 text-[#8aa500]" />
          <span>Gestão Profissional para Estúdios e Espaços Compartilhados</span>
        </div>
        Cadastre os profissionais parceiros que utilizam sua estrutura. O MeuAutônomo cuida da apuração de receitas, divide a comissão combinada e facilita o acerto de contas sem burocracia ou risco trabalhista.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Parceiros Ativos"
          value={String(activeMembersCount)}
          hint="profissionais cadastrados"
          icon={Users}
          accent="lime"
        />
        <Metric
          title="Faturamento da Equipe"
          value={money(report.data?.totalGrossCents || 0)}
          hint={`em atendimentos (${periodLabel})`}
          icon={CircleDollarSign}
          accent="green"
        />
        <Metric
          title="Comissões a Repassar"
          value={money(report.data?.totalCommissionCents || 0)}
          hint="total a pagar aos parceiros"
          icon={Percent}
          accent="orange"
        />
        <Metric
          title="Lucro do Estúdio"
          value={money(report.data?.totalStudioNetCents || 0)}
          hint="retenção líquida do espaço"
          icon={WalletCards}
          accent="blue"
        />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#173a34]">Profissionais Parceiros</h2>
            <p className="text-xs text-[#82948e]">
              Acompanhe o faturamento individual e envie o extrato de acerto com um clique.
            </p>
          </div>
        </div>

        {teamList.isLoading ? (
          <div className="p-8 text-center text-sm text-[#82948e]">
            Carregando parceiros...
          </div>
        ) : !teamList.data?.length ? (
          <EmptyState
            icon={UserCheck}
            title="Nenhum parceiro cadastrado ainda"
            description={
              profile.data?.professionName
                ? `Cadastre profissionais parceiros para atender clientes em ${profile.data.professionName}.`
                : "Cadastre profissionais parceiros que trabalham com você para dividir comissões e multiplicar atendimentos."
            }
            action={
              <Button
                onClick={openNew}
                className="rounded-xl bg-[#173a34] text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Cadastrar primeiro(a) parceiro(a)
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamList.data.map((member) => {
              const parsed = parsePartnerAvatar(member.notes);
              const stats = (report.data?.breakdown || []).find(
                (b: any) => b.member.id === member.id
              ) || {
                grossCents: 0,
                commissionCents: 0,
                studioCents: 0,
                count: 0,
              };

              return (
                <Card
                  key={member.id}
                  className={cn(
                    "rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] transition",
                    !member.active && "opacity-60 bg-[#f9fbf8]"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-bold text-white shadow-sm overflow-hidden shrink-0"
                          style={{ backgroundColor: member.color || "#28564d" }}
                        >
                          {parsed.avatarUrl ? (
                            <img
                              src={parsed.avatarUrl}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#173a34] text-base truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs font-medium text-[#71867f] truncate">
                            {member.role || "Profissional Parceiro(a)"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "border-0 text-[10px]",
                          member.active
                            ? "bg-[#eef5d2] text-[#6d8000]"
                            : "bg-[#f1f3f1] text-[#82948e]"
                        )}
                      >
                        {member.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#f5f8f2] p-4 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[#556e66]">
                        <span>Atendimentos:</span>
                        <strong className="text-[#173a34] font-bold">
                          {stats.count}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-[#556e66]">
                        <span>Produção bruta:</span>
                        <strong className="text-[#173a34] font-bold">
                          {money(stats.grossCents)}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-[#556e66] pt-1 border-t border-[#e2ece2]">
                        <span className="font-bold text-emerald-800">
                          Comissão ({member.commissionPercent}%):
                        </span>
                        <strong className="text-emerald-800 font-extrabold text-sm">
                          {money(stats.commissionCents)}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-[#556e66]">
                        <span>Retenção do estúdio:</span>
                        <strong className="text-[#173a34] font-semibold">
                          {money(stats.studioCents)}
                        </strong>
                      </div>
                    </div>

                    {member.pixKey && (
                      <p className="mt-3 text-[11px] text-[#71867f] truncate">
                        PIX ({(member.pixKeyType || "cpf").toUpperCase()}):{" "}
                        <span className="font-mono font-medium text-[#173a34]">
                          {member.pixKey}
                        </span>
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#edf1eb] pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendWhatsAppReport(stats, member)}
                        className="rounded-xl border-[#dce5dc] text-xs font-semibold text-[#173a34] hover:bg-[#eaf4eb] flex-1"
                      >
                        <Share2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />{" "}
                        Extrato WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(member)}
                        className="h-9 w-9 p-0 rounded-xl text-[#71867f] hover:text-[#173a34]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toggleActive.mutate({
                            id: member.id,
                            active: !member.active,
                          })
                        }
                        className={cn(
                          "h-9 w-9 p-0 rounded-xl",
                          member.active
                            ? "text-[#71867f] hover:text-rose-600"
                            : "text-[#71867f] hover:text-emerald-600"
                        )}
                        title={
                          member.active
                            ? "Desativar profissional"
                            : "Reativar profissional"
                        }
                      >
                        {member.active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de cadastro/edição de profissional parceiro */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {editingMember
                ? "Editar Profissional Parceiro(a)"
                : "Novo(a) Profissional Parceiro(a)"}
            </DialogTitle>
            <DialogDescription>
              Cadastre o profissional, defina a porcentagem de comissão e os dados para repasse de pagamentos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            {/* Foto de Perfil do Parceiro */}
            <div>
              <Label className="mb-2 block font-semibold text-[#173a34]">
                Foto de Perfil do(a) Parceiro(a)
              </Label>
              <div className="flex items-center gap-4">
                <div
                  className="grid h-16 w-16 place-items-center rounded-2xl text-xl font-bold text-white shadow-sm overflow-hidden shrink-0"
                  style={{ backgroundColor: form.color || "#28564d" }}
                >
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt={form.name || "Foto"}
                      className="h-full w-full object-cover"
                    />
                  ) : form.name ? (
                    form.name.charAt(0).toUpperCase()
                  ) : (
                    <Users className="h-6 w-6 text-white/80" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploadAvatarMutation.isPending}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        return toast.error("A foto deve ter no máximo 2MB.");
                      }
                      const mime = file.type as "image/jpeg" | "image/png" | "image/webp";
                      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
                        return toast.error("Formato de imagem inválido. Use JPG, PNG ou WEBP.");
                      }
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = String(reader.result);
                        try {
                          const res = await uploadAvatarMutation.mutateAsync({
                            fileName: file.name || "avatar.jpg",
                            mimeType: mime,
                            dataUrl: base64,
                          });
                          setForm((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
                          toast.success("Foto carregada com sucesso!");
                        } catch {
                          toast.error("Erro ao enviar a foto do parceiro.");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[#173a34] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-[#28564d]"
                  />
                  <p className="text-[11px] text-[#71867f]">
                    PNG, JPG ou WEBP de até 2MB. Aparece nos relatórios e extratos.
                  </p>
                </div>
              </div>

              {/* PALETA DE CORES PARA O CRACHÁ / AGENDA */}
              <div className="pt-2 mt-2 border-t border-[#edf1eb]">
                <span className="text-[11px] font-semibold text-[#526d64] block mb-2">
                  Cor de destaque nos agendamentos e relatórios:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {PARTNER_BADGE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c.hex }))}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={cn(
                        "h-7 w-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white shadow-2xs",
                        form.color === c.hex
                          ? "ring-2 ring-offset-2 ring-[#173a34] scale-110"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      )}
                    >
                      {form.color === c.hex && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                value={form.name}
                onChange={(val) => setForm({ ...form, name: val })}
                placeholder="Ex.: Jéssica Oliveira"
              />
              <Field
                label="Especialidade / Cargo"
                value={form.role}
                onChange={(val) => setForm({ ...form, role: val })}
                placeholder={roleData.placeholder}
              />
            </div>

            {/* Sugestões inteligentes de especialidades baseadas na profissão do estúdio */}
            {roleData.suggestions.length > 0 && (
              <div className="rounded-xl bg-[#f5f8f2] p-3 border border-[#dce5dc]">
                <p className="text-[11px] font-semibold text-[#5a7369] mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#8aa500]" />
                  <span>
                    Sugestões comuns para seu segmento ({profile.data?.professionName || "seu ramo"}):
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roleData.suggestions.map((sug) => {
                    const isSelected = form.role.toLowerCase() === sug.toLowerCase();
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setForm({ ...form, role: sug })}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer border",
                          isSelected
                            ? "bg-[#173a34] text-white border-[#173a34] shadow-xs"
                            : "bg-white text-[#2f4a41] border-[#dce5dc] hover:bg-[#eef5e6]"
                        )}
                      >
                        {sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="WhatsApp / Telefone"
                value={form.phone}
                onChange={(val) => setForm({ ...form, phone: val })}
                placeholder="(00) 00000-0000"
              />
              <Field
                label="E-mail (opcional)"
                value={form.email}
                onChange={(val) => setForm({ ...form, email: val })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="rounded-2xl bg-[#f5f8f2] p-4 border border-[#dce5dc] space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-[#173a34]">
                  Comissão do(a) Parceiro(a)
                </Label>
                <span className="text-base font-black text-[#173a34] bg-white px-2.5 py-1 rounded-xl border border-[#dce5dc] shadow-2xs">
                  {form.commissionPercent}%
                </span>
              </div>
              <p className="text-xs text-[#6d837c]">
                Porcentagem que o profissional recebe sobre o valor de cada atendimento realizado.
              </p>

              {/* Botões de porcentagens comuns */}
              <div className="grid grid-cols-4 gap-2">
                {["40", "50", "60", "70"].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, commissionPercent: pct })}
                    className={cn(
                      "h-10 rounded-xl font-bold text-xs transition",
                      form.commissionPercent === pct
                        ? "bg-[#173a34] text-[#d9f56a] border-[#173a34] shadow-sm"
                        : "bg-white text-slate-700 hover:bg-[#eef5e6]"
                    )}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              {/* Campo para digitar porcentagem personalizada */}
              <div className="pt-1">
                <Label className="text-[11px] font-semibold text-[#5a7369] block mb-1.5">
                  Ou digite outra porcentagem personalizada:
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.commissionPercent}
                    onChange={(e) =>
                      setForm({ ...form, commissionPercent: e.target.value })
                    }
                    onBlur={(e) => {
                      const num = Number(e.target.value);
                      if (isNaN(num) || num < 0) {
                        setForm({ ...form, commissionPercent: "0" });
                        toast.error("Comissão mínima é 0%.");
                      } else if (num > 100) {
                        setForm({ ...form, commissionPercent: "100" });
                        toast.error("Comissão máxima é 100%.");
                      }
                    }}
                    className="h-11 rounded-xl bg-white pr-9 text-sm font-bold text-[#173a34] border-[#dce5dc] focus:border-[#173a34]"
                    placeholder="Ex.: 45"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormSelect
                label="Tipo da Chave PIX"
                value={form.pixKeyType}
                onChange={(val) => setForm({ ...form, pixKeyType: val as any })}
                options={[
                  { value: "cpf", label: "CPF" },
                  { value: "telefone", label: "Telefone" },
                  { value: "email", label: "E-mail" },
                  { value: "aleatoria", label: "Chave Aleatória" },
                ]}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Chave PIX para repasse"
                  value={form.pixKey}
                  onChange={(val) => setForm({ ...form, pixKey: val })}
                  placeholder="Informe a chave PIX do profissional"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Observações do acordo / Contrato
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex.: Dias de atendimento na semana, regras de produtos ou materiais utilizados..."
                className="rounded-xl border-[#dce5dc]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={submitMember}
              disabled={createMember.isPending || updateMember.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              {editingMember ? "Salvar Alterações" : "Cadastrar Parceiro(a)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

export function TeamModuleView({ isIndividual }: { isIndividual: boolean }) {
  if (isIndividual) return <IndividualTeamPromo />;
  return <TeamPage />;
}

export default TeamPage;
