import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Clock3,
  CreditCard,
  History,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  LogOut,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  Send,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trash2,
  UserRound,
  Users,
  UserCheck,
  UserX,
  Percent,
  MessageSquare,
  Building2,
  WalletCards,
  X,
  HelpCircle,
  Globe,
  Info,
  QrCode,
  Receipt,
  Smartphone,
  Lightbulb,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SERVICE_CATALOG, getRecommendedServicesForProfession, getServicePlaceholderForProfession, getTeamRoleSuggestionsForProfession } from "../data/servicesCatalog";
import { ALL_PROFESSIONS_FLAT, POPULAR_PROFESSIONS, findCategoryForProfession, getProfessionsByCategory } from "../data/professions";
import { checkServiceSpelling } from "../utils/serviceSpellcheck";
import { StateCitySelect } from "@/components/StateCitySelect";
import { ReceiptModal, type ReceiptData } from "@/components/ReceiptModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { lookupCep, formatCep } from "@/utils/cep";
import { formatBrl, formatBrlInput, parseBrlToCents } from "@/utils/currency";
import { GuidedTutorialModal } from "@/components/GuidedTutorialModal";
import { SimulatorTour } from "@/components/SimulatorTour";
import { TeamModuleView } from "./TeamPage";
import { ClientsPage } from "./ClientsPage";
export { ClientsPage };
import { ServicesPage, CatalogPicker } from "./ServicesPage";
export { ServicesPage, CatalogPicker };


export const money = (cents = 0) => formatBrl(cents);
export const dateLabel = (date: Date | string) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(" de ", " ");
export const timeLabel = (date: Date | string) => new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"; };
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const formatPhone = (val: string = "") => {
  if (!val) return "";
  const digits = String(val).replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatIsoToDateInput = (val: string | Date | null | undefined): string => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusLabel: Record<string, string> = { agendado: "Agendado", confirmado: "Confirmado", andamento: "Em andamento", concluido: "Concluído", cancelado: "Cancelado", faltou: "Não compareceu", nova: "Nova", em_analise: "Em análise", orcamento_enviado: "Orçamento enviado", proposta_aceita: "Proposta aceita", agendada: "Agendada", arquivada: "Arquivada", rascunho: "Rascunho", enviado: "Enviado", aceito: "Aceito", recusado: "Recusado", alteracao_solicitada: "Alteração solicitada" };
const statusClass: Record<string, string> = { concluido: "bg-[#e3f5e3] text-[#2c7a45]", confirmado: "bg-[#e1effa] text-[#23638e]", agendado: "bg-[#fff4d7] text-[#906815]", nova: "bg-[#eef5c8] text-[#667700]", enviado: "bg-[#e8eef8] text-[#496b98]", aceito: "bg-[#e3f5e3] text-[#2c7a45]", proposta_aceita: "bg-[#e3f5e3] text-[#2c7a45]", pendente: "bg-[#fff4d7] text-[#906815]", pago: "bg-[#e3f5e3] text-[#2c7a45]", parcial: "bg-[#e8eef8] text-[#496b98]", cancelado: "bg-[#f9e5e3] text-[#9c4d43]" };
export const modalityLabel: Record<string, string> = { presencial: "No seu espaço", endereco: "No endereço do cliente", online: "Online", hibrido: "Híbrido" };

export function AppHome() {
  const { user, loading: authLoading } = useAuth();
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    retry: false,
    enabled: Boolean(user),
  });

  if (authLoading || (user && profileQuery.isLoading)) return <LoadingScreen />;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.replace("/?login=true");
    }
    return <LoadingScreen />;
  }
  if (!profileQuery.data) return <Onboarding />;
  return <DashboardLayout><Workspace /></DashboardLayout>;
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-[#f5f7f2]"><div className="flex items-center gap-3 text-[#58716b]"><RefreshCcw className="h-5 w-5 animate-spin" /> Carregando seu espaço…</div></div>;
}

function ProfessionSelectField({
  professionName,
  professionCategory,
  onChange,
}: {
  professionName: string;
  professionCategory: string;
  onChange: (name: string, category: string) => void;
}) {
  const initialCat = useMemo(() => {
    if (professionCategory) return professionCategory;
    if (professionName) return findCategoryForProfession(professionName);
    return "";
  }, [professionCategory, professionName]);

  const isKnownCat = POPULAR_PROFESSIONS.some(
    (c) => c.category.toLowerCase() === initialCat.toLowerCase()
  );

  const [chosenCategory, setChosenCategory] = useState<string>(
    initialCat ? (isKnownCat ? initialCat : "__outra_categoria__") : ""
  );

  const [customCategory, setCustomCategory] = useState<string>(
    initialCat && !isKnownCat ? initialCat : ""
  );

  const availableProfessions = useMemo(() => {
    if (!chosenCategory || chosenCategory === "__outra_categoria__") return [];
    return getProfessionsByCategory(chosenCategory);
  }, [chosenCategory]);

  const isKnownProf = availableProfessions.some(
    (p) => p.toLowerCase() === (professionName || "").trim().toLowerCase()
  );

  const [isCustomProf, setIsCustomProf] = useState<boolean>(
    Boolean(professionName && !isKnownProf)
  );

  const activeCatObj = POPULAR_PROFESSIONS.find(
    (c) => c.category.toLowerCase() === chosenCategory.toLowerCase()
  );

  const handleCategoryChange = (val: string) => {
    setChosenCategory(val);
    if (val === "__outra_categoria__") {
      setIsCustomProf(true);
      onChange(professionName || "", customCategory || "Outros Serviços");
    } else {
      const newProfList = getProfessionsByCategory(val);
      const stillValid = newProfList.some(
        (p) => p.toLowerCase() === (professionName || "").trim().toLowerCase()
      );
      if (!stillValid) {
        setIsCustomProf(false);
        onChange("", val);
      } else {
        onChange(professionName, val);
      }
    }
  };

  const handleProfessionChange = (val: string) => {
    if (val === "__outra_profissao__") {
      setIsCustomProf(true);
      onChange("", chosenCategory);
    } else {
      setIsCustomProf(false);
      onChange(val, chosenCategory);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-4 sm:p-5">
      {/* 1º PASSO: MODALIDADE / RAMO DE ATUAÇÃO */}
      <div className="space-y-2 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <Label className="text-sm font-bold text-[#173a34] flex items-center gap-1.5 flex-wrap">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#173a34] text-[11px] font-bold text-[#d9f56a] shrink-0">
              1
            </span>
            <span>Modalidade / Área de atuação</span>
          </Label>
          <span className="text-[11px] font-medium text-[#7a938c] shrink-0">
            Ramo do seu serviço
          </span>
        </div>

        <Select value={chosenCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-12 w-full rounded-xl border-[#dce5dc] bg-white text-sm font-semibold text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15">
            <SelectValue placeholder="Selecione a modalidade (ex.: Casa e manutenção, Beleza...)" />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-2xl border-[#dce5dc] shadow-xl">
            {POPULAR_PROFESSIONS.map((cat) => (
              <SelectItem
                key={cat.category}
                value={cat.category}
                className="py-2.5 text-sm font-medium hover:bg-[#f0f5ec]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.category}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem
              value="__outra_categoria__"
              className="mt-1 border-t border-[#edf1eb] py-2.5 text-sm font-bold text-[#627912] bg-[#f8faf2]"
            >
              ✍️ Outra modalidade / ramo (digitar livremente)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CASO SEJA CATEGORIA MANUAL */}
      {chosenCategory === "__outra_categoria__" && (
        <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-white p-3.5 border border-[#dce5dc] w-full min-w-0">
          <div className="min-w-0">
            <Label className="mb-1.5 block text-xs font-bold text-[#38584f]">
              Nome da Modalidade / Área
            </Label>
            <Input
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                onChange(professionName, e.target.value);
              }}
              placeholder="Ex.: Artesanato, Náutica..."
              className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
            />
          </div>
          <div className="min-w-0">
            <Label className="mb-1.5 block text-xs font-bold text-[#38584f]">
              Sua Atividade / Profissão
            </Label>
            <Input
              value={professionName}
              onChange={(e) => onChange(e.target.value, customCategory || "Serviços Gerais")}
              placeholder="Ex.: Tapeceiro náutico, Ceramista..."
              className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
            />
          </div>
        </div>
      )}

      {/* 2º PASSO: ATIVIDADE ESPECÍFICA (ABRE APÓS ESCOLHER A MODALIDADE) */}
      {chosenCategory && chosenCategory !== "__outra_categoria__" && (
        <div className="space-y-2 pt-2 border-t border-[#edf1eb] w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <Label className="text-sm font-bold text-[#173a34] flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#173a34] text-[11px] font-bold text-[#d9f56a] shrink-0">
                2
              </span>
              <span className="break-words">Atividade / Profissão ({activeCatObj?.category})</span>
            </Label>
            <span className="text-[11px] font-medium text-[#7a938c] shrink-0">
              Escolha sua especialidade
            </span>
          </div>

          {!isCustomProf ? (
            <Select
              value={professionName || undefined}
              onValueChange={handleProfessionChange}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-[#dce5dc] bg-white text-sm font-semibold text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15">
                <SelectValue placeholder={`Escolha sua atividade em ${activeCatObj?.category}...`} />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border-[#dce5dc] shadow-xl">
                {availableProfessions.map((prof) => (
                  <SelectItem key={prof} value={prof} className="py-2.5 text-sm font-medium">
                    {prof}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__outra_profissao__"
                  className="mt-1 border-t border-[#edf1eb] py-2.5 text-sm font-bold text-[#627912] bg-[#f8faf2]"
                >
                  ✍️ Outra profissão nesta área...
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2 rounded-xl bg-white p-3.5 border border-[#dce5dc] w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <Label className="text-xs font-bold text-[#38584f]">
                  Digite o nome da sua atividade:
                </Label>
                <button
                  type="button"
                  onClick={() => setIsCustomProf(false)}
                  className="text-xs font-semibold text-[#173a34] underline hover:text-[#557718]"
                >
                  Voltar para lista de {activeCatObj?.category}
                </button>
              </div>
              <Input
                value={professionName}
                onChange={(e) => onChange(e.target.value, chosenCategory)}
                placeholder="Ex.: Técnico especialista em aquecedores..."
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm font-medium focus:border-[#173a34]"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* SE AINDA NÃO ESCOLHEU A MODALIDADE */}
      {!chosenCategory && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#dce5dc] bg-[#f4f7f1] p-3 text-xs text-[#6e857e]">
          <span className="text-sm shrink-0">💡</span>
          <span>Selecione a modalidade acima no <strong>passo 1</strong> para liberar a lista de atividades correspondentes.</span>
        </div>
      )}

      {/* BADGE DE CONFIRMAÇÃO VISUAL */}
      {chosenCategory && professionName && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#4e6a61]">
          <span className="font-semibold text-[#284b42] shrink-0">Seu perfil profissional:</span>
          <span className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-[#f1f7dd] px-3 py-1 font-bold text-[#566c0e] max-w-full break-words">
            {activeCatObj?.icon && <span className="shrink-0">{activeCatObj.icon}</span>}
            <span className="break-words">{chosenCategory === "__outra_categoria__" ? (customCategory || "Personalizado") : chosenCategory}</span>
            <ChevronRight className="h-3 w-3 text-[#7a931a] shrink-0" />
            <span className="text-[#173a34] break-words">{professionName}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function PublicAddressField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const hostDomain = typeof window !== "undefined" && window.location.host
    ? window.location.host
    : "meuautonomo.creativeam.com.br";
  const displayPrefix = `${hostDomain}/p/`;

  const cleanValue = value === "administrador-geral" || value === "administrador" ? "" : value;

  return (
    <div className="space-y-2 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <Label className="text-sm font-bold text-[#173a34] flex items-center gap-1.5 flex-wrap">
          Link do seu Cartão Digital / Perfil Profissional
        </Label>
        <span className="text-[11px] font-medium text-[#7a938c] shrink-0">
          Link para WhatsApp e Bio
        </span>
      </div>

      <p className="text-xs text-[#526d64] leading-relaxed">
        Este é o link que você vai mandar para seus clientes no WhatsApp e redes sociais. Eles vão abrir esse link para ver seus serviços, fotos e pedir orçamentos.
      </p>

      <div className="flex flex-col sm:flex-row w-full rounded-xl border border-[#dce5dc] bg-[#fbfcf9] shadow-sm transition focus-within:border-[#173a34] focus-within:ring-2 focus-within:ring-[#173a34]/15 overflow-hidden min-w-0">
        <span className="flex h-10 sm:h-12 shrink-0 select-none items-center border-b sm:border-b-0 sm:border-r border-[#dce5dc] bg-[#eff5ec] px-3 text-xs font-bold text-[#2d4b42] truncate max-w-full">
          {displayPrefix}
        </span>
        <input
          type="text"
          value={cleanValue}
          onChange={(e) => onChange(slugify(e.target.value))}
          placeholder="ex: carlos-silva ou studio-bella"
          spellCheck={false}
          className="h-10 sm:h-12 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[#173a34] outline-none placeholder:text-[#9bad9a]"
        />
      </div>

      <p className="text-xs text-[#738a82] break-all">
        🔗 Seus clientes acessarão:{" "}
        <strong className="text-[#173a34] break-all">
          https://{displayPrefix}{cleanValue || "seu-nome-ou-negocio"}
        </strong>
      </p>
    </div>
  );
}

export function ServiceNameField({
  value,
  onChange,
  onSelectCatalog,
  professionName,
  placeholder,
  label = "Nome do serviço",
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectCatalog?: (name: string, description?: string, price?: string, duration?: string) => void;
  professionName?: string;
  placeholder?: string;
  label?: string;
}) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [autoFixed, setAutoFixed] = useState<{ from: string; to: string; explanation?: string } | null>(null);

  const dynamicPlaceholder = useMemo(() => {
    return placeholder || getServicePlaceholderForProfession(professionName || "");
  }, [placeholder, professionName]);

  const spellcheck = useMemo(() => {
    return checkServiceSpelling(value);
  }, [value]);

  const professionSuggestions = useMemo(() => {
    if (!professionName) return [];
    return getRecommendedServicesForProfession(professionName).slice(0, 6);
  }, [professionName]);

  const showCorrection = spellcheck.hasCorrection && dismissed !== spellcheck.correctedText;
  const showCatalog =
    spellcheck.catalogSuggestion &&
    spellcheck.catalogSuggestion.name.toLowerCase() !== value.trim().toLowerCase() &&
    dismissed !== spellcheck.catalogSuggestion.name;

  const handleBlur = () => {
    if (spellcheck.hasCorrection && spellcheck.correctedText !== value.trim()) {
      const orig = value;
      const fixed = spellcheck.correctedText;
      const explanation = spellcheck.explanation || "Ortografia ajustada";
      onChange(fixed);
      setAutoFixed({ from: orig, to: fixed, explanation });
      toast.info(explanation, {
        description: `Ajustado de "${orig}" para "${fixed}".`,
        action: {
          label: "Desfazer",
          onClick: () => {
            onChange(orig);
            setDismissed(fixed);
            setAutoFixed(null);
          },
        },
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-[#38584f] flex items-center gap-1.5">
          {label}
        </Label>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#708818] bg-[#f4f8e6] px-2 py-0.5 rounded-full border border-[#e1ecc2]">
          <Sparkles className="h-3 w-3" /> Corretor ortográfico ativo
        </span>
      </div>

      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (autoFixed && e.target.value !== autoFixed.to) {
              setAutoFixed(null);
            }
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" && spellcheck.hasCorrection) {
              e.preventDefault();
              onChange(spellcheck.correctedText);
              setDismissed(spellcheck.correctedText);
            }
          }}
          placeholder={dynamicPlaceholder}
          spellCheck={true}
          lang="pt-BR"
          autoCorrect="on"
          autoCapitalize="sentences"
          className={cn(
            "h-12 rounded-xl bg-white text-sm font-medium transition",
            showCorrection
              ? "border-2 border-amber-400 bg-amber-50/20 pr-28 text-[#173a34] focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
              : "border-[#dce5dc] text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15"
          )}
        />
        {showCorrection && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 animate-in fade-in">
            <AlertTriangle className="h-3 w-3 text-amber-700" />
            {spellcheck.correctionType === "spelling" ? "Ortografia" : spellcheck.correctionType === "capitalization" ? "Formatação" : "Falta acento"}
          </span>
        )}
      </div>

      {/* FEEDBACK DE CORREÇÃO AUTOMÁTICA COM BOTÃO DESFAZER */}
      {autoFixed && autoFixed.to === value && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 transition animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">✓</span>
            <span>{autoFixed.explanation || "Ajuste aplicado"}: de <span className="line-through text-emerald-700">"{autoFixed.from}"</span> para <strong className="font-bold text-emerald-950">"{autoFixed.to}"</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(autoFixed.from);
              setDismissed(autoFixed.to);
              setAutoFixed(null);
            }}
            className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 transition cursor-pointer"
          >
            Desfazer
          </button>
        </div>
      )}

      {/* ALERTA DE ERRO DE ORTOGRAFIA / ACENTUAÇÃO ENQUANTO DIGITA */}
      {showCorrection && (!autoFixed || autoFixed.to !== value) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-xs shadow-sm transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start sm:items-center gap-2.5 text-amber-950">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-900 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-amber-800" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                {spellcheck.correctionType === "spelling"
                  ? "Ajuste de ortografia sugerido"
                  : spellcheck.correctionType === "capitalization"
                  ? "Ajuste de formatação sugerido"
                  : "Acentuação recomendada"}
              </p>
              <p className="text-amber-900 text-xs mt-0.5">
                Você digitou <span className="line-through font-semibold text-amber-800">"{value}"</span>. Sugestão recomendada: <strong className="font-bold underline text-amber-950 decoration-amber-600 decoration-2">"{spellcheck.correctedText}"</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                onChange(spellcheck.correctedText);
                setDismissed(spellcheck.correctedText);
              }}
              className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition cursor-pointer"
            >
              Corrigir para "{spellcheck.correctedText}"
            </button>
            <button
              type="button"
              onClick={() => setDismissed(spellcheck.correctedText)}
              className="rounded-lg px-2.5 py-1.5 text-xs text-amber-800 hover:bg-amber-200/50 transition cursor-pointer"
              title="Ignorar sugestão"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* SUGESTÃO DE SERVIÇO PADRÃO DO CATÁLOGO */}
      {!showCorrection && showCatalog && spellcheck.catalogSuggestion && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#cbe4ee] bg-[#eef7fa] p-2.5 text-xs transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-[#225063]">
            <Sparkles className="h-4 w-4 shrink-0 text-[#2a7796]" />
            <span>
              Sugestão do catálogo: <strong className="font-bold text-[#103848]">"{spellcheck.catalogSuggestion.name}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onSelectCatalog) {
                  onSelectCatalog(spellcheck.catalogSuggestion!.name, spellcheck.catalogSuggestion!.description);
                } else {
                  onChange(spellcheck.catalogSuggestion!.name);
                }
                setDismissed(spellcheck.catalogSuggestion!.name);
              }}
              className="rounded-lg bg-[#246781] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#194e63] transition"
            >
              Usar sugestão
            </button>
            <button
              type="button"
              onClick={() => setDismissed(spellcheck.catalogSuggestion!.name)}
              className="rounded-lg px-2 py-1 text-[11px] text-[#5b7a87] hover:bg-black/5 transition"
              title="Dispensar sugestão"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* CHIPS DE SUGESTÕES RÁPIDAS BASEADAS NA PROFISSÃO DO USUÁRIO */}
      {professionSuggestions.length > 0 && !value && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-[#6e857e]">
            ✨ Sugestões prontas para {professionName} (clique para preencher):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {professionSuggestions.map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => {
                  if (onSelectCatalog) {
                    onSelectCatalog(sug.name, sug.description, sug.price, sug.durationMinutes);
                  } else {
                    onChange(sug.name);
                  }
                }}
                className="rounded-lg border border-[#dce5dc] bg-[#fbfcf9] px-2.5 py-1 text-xs font-medium text-[#2d4b42] hover:border-[#173a34] hover:bg-white hover:text-[#173a34] transition"
              >
                + {sug.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Onboarding() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<"individual" | "equipe">("individual");

  // Nunca pré-preencher com nomes de sistema/admin genéricos
  const isSystemAdminName = Boolean(
    user?.name &&
    (user.name.toLowerCase().includes("admin") ||
     user.name.toLowerCase().includes("administrador") ||
     user.name.toLowerCase().includes("geral") ||
     user.name.toLowerCase().includes("master"))
  );
  const initialName = isSystemAdminName ? "" : (user?.name || "");
  const initialSlug = isSystemAdminName ? "" : slugify(user?.name || "");

  const [profession, setProfession] = useState({
    displayName: initialName,
    professionCategory: "",
    professionName: "",
    city: "",
    serviceRegion: "",
    slug: initialSlug,
    bio: "",
  });
  const [service, setService] = useState({
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
    modality: "presencial" as "presencial" | "endereco" | "online" | "hibrido",
  });
  const [schedule, setSchedule] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    start: "08:00",
    end: "18:00",
  });

  const profileMutation = trpc.profile.upsert.useMutation();
  const serviceMutation = trpc.service.create.useMutation();
  const availabilityMutation = trpc.profile.saveAvailability.useMutation();

  const recommendedServices = useMemo(() => {
    return getRecommendedServicesForProfession(profession.professionName, profession.professionCategory);
  }, [profession.professionName, profession.professionCategory]);

  const servicePlaceholder = useMemo(() => {
    return getServicePlaceholderForProfession(profession.professionName);
  }, [profession.professionName]);

  const saveProfile = async () => {
    if (!profession.displayName.trim()) return toast.error("Informe seu nome ou o nome do seu negócio.");
    if (!profession.professionName.trim()) return toast.error("Selecione ou informe sua profissão.");
    if (!profession.slug.trim()) return toast.error("Informe o link do seu cartão digital.");

    try {
      const spellBio = profession.bio ? checkServiceSpelling(profession.bio) : null;
      const finalBio = spellBio?.hasCorrection ? spellBio.correctedText : profession.bio;
      await profileMutation.mutateAsync({
        ...profession,
        accountType,
        professionCategory: profession.professionCategory || "Serviços Gerais",
        city: profession.city || undefined,
        serviceRegion: profession.serviceRegion || undefined,
        bio: finalBio || undefined,
        showPrices: true,
        bookingEnabled: false,
      });
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar seu perfil.");
    }
  };

  const saveService = async () => {
    if (!service.name.trim()) return toast.error("Dê um nome para seu primeiro serviço.");
    const spell = checkServiceSpelling(service.name);
    const finalName = spell.hasCorrection ? spell.correctedText : service.name;
    try {
      await serviceMutation.mutateAsync({
        name: finalName,
        description: service.description || undefined,
        durationMinutes: Number(service.durationMinutes),
        priceCents: parseBrlToCents(service.price),
        modality: service.modality,
      });
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar seu serviço.");
    }
  };

  const finish = async () => {
    const days = Object.entries(schedule)
      .filter(([key, value]) => ["mon", "tue", "wed", "thu", "fri", "sat"].includes(key) && value)
      .map(([key]) => key);
    try {
      await availabilityMutation.mutateAsync({
        schedule: JSON.stringify({ days, start: schedule.start, end: schedule.end }),
        unavailableDays: JSON.stringify([]),
      });
      toast.success("Seu espaço está pronto para começar!");
      window.location.href = "/app";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar sua agenda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <img src="/logo.png" alt="MeuAutônomo" className="h-10 sm:h-12 w-auto object-contain" />
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#dce5dc] bg-white px-3.5 py-1.5 text-xs text-[#526d64] shadow-xs">
              <span>
                Conectado como: <strong className="text-[#173a34]">{user.email || user.name}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                title="Sair desta conta para criar ou entrar com outra"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair / Trocar conta
              </button>
            </div>
          )}
        </div>

        {isSystemAdminName && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-950">Atenção: Você está conectado com a conta de Administrador ({user?.email}).</p>
              <p className="mt-1 text-amber-800">
                Se você deseja cadastrar uma conta nova para testar os modos e o fluxo como cliente do zero, clique em <strong>Sair desta conta</strong> para abrir a tela de novo cadastro.
              </p>
              <div className="mt-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                  className="rounded-xl border-amber-400 bg-white font-bold text-amber-900 hover:bg-amber-100 text-xs h-8"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair do Administrador e Cadastrar do Zero
                </Button>
              </div>
            </div>
          </div>
        )}

        {step > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-2">
            <Step n={1} active={step >= 1} label="Você" />
            <Step n={2} active={step >= 2} label="Serviço" />
            <Step n={3} active={step >= 3} label="Agenda" />
          </div>
        )}

        <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_60px_rgba(19,42,39,0.08)]">
          <div className="h-2 bg-[#d9f56a]" />
          <CardContent className="p-6 sm:p-10">
            {step === 0 && (
              <>
                <div className="text-center mb-8">
                  <span className="inline-block rounded-full bg-[#173a34] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#d9f56a]">
                    ✨ Boas-vindas ao MeuAutônomo
                  </span>
                  <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#173a34] tracking-tight">
                    Como você vai trabalhar?
                  </h1>
                  <p className="mt-2 text-sm text-[#6b817a] max-w-xl mx-auto">
                    Escolha o modo de uso ideal para a sua rotina. O sistema ajustará os menus, agenda e orçamentos para ficar 100% sob medida para você.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* CARD 1: INDIVIDUAL */}
                  <div
                    onClick={() => {
                      setAccountType("individual");
                      setStep(1);
                    }}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-2xl border-2 p-6 transition-all cursor-pointer hover:shadow-lg",
                      accountType === "individual"
                        ? "border-[#173a34] bg-[#f9fbf8] shadow-md"
                        : "border-[#dce5dc] bg-white hover:border-[#173a34]/60"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815] group-hover:scale-105 transition-transform">
                          <UserRound className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-[#173a34] px-3 py-1 text-[11px] font-bold text-[#d9f56a]">
                          Solo / Individual
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-[#173a34]">MeuAutônomo Individual</h2>
                        <p className="text-xs font-semibold text-[#8aa500] mt-0.5">
                          Trabalho por conta própria
                        </p>
                        <p className="mt-2 text-xs text-[#526d64] leading-relaxed">
                          Você atua sozinho(a), prestando seus próprios serviços diretamente para seus clientes, sem sócios, funcionários ou divisão de comissões.
                        </p>
                      </div>

                      <div className="space-y-2 rounded-xl bg-white p-3.5 border border-[#edf1eb] text-xs">
                        <p className="font-bold text-[#173a34] text-[11px] uppercase tracking-wider">
                          O que inclui no seu dia a dia:
                        </p>
                        <div className="space-y-1.5 text-[#3e564e]">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#8aa500] shrink-0" />
                            <span><strong>Cartão Digital com PIX</strong> para por na bio</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#8aa500] shrink-0" />
                            <span><strong>Catálogo de Serviços</strong> e preços</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#8aa500] shrink-0" />
                            <span><strong>Orçamentos no WhatsApp</strong> profissionais</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#8aa500] shrink-0" />
                            <span><strong>Agenda Pessoal</strong> limpa e sem conflitos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#8aa500] shrink-0" />
                            <span><strong>Recibos em PDF</strong> com 1 clique</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#6b817a] bg-[#f4f7f2] p-2.5 rounded-lg leading-relaxed">
                        <strong>Ideal para:</strong> Eletricista, encanador, pintor, marido de aluguel, manicure solo, diarista, técnico, consultor, etc.
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#edf1eb]">
                      <Button
                        type="button"
                        className="w-full h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] font-bold text-xs"
                      >
                        Começar no Modo Individual <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* CARD 2: EQUIPE & ESTÚDIO */}
                  <div
                    onClick={() => {
                      setAccountType("equipe");
                      setStep(1);
                    }}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-2xl border-2 p-6 transition-all cursor-pointer hover:shadow-lg",
                      accountType === "equipe"
                        ? "border-[#173a34] bg-[#f9fbf8] shadow-md"
                        : "border-[#dce5dc] bg-white hover:border-[#173a34]/60"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3e8ff] text-purple-700 group-hover:scale-105 transition-transform">
                          <Users className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-purple-700 px-3 py-1 text-[11px] font-bold text-white">
                          Equipe & Estúdio
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-[#173a34]">MeuAutônomo Equipe & Estúdio</h2>
                        <p className="text-xs font-semibold text-purple-700 mt-0.5">
                          Tenho equipe, parceiros ou ajudantes
                        </p>
                        <p className="mt-2 text-xs text-[#526d64] leading-relaxed">
                          Você gerencia um espaço compartilhado ou coordena outros profissionais e precisa controlar quem atendeu e ratear comissões.
                        </p>
                      </div>

                      <div className="space-y-2 rounded-xl bg-white p-3.5 border border-[#edf1eb] text-xs">
                        <p className="font-bold text-[#173a34] text-[11px] uppercase tracking-wider">
                          Tudo do Individual + Módulo Equipe:
                        </p>
                        <div className="space-y-1.5 text-[#3e564e]">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600 shrink-0" />
                            <span><strong>Cadastro de Membros</strong> e parceiros</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600 shrink-0" />
                            <span><strong>Taxas & Comissões (%)</strong> automáticas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600 shrink-0" />
                            <span><strong>Agenda Simultânea</strong> com filtro por membro</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600 shrink-0" />
                            <span><strong>Relatório de Repasses PIX</strong> da equipe</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600 shrink-0" />
                            <span><strong>Lei do Salão-Parceiro</strong> (segurança jurídica)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#6b817a] bg-[#f4f7f2] p-2.5 rounded-lg leading-relaxed">
                        <strong>Ideal para:</strong> Salões de beleza, barbearias, estúdios de estética, oficinas, empreiteiras de reformas e prestadores com ajudantes.
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#edf1eb]">
                      <Button
                        type="button"
                        className="w-full h-11 rounded-xl bg-purple-700 text-white hover:bg-purple-800 font-bold text-xs"
                      >
                        Começar no Modo Equipe <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-[#71867f]">
                  💡 <strong>Fique tranquilo(a):</strong> Você pode alternar livremente entre os modos a qualquer momento nas <strong>Configurações</strong> sem perder nenhum dado.
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <div className="mb-6 flex items-center justify-between rounded-xl bg-[#f4f7f2] px-4 py-2.5 text-xs text-[#526d64]">
                  <span>
                    Modo selecionado: <strong>{accountType === "individual" ? "👤 Individual (Trabalho por conta própria)" : "👥 Equipe & Estúdio (Com parceiros)"}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="font-bold text-[#173a34] underline hover:text-[#8aa500] cursor-pointer"
                  >
                    Alterar modo
                  </button>
                </div>

                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 1 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  O que você faz?
                </h1>
                <p className="mb-8 max-w-xl text-[#6b817a]">
                  Vamos deixar seu espaço com a sua cara. Selecione sua profissão ou escreva como você atua.
                </p>

                <div className="space-y-5">
                  <div className="space-y-4">
                    <Field
                      label="Seu Nome Profissional ou Nome do Negócio"
                      value={profession.displayName}
                      onChange={(value) => {
                        const newSlug = !profession.slug || profession.slug === slugify(profession.displayName)
                          ? slugify(value)
                          : profession.slug;
                        setProfession({ ...profession, displayName: value, slug: newSlug });
                      }}
                      placeholder="Ex.: Carlos Ferreira ou Studio Bella"
                      helpText="Como você deseja ser apresentado aos seus clientes nos orçamentos, agendamentos e no seu cartão digital."
                      spellCheck={true}
                    />

                    <StateCitySelect
                      value={profession.city}
                      onChange={(cityVal) =>
                        setProfession({
                          ...profession,
                          city: cityVal,
                          serviceRegion: cityVal ? `${cityVal} e região` : "",
                        })
                      }
                      helpText="Escolha onde você presta seus serviços para clientes encontrarem você mais fácil."
                    />
                  </div>

                  <ProfessionSelectField
                    professionName={profession.professionName}
                    professionCategory={profession.professionCategory}
                    onChange={(name, category) =>
                      setProfession({
                        ...profession,
                        professionName: name,
                        professionCategory: category,
                      })
                    }
                  />

                  <PublicAddressField
                    value={profession.slug}
                    onChange={(value) => setProfession({ ...profession, slug: value })}
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="text-sm font-semibold text-[#38584f]">
                        Uma frase sobre seu trabalho <span className="font-normal text-[#9bad9a]">(opcional)</span>
                      </Label>
                      <span className={`text-[11px] font-medium ${(profession.bio?.length || 0) > 450 ? "text-amber-600 font-bold" : "text-[#71867f]"}`}>
                        {profession.bio?.length || 0} / 500 caracteres
                      </span>
                    </div>
                    <Textarea
                      maxLength={500}
                      value={profession.bio}
                      onChange={(e) => setProfession({ ...profession, bio: e.target.value })}
                      placeholder="Conte rapidamente como você ajuda seus clientes… Ex.: Especialista em reparos residenciais rápidos com garantia e pontualidade."
                      spellCheck={true}
                      lang="pt-BR"
                      className="min-h-24 rounded-2xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={saveProfile}
                    disabled={profileMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 2 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  Qual serviço você oferece?
                </h1>
                <p className="mb-6 max-w-xl text-[#6b817a]">
                  Comece com o seu principal serviço. Você poderá cadastrar outros depois.
                </p>

                {/* BLOCO DE SUGESTÕES VINCULADAS À PROFISSÃO/ATIVIDADE DO PASSO 1 */}
                {recommendedServices.length > 0 && (
                  <div className="mb-8 rounded-2xl border-2 border-[#173a34]/15 bg-gradient-to-br from-[#f6f9f5] via-white to-[#edf5ec] p-4 sm:p-5 shadow-sm">
                    <div className="flex items-start sm:items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173a34] text-white shadow-sm">
                          <Sparkles className="h-4 w-4 text-[#d5eb77]" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-[#173a34]">
                            Sugestões prontas para <span className="underline decoration-[#8aa500] decoration-2 underline-offset-4">{profession.professionName || "sua atividade"}</span>
                          </h2>
                          <p className="text-xs text-[#526d64] mt-0.5">
                            Clique em uma opção pronta para preencher com 1 clique (você pode ajustar os valores):
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {recommendedServices.map((rec) => {
                        const isSelected = service.name.trim().toLowerCase() === rec.name.trim().toLowerCase();
                        return (
                          <button
                            key={rec.name}
                            type="button"
                            onClick={() => {
                              setService({
                                ...service,
                                name: rec.name,
                                description: rec.description || service.description,
                                price: rec.price || service.price || "80,00",
                                durationMinutes: rec.durationMinutes || service.durationMinutes || "60",
                              });
                              toast.success(`Serviço "${rec.name}" selecionado!`, {
                                description: "Campos preenchidos. Ajuste o valor ou tempo abaixo se desejar.",
                              });
                            }}
                            className={cn(
                              "group relative flex flex-col justify-between text-left p-3.5 rounded-xl border transition-all cursor-pointer",
                              isSelected
                                ? "border-[#173a34] bg-emerald-50/80 shadow-sm ring-2 ring-[#173a34]"
                                : "border-[#d8e3dc] bg-white hover:border-[#173a34]/60 hover:bg-[#fafcfa] hover:shadow-sm"
                            )}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="font-semibold text-xs sm:text-[13px] text-[#173a34] group-hover:text-[#0f2723] line-clamp-1">
                                  {rec.name}
                                </span>
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Escolhido
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-[#718b82] group-hover:text-[#173a34] font-medium shrink-0">
                                    + Escolher
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#617a72] line-clamp-2 leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-dashed border-[#e2ece5] flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#173a34] bg-[#edf4ee] px-2 py-0.5 rounded-md">
                                R$ {rec.price || "80,00"}
                              </span>
                              <span className="text-[#647c74] font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {rec.durationMinutes || "60"} min
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 my-6">
                  <div className="h-px flex-1 bg-[#e0eae3]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7a928a]">
                    {service.name ? "Confirme ou personalize os dados abaixo" : "Ou digite seu serviço personalizado"}
                  </span>
                  <div className="h-px flex-1 bg-[#e0eae3]" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <ServiceNameField
                      label="Nome do serviço"
                      value={service.name}
                      onChange={(value) => setService({ ...service, name: value })}
                      onSelectCatalog={(name, description, price, duration) =>
                        setService({
                          ...service,
                          name,
                          description: description || service.description,
                          price: price || service.price,
                          durationMinutes: duration || service.durationMinutes,
                        })
                      }
                      professionName={profession.professionName}
                      placeholder={servicePlaceholder}
                    />
                  </div>
                  <Field
                    label="Preço inicial"
                    value={service.price}
                    onChange={(value) => setService({ ...service, price: value })}
                    placeholder="150,00"
                    prefix="R$ "
                  />
                  <Field
                    label="Duração estimada (minutos)"
                    value={service.durationMinutes}
                    onChange={(value) => setService({ ...service, durationMinutes: value })}
                    placeholder="60"
                  />
                </div>
                <div className="mt-5">
                  <Label className="mb-2 block text-sm text-[#38584f]">Como você atende?</Label>
                  <Select
                    value={service.modality}
                    onValueChange={(value: typeof service.modality) =>
                      setService({ ...service, modality: value })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">No meu espaço</SelectItem>
                      <SelectItem value="endereco">No endereço do cliente</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-5">
                  <Label className="mb-2 block text-sm font-semibold text-[#38584f]">
                    Descrição <span className="font-normal text-[#9bad9a]">(opcional)</span>
                  </Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => setService({ ...service, description: e.target.value })}
                    placeholder="O que está incluído neste serviço? Ex.: Atendimento completo com materiais de qualidade e garantia inclusa."
                    spellCheck={true}
                    lang="pt-BR"
                    className="min-h-24 rounded-2xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
                  />
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl text-[#58716b]">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    onClick={saveService}
                    disabled={serviceMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 3 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  Quando você trabalha?
                </h1>
                <p className="mb-8 max-w-xl text-[#6b817a]">
                  Isso ajuda a evitar conflitos e mostra seus horários de atendimento.
                </p>
                <div>
                  <Label className="mb-3 block text-sm text-[#38584f]">Dias de trabalho</Label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["mon", "Seg"],
                      ["tue", "Ter"],
                      ["wed", "Qua"],
                      ["thu", "Qui"],
                      ["fri", "Sex"],
                      ["sat", "Sáb"],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSchedule({ ...schedule, [key]: !schedule[key] })}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                          schedule[key]
                            ? "border-[#173a34] bg-[#173a34] text-white"
                            : "border-[#dce5dc] bg-[#fbfcf9] text-[#78908a]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm text-[#38584f]">Começo</Label>
                    <Input
                      type="time"
                      value={schedule.start}
                      onChange={(e) => setSchedule({ ...schedule, start: e.target.value })}
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm text-[#38584f]">Fim</Label>
                    <Input
                      type="time"
                      value={schedule.end}
                      onChange={(e) => setSchedule({ ...schedule, end: e.target.value })}
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
                    />
                  </div>
                </div>
                <div className="mt-8 rounded-2xl bg-[#f1f7dd] p-4 text-sm text-[#52694e]">
                  <CheckCircle2 className="mb-2 h-5 w-5 text-[#8aa500]" />
                  <strong>Quase lá.</strong> Você poderá ajustar horários, adicionar serviços e compartilhar seu cartão a qualquer momento.
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-xl text-[#58716b]">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    onClick={finish}
                    disabled={availabilityMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Ir para meu espaço <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step({ n, active, label }: { n: number; active: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm font-semibold", active ? "text-[#173a34]" : "text-[#9bad9a]")}>
      <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs", active ? "bg-[#d9f56a] text-[#173a34]" : "bg-[#e7eee5] text-[#9bad9a]")}>
        {n}
      </span>
      {label}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  type,
  helpText,
  spellCheck = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  type?: string;
  helpText?: string;
  spellCheck?: boolean;
}) {
  const isPhone = type === "tel" || label.toLowerCase().includes("telefone") || label.toLowerCase().includes("whatsapp");
  const isCurrency = prefix === "R$ " || prefix === "R$" || type === "currency" || label.toLowerCase().includes("preço") || label.toLowerCase().includes("desconto") || label.toLowerCase() === "valor";

  const effectivePlaceholder = placeholder || (isPhone ? "(11) 98765-4321" : isCurrency ? "0,00" : undefined);
  const displayValue = isPhone ? formatPhone(value) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPhone) {
      onChange(formatPhone(e.target.value));
    } else if (isCurrency) {
      if (e.target.value.includes("-")) {
        toast.error("Valores monetários não podem ser negativos.");
        return;
      }
      if (/[a-zA-Z]/.test(e.target.value)) {
        toast.error("Digite apenas números para valores em reais.");
      }
      const raw = e.target.value.replace(/[^\d.,]/g, "");
      onChange(raw);
    } else {
      onChange(e.target.value);
    }
  };

  const handleBlur = () => {
    if (isCurrency && value) {
      const cents = parseBrlToCents(value);
      if (cents > 100_000_000) {
        toast.error("O valor máximo permitido é de R$ 1.000.000,00.");
        onChange("1.000.000,00");
        return;
      }
      const formatted = formatBrlInput(value);
      if (formatted && formatted !== value) {
        onChange(formatted);
      }
    }
  };

  const effectiveInputMode = isPhone ? "tel" : isCurrency ? "decimal" : undefined;
  const effectiveType = isPhone ? "tel" : isCurrency ? "text" : (type || "text");

  return (
    <div className="space-y-1.5 w-full min-w-0">
      <Label className="block text-sm font-semibold text-[#38584f]">{label}</Label>
      {prefix || isCurrency ? (
        <div className="flex h-12 w-full min-w-0 items-center rounded-xl border border-[#dce5dc] bg-[#fbfcf9] shadow-sm transition focus-within:border-[#173a34] focus-within:ring-2 focus-within:ring-[#173a34]/15 overflow-hidden">
          <span className="flex h-full shrink-0 select-none items-center border-r border-[#dce5dc] bg-[#eff5ec] px-3.5 text-xs font-bold text-[#557168] sm:text-sm">
            {prefix || "R$ "}
          </span>
          <input
            type={effectiveType}
            inputMode={effectiveInputMode}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={effectivePlaceholder}
            spellCheck={!isPhone && !isCurrency && spellCheck}
            lang="pt-BR"
            autoCorrect="on"
            autoCapitalize="sentences"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[#173a34] outline-none placeholder:text-[#9bad9a]"
          />
        </div>
      ) : (
        <Input
          type={effectiveType}
          inputMode={effectiveInputMode}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={effectivePlaceholder}
          spellCheck={!isPhone && spellCheck}
          lang="pt-BR"
          className="h-12 w-full min-w-0 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm font-medium focus:border-[#173a34]"
        />
      )}
      {helpText && <p className="text-xs text-[#71867f] leading-relaxed break-words">{helpText}</p>}
    </div>
  );
}

function Workspace() {
  const [location, setLocation] = useLocation();
  const route = location === "/" ? "/app" : location;
  const profileQuery = trpc.profile.get.useQuery();
  const isIndividual = profileQuery.data?.accountType === "individual";

  if (route === "/app") return <Dashboard />;
  if (route === "/meu-dia") return <MeuDia />;
  if (route === "/relatorios") return <Reports />;
  if (route === "/agenda") return <Agenda />;
  if (route === "/clientes") return <Clients />;
  if (route === "/servicos") return <Services />;
  if (route === "/solicitacoes") return <Requests />;
  if (route === "/orcamentos") return <Quotes />;
  if (route === "/financeiro") return <Finance />;
  if (route === "/equipe") return <TeamModuleView isIndividual={isIndividual} />;
  if (route === "/cartao") return <ProfessionalCard />;
  if (route === "/tutorial" || route === "/guia") return <TutorialPage />;
  if (route === "/configuracoes") return <SettingsPage />;
  setLocation("/app");
  return null;
}

export function HelpButton({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)} title="Como funciona?" className="grid h-6 w-6 place-items-center rounded-full text-[#9bad9a] transition hover:text-[#8aa500]"><HelpCircle className="h-5 w-5" /></button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle className="text-[#173a34]">{title}</DialogTitle></DialogHeader><div className="space-y-4 py-2 text-sm leading-6 text-[#526d64]">{children}</div></DialogContent></Dialog>
  </>;
}

export function Page({ title, eyebrow, description, action, help, children }: { title: string; eyebrow?: string; description?: string; action?: React.ReactNode; help?: React.ReactNode; children: React.ReactNode }) { return <div className="container mx-auto px-3.5 sm:px-6 py-5 sm:py-6 md:py-10 max-w-7xl w-full min-w-0 overflow-x-hidden"><div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div className="min-w-0"><p className="mb-1.5 sm:mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">{eyebrow || "MeuAutônomo"}</p><div className="flex items-center gap-2 flex-wrap"><h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#173a34] break-words">{title}</h1>{help}</div>{description && <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm text-[#6d837c]">{description}</p>}</div>{action && <div className="flex flex-wrap items-center gap-2 shrink-0 max-w-full">{action}</div>}</div>{children}</div>; }
export function EmptyState({ icon: Icon, title, description, action }: { icon: typeof CalendarDays; title: string; description: string; action?: React.ReactNode }) { return <div className="grid place-items-center rounded-[24px] border border-dashed border-[#cddbcf] bg-white/60 px-6 py-16 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eef5d2] text-[#829a14]"><Icon className="h-6 w-6" /></div><h3 className="text-lg font-bold text-[#173a34]">{title}</h3><p className="mt-2 max-w-sm text-sm text-[#78908a]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }
export function StatusBadge({ status }: { status: string }) { return <Badge className={cn("border-0 font-semibold", statusClass[status] || "bg-[#edf2ec] text-[#5d746d]")}>{statusLabel[status] || status}</Badge>; }

function UnresolvedPastAlert({
  onGenerateReceipt,
}: {
  onGenerateReceipt?: (item: any) => void;
}) {
  const unresolvedQuery = trpc.appointment.unresolvedPast.useQuery(undefined, {
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const clients = trpc.customer.list.useQuery();
  const services = trpc.service.list.useQuery();
  const teamMembers = trpc.team.list.useQuery();
  const updateStatus = trpc.appointment.updateStatus.useMutation();
  const utils = trpc.useUtils();

  const items = unresolvedQuery.data || [];
  if (items.length === 0) return null;

  return (
    <div className="mb-6 rounded-[24px] border border-amber-300 bg-linear-to-r from-[#fffcf2] via-[#fff9e8] to-[#fef5dc] p-4.5 sm:p-5 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fbe5be] text-[#9b5800]">
          <Clock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-[#b36b00] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
              Lembrete de Fechamento
            </Badge>
            <span className="text-xs font-bold text-[#8a5200]">
              {items.length === 1
                ? "1 atendimento anterior aguardando confirmação"
                : `${items.length} atendimentos anteriores aguardando confirmação`}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6e5025] sm:text-sm">
            O horário previsto já encerrou. O serviço foi realizado ou o cliente não compareceu? Atualize abaixo em 1 clique para manter seus relatórios e recibos em dia:
          </p>

          <div className="mt-3.5 space-y-2.5">
            {items.map(item => {
              const client = clients.data?.find(c => c.id === item.clientId);
              const service = services.data?.find(s => s.id === item.serviceId);
              const member = teamMembers.data?.find(m => m.id === item.teamMemberId);
              const clientName = client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente a confirmar");
              const serviceName = service?.name || item.notes || "Atendimento";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-white/95 p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#173a34] text-sm">{clientName}</p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2 py-0.5 text-[11px] font-semibold text-[#667700]">
                        <BriefcaseBusiness className="h-3 w-3" />
                        {serviceName}
                      </span>
                      {member && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f1f5] px-2 py-0.5 text-[11px] font-semibold text-[#2f5e77]">
                          <UserCheck className="h-3 w-3" />
                          {member.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#71867f]">
                      Agendado para: <strong>{dateLabel(item.startsAt)} às {timeLabel(item.startsAt)}</strong> ({item.durationMinutes} min) · <strong>{money(item.amountCents)}</strong>
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await updateStatus.mutateAsync({ id: item.id, status: "concluido" });
                          utils.appointment.unresolvedPast.invalidate();
                          utils.appointment.list.invalidate();
                          utils.dashboard.summary.invalidate();
                          toast.success(`Atendimento de ${clientName} concluído com sucesso!`, {
                            action: onGenerateReceipt ? {
                              label: "Emitir Recibo",
                              onClick: () => onGenerateReceipt(item),
                            } : undefined,
                          });
                        } catch (err: any) {
                          toast.error(err?.message || "Não foi possível atualizar.");
                        }
                      }}
                      disabled={updateStatus.isPending}
                      className="h-8.5 rounded-xl bg-[#1b5e3a] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#25794c]"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5 text-[#9effc5]" /> Concluir e Dar Baixa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateStatus.mutateAsync({ id: item.id, status: "faltou" });
                          utils.appointment.unresolvedPast.invalidate();
                          utils.appointment.list.invalidate();
                          utils.dashboard.summary.invalidate();
                          toast.info(`Atendimento marcado como 'Não compareceu'.`);
                        } catch (err: any) {
                          toast.error(err?.message || "Não foi possível atualizar.");
                        }
                      }}
                      disabled={updateStatus.isPending}
                      className="h-8.5 rounded-xl border-amber-300 bg-white px-3 text-xs font-medium text-[#8a5200] hover:bg-amber-50"
                    >
                      <UserX className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Não compareceu
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const range = useMemo(() => ({ from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined }), [from, to]);
  const summary = trpc.dashboard.summary.useQuery(range);
  const services = trpc.service.list.useQuery();
  const clients = trpc.customer.list.useQuery();
  const [, setLocation] = useLocation();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialTab, setTutorialTab] = useState<"passos" | "estudio" | "dicas">("passos");
  const [receiptAppointment, setReceiptAppointment] = useState<ReceiptData | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("meu-autonomo-tutorial-banner-dismissed") === "true";
  });
  if (summary.isLoading) return <LoadingScreen />;
  if (summary.error) return <Page title="Seu espaço" description="Não foi possível carregar seus dados agora."><Button onClick={() => summary.refetch()} className="bg-[#173a34] text-white"><RefreshCcw className="mr-2 h-4 w-4" /> Tentar novamente</Button></Page>;
  const data = summary.data!;
  const next = data.today.find(item => item.status !== "cancelado");
  const nextClient = next ? clients.data?.find(c => c.id === next.clientId) : null;
  const nextService = next ? services.data?.find(s => s.id === next.serviceId) : null;

  const handleGenerateReceipt = (item: any) => {
    const client = clients.data?.find(c => c.id === item.clientId);
    const service = services.data?.find(s => s.id === item.serviceId);
    const clientName = client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente");
    const serviceName = service?.name || item.notes || "Prestação de serviços";

    setReceiptAppointment({
      receiptNumber: `REC-${String(item.id).padStart(4, "0")}`,
      date: item.startsAt,
      professionalName: data.profile.displayName || "Profissional",
      profession: data.profile.professionName || "Prestador de Serviços",
      professionalPhone: data.profile.whatsapp || data.profile.phone || "",
      professionalCity: data.profile.city || "",
      pixKey: data.profile.pixKey || "",
      clientName: clientName,
      clientPhone: client?.whatsapp || client?.phone || "",
      serviceDescription: serviceName,
      amountCents: item.amountCents,
      paymentMethod: item.paymentMethod || "Acerto direto com o prestador",
      authCode: item.receiptCode || `MA-REC-A${item.id}`,
    });
  };
  return <Page title={`${greeting()}, ${(data.profile.displayName || "profissional").split(" ")[0]}!`} eyebrow="Hoje" description="Uma visão rápida para você abrir e já saber o que precisa fazer." help={<HelpButton title="Como funciona o Painel?"><p><strong>O Painel</strong> é a sua central de comando. Aqui você vê, de relance, o que acontece no seu dia e no seu mês.</p><p><strong>Métricas:</strong> Atendimentos do dia, valor previsto, recebido no mês e valor em aberto.</p><p><strong>Próximo atendimento:</strong> O que vem a seguir na agenda, com horário, cliente e serviço.</p><p><strong>Solicitações recentes:</strong> Pedidos recebidos de clientes para você avaliar e transformar em agendamentos.</p><p><strong>Filtro de período:</strong> Use o filtro de datas para ver métricas de períodos específicos.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} /><Button onClick={() => setLocation("/agenda")} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Novo atendimento</Button></div>}>
    {!bannerDismissed && (
      <div className="relative mb-6 overflow-hidden rounded-[24px] border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-5 shadow-[0_8px_30px_rgba(23,58,52,0.06)] sm:p-6">
        <button
          type="button"
          onClick={() => {
            setBannerDismissed(true);
            localStorage.setItem("meu-autonomo-tutorial-banner-dismissed", "true");
          }}
          className="absolute top-4 right-4 rounded-lg p-1 text-[#758d7c] transition hover:bg-black/5 hover:text-[#173a34]"
          title="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-4 pr-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-[#173a34] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#d9f56a]">
                  Novo por aqui?
                </Badge>
                <span className="text-xs font-semibold text-[#6d8a35]">Guia Passo a Passo</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-[#173a34] sm:text-xl">
                Aprenda a usar o MeuAutônomo em menos de 3 minutos
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#476356] sm:text-sm">
                Descubra como criar seu link profissional, cadastrar serviços com 1 clique, gerenciar parceiros no estúdio, emitir orçamentos no WhatsApp e organizar sua agenda.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-end md:self-center">
            <Button
              onClick={() => {
                setTutorialTab("passos");
                setTutorialOpen(true);
              }}
              className="h-10 rounded-xl bg-[#173a34] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#28564d]"
            >
              <BookOpen className="mr-2 h-4 w-4 text-[#d9f56a]" /> Ver Passo a Passo
            </Button>
            <Button
              onClick={() => {
                setTutorialTab("estudio");
                setTutorialOpen(true);
              }}
              variant="outline"
              className="h-10 border-[#b8d49e] bg-white px-3 text-xs font-semibold text-[#173a34] hover:bg-[#f4fae6]"
            >
              <Building2 className="mr-1.5 h-3.5 w-3.5 text-[#6d8a35]" /> Módulo Estúdio & Equipe
            </Button>
            <Button
              onClick={() => setLocation("/guia")}
              variant="ghost"
              className="h-10 px-2.5 text-xs font-semibold text-[#2a4d41] hover:bg-black/5"
            >
              Manual Completo <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    )}
    <GuidedTutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} defaultTab={tutorialTab} />
    <UnresolvedPastAlert onGenerateReceipt={handleGenerateReceipt} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Atendimentos hoje" value={String(data.metrics.todayCount)} hint="na sua agenda" icon={CalendarDays} accent="lime" /><Metric title="Previsto hoje" value={money(data.metrics.todayProjectedCents)} hint="em atendimentos" icon={WalletCards} accent="blue" /><Metric title="Recebido no mês" value={money(data.metrics.receivedCents)} hint="pagamentos registrados" icon={CircleDollarSign} accent="green" /><Metric title="A receber" value={money(data.metrics.pendingCents)} hint="em aberto" icon={ClipboardList} accent="orange" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-lg text-[#173a34]">Próximo atendimento</CardTitle><p className="mt-1 text-sm text-[#82948e]">O que vem a seguir no seu dia</p></div><CalendarDays className="h-5 w-5 text-[#8aa500]" /></CardHeader><CardContent>{next ? <div className="rounded-2xl bg-[#f4f8ed] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-2xl font-bold text-[#173a34]">{timeLabel(next.startsAt)}</p><p className="mt-1 text-sm text-[#71867f]">{dateLabel(next.startsAt)} · {next.durationMinutes} min</p></div><StatusBadge status={next.status} /></div><div className="mt-5 grid gap-3 text-sm text-[#5b746c] sm:grid-cols-2"><p><UserRound className="mr-2 inline h-4 w-4 text-[#8aa500]" />{nextClient ? nextClient.name : next.clientId ? `Cliente #${next.clientId}` : "Cliente a confirmar"}</p>{nextService && <p><BriefcaseBusiness className="mr-2 inline h-4 w-4 text-[#8aa500]" /><strong className="font-semibold text-[#284b42]">{nextService.name}</strong></p>}<p><WalletCards className="mr-2 inline h-4 w-4 text-[#8aa500]" />{money(next.amountCents)}</p><p><MapPin className="mr-2 inline h-4 w-4 text-[#8aa500]" />{next.location || "Local a combinar"}</p></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" className="rounded-xl border-[#ccdccc] bg-white text-[#34564d]" onClick={() => setLocation("/agenda")}>Ver agenda <ChevronRight className="ml-1 h-4 w-4" /></Button>{next.location && <Button variant="ghost" className="rounded-xl text-[#71867f]" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.location || "")}`, "_blank")}>Abrir rota <ExternalLink className="ml-1 h-4 w-4" /></Button>}</div></div> : <EmptyState icon={CalendarDays} title="Agenda livre por enquanto" description="Adicione seu próximo atendimento e deixe seu dia organizado." action={<Button onClick={() => setLocation("/agenda")} className="rounded-xl bg-[#173a34] text-white"><Plus className="mr-2 h-4 w-4" /> Adicionar atendimento</Button>} />}</CardContent></Card><div className="grid gap-6"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg text-[#173a34]">Solicitações recentes</CardTitle><Button variant="ghost" onClick={() => setLocation("/solicitacoes")} className="text-xs text-[#71867f]">Ver todas <ArrowRight className="ml-1 h-3 w-3" /></Button></CardHeader><CardContent className="space-y-3">{data.recentRequests.length ? data.recentRequests.map(request => <button key={request.id} onClick={() => setLocation("/solicitacoes")} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-[#f5f8f2]"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]"><ClipboardList className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#2b4d44]">{request.requesterName}</p><p className="truncate text-xs text-[#83968f]">{request.description}</p></div><StatusBadge status={request.status} /></button>) : <p className="py-5 text-sm text-[#83968f]">Quando um cliente pedir um serviço, ele aparecerá aqui.</p>}</CardContent></Card><Card className="rounded-[24px] border-0 bg-[#173a34] text-white shadow-[0_10px_35px_rgba(19,42,39,0.12)]"><CardContent className="p-6"><div className="mb-4 flex items-center gap-2 text-[#d9f56a]"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.15em]">Seu cartão</span></div><h3 className="text-xl font-bold">Compartilhe seu trabalho.</h3><p className="mt-2 text-sm leading-6 text-white/65">Tenha um link profissional para enviar no WhatsApp, Instagram e onde seus clientes estiverem.</p><Button onClick={() => setLocation("/cartao")} className="mt-5 rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e]">Abrir meu cartão <ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div></div>
    <ReceiptModal
      open={Boolean(receiptAppointment)}
      onOpenChange={v => !v && setReceiptAppointment(null)}
      data={receiptAppointment}
    />
  </Page>;
}
export function Metric({ title, value, hint, icon: Icon, accent }: { title: string; value: string; hint: string; icon: typeof CalendarDays; accent: string }) { const colors: Record<string,string> = { lime: "bg-[#eef5d2] text-[#809614]", blue: "bg-[#e8f1f5] text-[#3f738e]", green: "bg-[#e3f3e8] text-[#3e885c]", orange: "bg-[#fff1d9] text-[#a27320]" }; return <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_26px_rgba(19,42,39,0.04)]"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#83968f]">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-[#173a34]">{value}</p><p className="mt-1 text-xs text-[#9aa9a3]">{hint}</p></div><div className={cn("grid h-10 w-10 place-items-center rounded-xl", colors[accent])}><Icon className="h-5 w-5" /></div></div></CardContent></Card>; }

function Agenda() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "all">("week");

  const bounds = useMemo(() => {
    if (view === "all") return undefined;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();

    if (view === "day") {
      const from = new Date(year, month, date, 0, 0, 0);
      const to = new Date(year, month, date, 23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    } else if (view === "month") {
      const from = new Date(year, month, 1, 0, 0, 0);
      const to = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    } else {
      const dayOfWeek = currentDate.getDay();
      const from = new Date(year, month, date - dayOfWeek, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      to.setMilliseconds(-1);
      return { from: from.toISOString(), to: to.toISOString() };
    }
  }, [view, currentDate]);

  const appointments = trpc.appointment.list.useQuery(bounds, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const clients = trpc.customer.list.useQuery();
  const services = trpc.service.list.useQuery();
  const teamMembers = trpc.team.list.useQuery();
  const quotesQuery = trpc.quote.list.useQuery(undefined, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const utils = trpc.useUtils();

  const handleNavigate = (delta: number) => {
    const next = new Date(currentDate);
    if (view === "day") next.setDate(next.getDate() + delta);
    else if (view === "week") next.setDate(next.getDate() + delta * 7);
    else if (view === "month") next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  const viewTitle = useMemo(() => {
    if (view === "all") return "Todos os agendamentos cadastrados";
    if (view === "day") {
      return currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    }
    if (view === "month") {
      return currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    const dayOfWeek = currentDate.getDay();
    const startWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek);
    const endWeek = new Date(startWeek);
    endWeek.setDate(endWeek.getDate() + 6);
    return `Semana: ${startWeek.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} a ${endWeek.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;
  }, [view, currentDate]);

  const getNextAppointmentSlot = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const create = trpc.appointment.create.useMutation({
    onSuccess: () => {
      toast.success("Atendimento adicionado à agenda.");
      utils.appointment.list.invalidate();
      setOpen(false);
    }
  });

  const scheduleQuoteMutation = trpc.quote.convertToAppointment.useMutation({
    onSuccess: () => {
      toast.success("Orçamento agendado com sucesso na sua agenda!");
      utils.appointment.list.invalidate();
      utils.quote.list.invalidate();
      setQuoteScheduleOpen(false);
      setSelectedQuoteToSchedule(null);
    },
    onError: err => {
      toast.error(err.message || "Erro ao agendar orçamento.");
    }
  });

  const profileQuery = trpc.profile.get.useQuery();
  const [receiptAppointment, setReceiptAppointment] = useState<ReceiptData | null>(null);

  const handleGenerateReceipt = (item: any) => {
    const client = clients.data?.find(c => c.id === item.clientId);
    const service = services.data?.find(s => s.id === item.serviceId);
    const clientName = client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente");
    const serviceName = service?.name || item.notes || "Prestação de serviços";

    setReceiptAppointment({
      receiptNumber: `REC-${String(item.id).padStart(4, "0")}`,
      date: item.startsAt,
      professionalName: profileQuery.data?.displayName || "Profissional",
      profession: profileQuery.data?.professionName || "Prestador de Serviços",
      professionalPhone: profileQuery.data?.whatsapp || profileQuery.data?.phone || "",
      professionalCity: profileQuery.data?.city || "",
      pixKey: profileQuery.data?.pixKey || "",
      clientName: clientName,
      clientPhone: client?.whatsapp || client?.phone || "",
      serviceDescription: serviceName,
      amountCents: item.amountCents,
      paymentMethod: item.paymentMethod || "Acerto direto com o prestador",
      authCode: item.receiptCode || `MA-REC-A${item.id}`,
    });
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", teamMemberId: "", startsAt: getNextAppointmentSlot(), durationMinutes: "60", amount: "", location: "", notes: "", status: "confirmado" });
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>("all");

  const isTeamMode = profileQuery.data?.accountType === "equipe";
  const filteredAppointments = useMemo(() => {
    const list = appointments.data || [];
    if (!isTeamMode) return list.filter(a => !a.teamMemberId);
    if (!teamMembers.data?.length || selectedMemberFilter === "all") return list;
    if (selectedMemberFilter === "owner") return list.filter(a => !a.teamMemberId);
    return list.filter(a => a.teamMemberId === Number(selectedMemberFilter));
  }, [appointments.data, teamMembers.data, selectedMemberFilter, isTeamMode]);

  const [quoteScheduleOpen, setQuoteScheduleOpen] = useState(false);
  const [selectedQuoteToSchedule, setSelectedQuoteToSchedule] = useState<any | null>(null);
  const [quoteScheduleForm, setQuoteScheduleForm] = useState({
    startsAt: getNextAppointmentSlot(),
    durationMinutes: "60",
    location: "",
    notes: ""
  });

  const handleOpenNew = () => {
    setForm({ clientId: "", serviceId: "", teamMemberId: "", startsAt: getNextAppointmentSlot(), durationMinutes: "60", amount: "", location: "", notes: "", status: "confirmado" });
    setOpen(true);
  };

  const handleOpenScheduleQuote = (quote: any) => {
    setSelectedQuoteToSchedule(quote);
    setQuoteScheduleForm({
      startsAt: getNextAppointmentSlot(),
      durationMinutes: "60",
      location: quote.notes?.includes("Endereço:") ? quote.notes.replace(/^Endereço:\s*/, "") : "",
      notes: quote.description || ""
    });
    setQuoteScheduleOpen(true);
  };

  const submit = async () => {
    if (!form.clientId) return toast.error("Selecione o cliente do atendimento.");
    if (!form.serviceId) return toast.error("Selecione o serviço do atendimento.");
    if (!form.startsAt || isNaN(new Date(form.startsAt).getTime())) return toast.error("Escolha data e horário válidos.");
    try {
      await create.mutateAsync({
        clientId: form.clientId ? Number(form.clientId) : undefined,
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        teamMemberId: form.teamMemberId ? Number(form.teamMemberId) : undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        amountCents: parseBrlToCents(form.amount),
        location: form.location || undefined,
        notes: form.notes || undefined,
        status: (form.status || "confirmado") as any,
        paymentStatus: "pendente"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };

  const submitQuoteSchedule = async () => {
    if (!selectedQuoteToSchedule) return;
    if (!quoteScheduleForm.startsAt || isNaN(new Date(quoteScheduleForm.startsAt).getTime())) {
      return toast.error("Selecione data e horário válidos para o atendimento.");
    }
    scheduleQuoteMutation.mutate({
      id: selectedQuoteToSchedule.id,
      startsAt: new Date(quoteScheduleForm.startsAt).toISOString(),
      durationMinutes: Number(quoteScheduleForm.durationMinutes) || 60,
      location: quoteScheduleForm.location || undefined,
      notes: quoteScheduleForm.notes || undefined
    });
  };

  const acceptedQuotes = useMemo(() => {
    return (quotesQuery.data || []).filter(q => q.status === "aceito" && !(q as any).isScheduled);
  }, [quotesQuery.data]);

  return (
    <Page
      title="Agenda"
      eyebrow="Organize seus horários"
      description="Veja seus próximos atendimentos e mantenha o dia sob controle."
      help={
        <HelpButton title="Como funciona a Agenda?">
          <p><strong>A Agenda</strong> reúne todos os seus atendimentos. Use as abas <strong>Dia / Semana / Mês / Todos</strong> e as setas para navegar nos períodos.</p>
          <p><strong>Orçamentos Aceitos:</strong> Quando um cliente aprova sua proposta, um aviso destacado aparece aqui permitindo marcar a data e horário em 1 clique.</p>
          <p><strong>Status dos atendimentos:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Agendado</strong> — horário marcado, aguardando confirmação.</li>
            <li><strong>Confirmado</strong> — o cliente confirmou a presença.</li>
            <li><strong>Em andamento</strong> — o atendimento está acontecendo agora.</li>
            <li><strong>Concluído</strong> — finalizado com sucesso.</li>
            <li><strong>Cancelado</strong> — não vai acontecer.</li>
            <li><strong>Não compareceu</strong> — o cliente não apareceu no horário.</li>
          </ul>
        </HelpButton>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {(["day", "week", "month", "all"] as const).map((key) => {
              const label = key === "day" ? "Dia" : key === "week" ? "Semana" : key === "month" ? "Mês" : "Todos";
              return (
                <Button
                  key={key}
                  variant="ghost"
                  onClick={() => setView(key)}
                  className={cn(
                    "h-9 rounded-lg px-3 text-xs",
                    view === key ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white" : "text-[#71867f]"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]">
                <Plus className="mr-2 h-4 w-4" /> Novo atendimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
              <DialogHeader>
                <DialogTitle>Novo atendimento</DialogTitle>
                <DialogDescription>Reserve um horário para um cliente.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    label="Cliente"
                    value={form.clientId}
                    onChange={value => setForm({ ...form, clientId: value })}
                    placeholder="Selecionar cliente"
                    options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))}
                  />
                  <FormSelect
                    label="Serviço"
                    value={form.serviceId}
                    onChange={value => {
                      const selected = services.data?.find(s => String(s.id) === value);
                      setForm({
                        ...form,
                        serviceId: value,
                        amount: selected ? formatBrlInput(selected.priceCents) : form.amount,
                        durationMinutes: selected ? String(selected.durationMinutes) : form.durationMinutes
                      });
                    }}
                    placeholder="Selecionar serviço"
                    options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: s.name }))}
                  />
                </div>
                {isTeamMode && Boolean(teamMembers.data?.length) && (
                  <FormSelect
                    label="Profissional / Parceiro(a)"
                    value={form.teamMemberId}
                    onChange={value => setForm({ ...form, teamMemberId: value })}
                    placeholder="Eu mesmo(a) (Titular)"
                    options={[{ value: "", label: "Eu mesmo(a) (Titular)" }, ...(teamMembers.data || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role})` }))]}
                  />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-2 block">Data e horário</Label>
                    <Input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} />
                  </div>
                  <Field label="Duração (min)" value={form.durationMinutes} onChange={value => setForm({ ...form, durationMinutes: value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Valor" prefix="R$ " value={form.amount} onChange={value => setForm({ ...form, amount: value })} />
                  <Field label="Local" value={form.location} onChange={value => setForm({ ...form, location: value })} placeholder="Endereço ou link" />
                </div>
                <div>
                  <Label className="mb-2 block">Observações</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={create.isPending} className="rounded-xl bg-[#173a34] text-white">
                  Salvar atendimento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Modal para agendar Orçamento Aprovado */}
      <Dialog open={quoteScheduleOpen} onOpenChange={setQuoteScheduleOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Agendar Atendimento do Orçamento #{selectedQuoteToSchedule?.id}</DialogTitle>
            <DialogDescription>
              Marque no calendário a data para executar o serviço aceito por <strong>{selectedQuoteToSchedule?.clientName || "Cliente"}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="rounded-2xl border border-lime-300 bg-[#f7faf2] p-4 text-xs text-[#284b42]">
              <p><strong>Valor orçado:</strong> {money(selectedQuoteToSchedule?.totalCents)}</p>
              <p className="mt-1"><strong>Condições de pagamento:</strong> {selectedQuoteToSchedule?.paymentTerms || "Acerto direto com o prestador"}</p>
            </div>
            <div>
              <Label className="mb-2 block">Data e horário do atendimento</Label>
              <Input
                type="datetime-local"
                value={quoteScheduleForm.startsAt}
                onChange={e => setQuoteScheduleForm({ ...quoteScheduleForm, startsAt: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Duração estimada (minutos)"
                value={quoteScheduleForm.durationMinutes}
                onChange={value => setQuoteScheduleForm({ ...quoteScheduleForm, durationMinutes: value })}
              />
              <Field
                label="Local do atendimento"
                value={quoteScheduleForm.location}
                onChange={value => setQuoteScheduleForm({ ...quoteScheduleForm, location: value })}
                placeholder="Endereço do cliente ou local combinado"
              />
            </div>
            <div>
              <Label className="mb-2 block">Observações para o atendimento</Label>
              <Textarea
                value={quoteScheduleForm.notes}
                onChange={e => setQuoteScheduleForm({ ...quoteScheduleForm, notes: e.target.value })}
                placeholder="Instruções, materiais a levar, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitQuoteSchedule}
              disabled={scheduleQuoteMutation.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              Confirmar e colocar na Agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner de Orçamentos Aprovados aguardando agendamento */}
      {acceptedQuotes.length > 0 && (
        <div className="mb-6 rounded-2xl border border-lime-300 bg-[#f7faf2] p-4 text-sm text-[#284b42] shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#173a34]">
                  {acceptedQuotes.length} proposta{acceptedQuotes.length > 1 ? "s" : ""} aprovada{acceptedQuotes.length > 1 ? "s" : ""} aguardando data na agenda!
                </p>
                <p className="text-xs text-[#5f756d]">
                  Seus clientes aceitaram o orçamento. Marque o dia e horário para realizar o serviço.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {acceptedQuotes.slice(0, 2).map(q => (
                <Button
                  key={q.id}
                  size="sm"
                  onClick={() => handleOpenScheduleQuote(q)}
                  className="rounded-xl bg-[#173a34] text-xs text-white hover:bg-[#28564d]"
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-[#d9f56a]" /> Agendar #{q.id} ({q.clientName || "Cliente"})
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerta inteligente de atendimentos anteriores pendentes de baixa/conclusão */}
      <UnresolvedPastAlert onGenerateReceipt={handleGenerateReceipt} />

      {/* Seletor rápido de membros da equipe (Modo Estúdio / Equipe) */}
      {isTeamMode && Boolean(teamMembers.data?.length) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#edf1eb] bg-white p-2.5 shadow-xs">
          <span className="px-2 text-xs font-semibold text-[#5f756d]">Visualizar agenda:</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedMemberFilter("all")}
            className={cn(
              "h-8 rounded-xl px-3 text-xs font-medium",
              selectedMemberFilter === "all"
                ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white"
                : "text-[#5f756d] hover:bg-[#f4f7f4]"
            )}
          >
            👥 Toda a equipe
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedMemberFilter("owner")}
            className={cn(
              "h-8 rounded-xl px-3 text-xs font-medium",
              selectedMemberFilter === "owner"
                ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white"
                : "text-[#5f756d] hover:bg-[#f4f7f4]"
            )}
          >
            👤 Eu mesmo(a) (Titular)
          </Button>
          {(teamMembers.data || []).filter(m => m.active).map(m => (
            <Button
              key={m.id}
              size="sm"
              variant="ghost"
              onClick={() => setSelectedMemberFilter(String(m.id))}
              className={cn(
                "h-8 rounded-xl px-3 text-xs font-medium",
                selectedMemberFilter === String(m.id)
                  ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white"
                  : "text-[#5f756d] hover:bg-[#f4f7f4]"
              )}
            >
              {m.role?.toLowerCase().includes("manicure") ? "💅" : "💼"} {m.name} ({m.role})
            </Button>
          ))}
        </div>
      )}

      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
        <CardHeader className="border-b border-[#edf1eb] pb-4">
          <div className="flex items-center justify-between">
            <div className="w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg text-[#173a34] capitalize break-words">{viewTitle}</CardTitle>
                {view !== "all" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(-1)}
                      className="h-8 w-8 p-0 rounded-lg border-[#dce5dc] shrink-0"
                      title="Período anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      className="h-8 px-2.5 rounded-lg text-xs border-[#dce5dc] shrink-0"
                    >
                      Hoje
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(1)}
                      className="h-8 w-8 p-0 rounded-lg border-[#dce5dc] shrink-0"
                      title="Próximo período"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-[#82948e]">Toque em um atendimento para acompanhar ou alterar o status.</p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-[#82948e] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#d9f56a]" /> Atualizado em tempo real
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.isLoading ? (
            <div className="p-8 text-[#82948e]">Carregando agenda…</div>
          ) : filteredAppointments.length ? (
            <div className="divide-y divide-[#edf1eb]">
              {filteredAppointments.map(item => (
                <AppointmentRow
                  key={item.id}
                  item={item}
                  clients={clients.data || []}
                  services={services.data || []}
                  teamMembers={teamMembers.data || []}
                  onGenerateReceipt={handleGenerateReceipt}
                />
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={CalendarDays}
                title={appointments.data?.length ? "Nenhum atendimento para o filtro selecionado neste período" : "Sua agenda está livre neste período"}
                description={appointments.data?.length ? "Alterne o profissional ou escolha outro período no calendário." : view !== "all" ? "Nenhum atendimento para o período selecionado. Use as setas para outros períodos ou adicione um novo." : "Adicione seu primeiro atendimento para começar a organizar o dia."}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedMemberFilter !== "all" && (
                      <Button variant="outline" onClick={() => setSelectedMemberFilter("all")} className="rounded-xl border-[#dce5dc]">
                        Ver toda a equipe
                      </Button>
                    )}
                    {view !== "all" && (
                      <Button variant="outline" onClick={() => setView("all")} className="rounded-xl border-[#dce5dc]">
                        Ver todos os agendamentos
                      </Button>
                    )}
                    <Button onClick={handleOpenNew} className="rounded-xl bg-[#173a34] text-white">
                      <Plus className="mr-2 h-4 w-4" /> Novo atendimento
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal
        open={Boolean(receiptAppointment)}
        onOpenChange={v => !v && setReceiptAppointment(null)}
        data={receiptAppointment}
      />
    </Page>
  );
}
function AppointmentRow({ item, clients, services, teamMembers, onGenerateReceipt }: { item: any; clients: any[]; services: any[]; teamMembers?: any[]; onGenerateReceipt?: (item: any) => void }) {
  const updateStatus = trpc.appointment.updateStatus.useMutation(); const update = trpc.appointment.update.useMutation(); const cancel = trpc.appointment.cancel.useMutation(); const utils = trpc.useUtils(); const [open, setOpen] = useState(false);
  const toLocal = (value: Date | string) => { const date = new Date(value); const pad = (number: number) => String(number).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; };
  const [form, setForm] = useState({ clientId: item.clientId ? String(item.clientId) : "", serviceId: item.serviceId ? String(item.serviceId) : "", teamMemberId: item.teamMemberId ? String(item.teamMemberId) : "", startsAt: toLocal(item.startsAt), durationMinutes: String(item.durationMinutes), amount: formatBrlInput(item.amountCents), location: item.location || "", notes: item.notes || "" });
  const save = async () => { try { await update.mutateAsync({ id: item.id, clientId: form.clientId ? Number(form.clientId) : undefined, serviceId: form.serviceId ? Number(form.serviceId) : undefined, teamMemberId: form.teamMemberId ? Number(form.teamMemberId) : null, startsAt: new Date(form.startsAt).toISOString(), durationMinutes: Number(form.durationMinutes), amountCents: parseBrlToCents(form.amount), location: form.location || undefined, notes: form.notes || undefined }); toast.success("Atendimento atualizado."); utils.appointment.list.invalidate(); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar."); } };
  const client = clients.find(c => c.id === item.clientId);
  const service = services.find(s => s.id === item.serviceId);
  const member = teamMembers?.find(m => m.id === item.teamMemberId);
  const clientName = client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente a confirmar");
  const serviceName = service?.name;
  return <div className="flex flex-col gap-4 p-5 transition hover:bg-[#fbfcf9] sm:flex-row sm:items-center"><div className="flex items-center gap-4 sm:w-48"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f1f7dd] text-center"><span className="text-sm font-bold text-[#718600]">{timeLabel(item.startsAt)}</span></div><div><p className="font-semibold text-[#284b42]">{dateLabel(item.startsAt)}</p><p className="text-xs text-[#82948e]">{item.durationMinutes} minutos</p></div></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{clientName}</p>{serviceName && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2.5 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{serviceName}</span>}{member && <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f1f5] px-2.5 py-0.5 text-xs font-semibold text-[#2f5e77]"><UserCheck className="h-3 w-3" />{member.name}</span>}</div><p className="mt-1 truncate text-sm text-[#82948e]">{item.location ? <><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#8aa500]" />{item.location} · </> : ""}{money(item.amountCents)}</p>{item.notes && <p className="mt-0.5 truncate text-xs text-[#9aa9a3] italic">Obs: {item.notes}</p>}</div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} />{item.status === "concluido" && onGenerateReceipt && <Button variant="outline" size="sm" onClick={() => onGenerateReceipt(item)} className="h-9 rounded-lg border-[#b3d7bf] bg-[#f0f7f2] text-xs font-semibold text-[#173a34] hover:bg-[#e1f0e5]" title="Gerar recibo profissional deste atendimento"><Receipt className="mr-1 h-3.5 w-3.5 text-[#2e6e4a]" /> Recibo</Button>}<Select value={item.status} onValueChange={async value => { await updateStatus.mutateAsync({ id: item.id, status: value as any }); toast.success("Status atualizado."); utils.appointment.list.invalidate(); }}><SelectTrigger className="h-9 w-[140px] rounded-lg border-[#dce5dc] bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent>{["agendado","confirmado","andamento","concluido","cancelado","faltou"].map(value => <SelectItem key={value} value={value}>{statusLabel[value]}</SelectItem>)}</SelectContent></Select><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="h-9 rounded-lg border-[#dce5dc] bg-white px-2"><Pencil className="h-3.5 w-3.5" /></Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>Editar atendimento</DialogTitle><DialogDescription>Reagende ou atualize os dados deste horário.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Cliente" value={form.clientId} onChange={value => setForm({ ...form, clientId: value })} options={clients.map(client => ({ value: String(client.id), label: client.name }))} /><FormSelect label="Serviço" value={form.serviceId} onChange={value => { const sel = services.find(s => String(s.id) === value); setForm({ ...form, serviceId: value, amount: sel && (!form.amount || form.amount === "0" || form.amount === "0,00") ? formatBrlInput(sel.priceCents) : form.amount, durationMinutes: sel && !form.durationMinutes ? String(sel.durationMinutes) : form.durationMinutes }); }} options={services.filter(service => service.active).map(service => ({ value: String(service.id), label: service.name }))} /></div>{Boolean(teamMembers?.length) && <FormSelect label="Profissional / Parceiro(a)" value={form.teamMemberId} onChange={value => setForm({ ...form, teamMemberId: value })} placeholder="Eu mesmo(a) (Titular)" options={[{ value: "", label: "Eu mesmo(a) (Titular)" }, ...(teamMembers || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role})` }))]} />}<div className="grid gap-4 sm:grid-cols-2"><div><Label className="mb-2 block">Data e horário</Label><Input type="datetime-local" value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })} /></div><Field label="Duração (min)" value={form.durationMinutes} onChange={value => setForm({ ...form, durationMinutes: value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Valor" prefix="R$ " value={form.amount} onChange={value => setForm({ ...form, amount: value })} /><Field label="Local" value={form.location} onChange={value => setForm({ ...form, location: value })} /></div><div><Label className="mb-2 block">Observações</Label><Textarea value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div></div><DialogFooter><Button onClick={save} disabled={update.isPending} className="rounded-xl bg-[#173a34] text-white">Salvar alterações</Button></DialogFooter></DialogContent></Dialog><Button variant="ghost" onClick={async () => { await cancel.mutateAsync({ id: item.id }); toast.success("Atendimento cancelado."); utils.appointment.list.invalidate(); }} className="h-9 rounded-lg px-2 text-[#9c4d43]"><Trash2 className="h-3.5 w-3.5" /></Button></div></div>;
}

const Clients = ClientsPage;


const Services = ServicesPage;

function Requests() {
  const requests = trpc.request.list.useQuery(undefined, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const services = trpc.service.list.useQuery();
  const team = trpc.team.list.useQuery();
  const utils = trpc.useUtils();

  const update = trpc.request.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Situação da solicitação atualizada.");
      utils.request.list.invalidate();
    }
  });

  const convertClient = trpc.request.convertToClient.useMutation({
    onSuccess: () => {
      toast.success("Solicitação convertida em cliente!");
      utils.request.list.invalidate();
      utils.customer.list.invalidate();
    }
  });

  const convertAppointment = trpc.request.convertToAppointment.useMutation({
    onSuccess: () => {
      toast.success("Atendimento criado com sucesso na sua Agenda!");
      utils.request.list.invalidate();
      utils.appointment.list.invalidate();
      setAppointmentModalOpen(false);
      setSelectedRequestForAppointment(null);
    },
    onError: err => {
      toast.error(err.message || "Erro ao agendar atendimento.");
    }
  });

  const createQuote = trpc.quote.create.useMutation({
    onSuccess: data => {
      if (data.token) {
        toast.success("Orçamento criado e link gerado com sucesso!");
        setGeneratedQuoteUrl(`${window.location.origin}/orcamento/${data.token}`);
      } else {
        toast.success("Orçamento salvo.");
      }
      utils.request.list.invalidate();
      utils.quote.list.invalidate();
      setQuoteModalOpen(false);
      setSelectedRequestForQuote(null);
    },
    onError: err => {
      toast.error(err.message || "Erro ao criar orçamento.");
    }
  });

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<any | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    serviceId: "",
    description: "",
    discount: "",
    paymentTerms: "PIX direto ou Cartão",
    notes: "",
    validUntil: "",
    items: [{ description: "", quantity: "1", unitPrice: "100,00" }]
  });

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedRequestForAppointment, setSelectedRequestForAppointment] = useState<any | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    serviceId: "",
    teamMemberId: "",
    startsAt: "",
    durationMinutes: "60",
    amount: "",
    location: "",
    notes: ""
  });

  const [generatedQuoteUrl, setGeneratedQuoteUrl] = useState<string | null>(null);

  const getNextAppointmentSlot = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenQuoteModal = (req: any) => {
    setSelectedRequestForQuote(req);
    const matchedService = services.data?.find(s => s.id === req.serviceId) || services.data?.[0];
    const initialPrice = matchedService ? formatBrlInput(matchedService.priceCents) : "150,00";
    setQuoteForm({
      serviceId: matchedService ? String(matchedService.id) : "",
      description: req.description || "Prestação de serviços solicitados",
      discount: "",
      paymentTerms: "PIX à vista na conclusão ou Cartão de Crédito",
      notes: req.address ? `Local do serviço: ${req.address}` : "",
      validUntil: "",
      items: [
        {
          description: req.description || (matchedService ? matchedService.name : "Serviço solicitado"),
          quantity: "1",
          unitPrice: initialPrice
        }
      ]
    });
    setQuoteModalOpen(true);
  };

  const handleOpenAppointmentModal = (req: any) => {
    setSelectedRequestForAppointment(req);
    const matchedService = services.data?.find(s => s.id === req.serviceId) || services.data?.[0];
    let defaultStart = getNextAppointmentSlot();
    if (req.desiredAt) {
      try {
        const d = new Date(req.desiredAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        defaultStart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
      } catch (e) {}
    }
    setAppointmentForm({
      serviceId: matchedService ? String(matchedService.id) : "",
      teamMemberId: "",
      startsAt: defaultStart,
      durationMinutes: matchedService ? String(matchedService.durationMinutes) : "60",
      amount: matchedService ? formatBrlInput(matchedService.priceCents) : "150,00",
      location: req.address || "",
      notes: req.description || ""
    });
    setAppointmentModalOpen(true);
  };

  const submitQuote = () => {
    if (!selectedRequestForQuote) return;
    const reqSubtotal = quoteForm.items.reduce((sum, it) => {
      const q = parseFloat(String(it.quantity).replace(",", ".")) || 0;
      const p = parseBrlToCents(it.unitPrice);
      return sum + (q > 0 && p > 0 ? Math.round(q * p) : 0);
    }, 0);
    const reqDiscount = parseBrlToCents(quoteForm.discount);
    if (quoteForm.discount.includes("-") || reqDiscount < 0) {
      return toast.error("O desconto não pode ser negativo.");
    }
    if (reqSubtotal > 0 && reqDiscount > reqSubtotal) {
      return toast.error("O desconto não pode ser maior que o subtotal da proposta.");
    }
    if (!quoteForm.items.every(it => it.description.trim() && (parseFloat(String(it.quantity).replace(",", ".")) || 0) > 0)) {
      return toast.error("Preencha a descrição e quantidade válida (maior que zero) de cada item do orçamento.");
    }
    createQuote.mutate({
      requestId: selectedRequestForQuote.id,
      clientId: selectedRequestForQuote.clientId || undefined,
      serviceId: quoteForm.serviceId ? Number(quoteForm.serviceId) : undefined,
      description: quoteForm.description || undefined,
      discountCents: reqDiscount,
      notes: quoteForm.notes || undefined,
      paymentTerms: quoteForm.paymentTerms || undefined,
      validUntil: quoteForm.validUntil ? `${quoteForm.validUntil}T12:00:00.000Z` : undefined,
      sendNow: true,
      items: quoteForm.items.map(it => ({
        description: it.description,
        quantity: Math.max(0.01, parseFloat(String(it.quantity).replace(",", ".")) || 1),
        unitPriceCents: parseBrlToCents(it.unitPrice)
      }))
    });
  };

  const submitAppointment = () => {
    if (!selectedRequestForAppointment) return;
    if (!appointmentForm.startsAt || isNaN(new Date(appointmentForm.startsAt).getTime())) {
      return toast.error("Selecione data e horário válidos para o atendimento.");
    }
    convertAppointment.mutate({
      id: selectedRequestForAppointment.id,
      serviceId: appointmentForm.serviceId ? Number(appointmentForm.serviceId) : undefined,
      teamMemberId: appointmentForm.teamMemberId ? Number(appointmentForm.teamMemberId) : undefined,
      startsAt: new Date(appointmentForm.startsAt).toISOString(),
      durationMinutes: Number(appointmentForm.durationMinutes) || 60,
      amountCents: parseBrlToCents(appointmentForm.amount),
      location: appointmentForm.location || undefined,
      notes: appointmentForm.notes || undefined
    });
  };

  const paymentPresets = [
    "PIX à vista na conclusão",
    "Cartão de Crédito/Débito",
    "50% de entrada + 50% na conclusão",
    "Dinheiro à vista",
    "A combinar com o profissional"
  ];

  return (
    <Page
      title="Solicitações"
      eyebrow="Novos clientes"
      description="Pedidos que chegaram pela sua página pública, sem exigir cadastro do cliente."
      help={
        <HelpButton title="Como funciona Solicitações?">
          <p><strong>Solicitações</strong> são pedidos que novos clientes fazem pela sua página pública e cartão digital, sem precisar criar conta.</p>
          <p><strong>O que cada botão faz:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Criar orçamento</strong> — abre o painel para precificar itens, definir formas de pagamento e gerar o link seguro para o cliente aprovar.</li>
            <li><strong>Criar atendimento</strong> — abre o painel para escolher data e horário e marcar direto na sua Agenda.</li>
            <li><strong>Virar cliente</strong> — salva o contato na sua lista de clientes para atendimentos futuros.</li>
          </ul>
        </HelpButton>
      }
    >
      {/* Diálogo de Link Gerado */}
      <Dialog open={Boolean(generatedQuoteUrl)} onOpenChange={v => !v && setGeneratedQuoteUrl(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>🎉 Orçamento Criado com Sucesso!</DialogTitle>
            <DialogDescription>
              O link seguro da proposta está pronto para envio ao cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="rounded-xl border border-lime-300 bg-[#f7faf2] p-4 text-sm text-[#284b42]">
              <p className="font-semibold">Link da proposta digital:</p>
              <p className="mt-1 break-all text-xs font-mono text-[#526d64] bg-white p-2 rounded-lg border border-[#dce5dc]">
                {generatedQuoteUrl}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={() => {
                  if (generatedQuoteUrl) {
                    navigator.clipboard?.writeText(generatedQuoteUrl);
                    toast.success("Link do orçamento copiado!");
                  }
                }}
                className="flex-1 rounded-xl bg-[#173a34] text-white"
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (generatedQuoteUrl) window.open(generatedQuoteUrl, "_blank");
                }}
                className="rounded-xl border-[#dce5dc]"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Visualizar Proposta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Criar Orçamento a partir da Solicitação */}
      <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Criar Orçamento para {selectedRequestForQuote?.requesterName}</DialogTitle>
            <DialogDescription>
              Monte os itens, preços e formas de pagamento para enviar uma proposta clara ao cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-3.5 text-xs text-[#526d64]">
              <p><strong>Pedido do cliente:</strong> "{selectedRequestForQuote?.description}"</p>
              {selectedRequestForQuote?.address && <p className="mt-1"><strong>Endereço:</strong> {selectedRequestForQuote.address}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Serviço de referência"
                value={quoteForm.serviceId}
                onChange={val => {
                  const s = services.data?.find(item => String(item.id) === val);
                  setQuoteForm({
                    ...quoteForm,
                    serviceId: val,
                    items: s ? [{ description: s.name, quantity: "1", unitPrice: formatBrlInput(s.priceCents) }] : quoteForm.items
                  });
                }}
                placeholder="Selecionar serviço do catálogo"
                options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: `${s.name} (${money(s.priceCents)})` }))}
              />
              <Field
                label="Desconto (opcional)"
                prefix="R$ "
                value={quoteForm.discount}
                onChange={val => setQuoteForm({ ...quoteForm, discount: val })}
                placeholder="0,00"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold text-[#173a34]">Itens do Orçamento</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuoteForm({ ...quoteForm, items: [...quoteForm.items, { description: "", quantity: "1", unitPrice: "50,00" }] })}
                  className="h-8 rounded-lg border-[#dce5dc] text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar item
                </Button>
              </div>
              <div className="space-y-3">
                {quoteForm.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-xl border border-[#dce5dc] bg-white p-2.5">
                    <Input
                      value={item.description}
                      onChange={e => setQuoteForm({
                        ...quoteForm,
                        items: quoteForm.items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it)
                      })}
                      placeholder="Descrição do serviço ou material"
                      className="flex-1 border-0 shadow-none text-sm"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => setQuoteForm({
                        ...quoteForm,
                        items: quoteForm.items.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it)
                      })}
                      className="w-16 text-center text-sm border-[#dce5dc]"
                      title="Quantidade"
                    />
                    <div className="w-28">
                      <Input
                        value={item.unitPrice}
                        onChange={e => setQuoteForm({
                          ...quoteForm,
                          items: quoteForm.items.map((it, i) => i === idx ? { ...it, unitPrice: e.target.value } : it)
                        })}
                        placeholder="0,00"
                        className="text-right text-sm border-[#dce5dc]"
                        title="Valor unitário"
                      />
                    </div>
                    {quoteForm.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuoteForm({ ...quoteForm, items: quoteForm.items.filter((_, i) => i !== idx) })}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Formas e condições de pagamento</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {paymentPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuoteForm({ ...quoteForm, paymentTerms: quoteForm.paymentTerms ? `${quoteForm.paymentTerms} ou ${preset}` : preset })}
                    className="rounded-full border border-[#dce5dc] bg-white px-2.5 py-1 text-xs text-[#4c6960] hover:bg-[#eef5d2] transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <Input
                value={quoteForm.paymentTerms}
                onChange={e => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
                placeholder="Ex.: PIX à vista ou Cartão em até 3x sem juros"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Observações e garantias</Label>
              <Textarea
                value={quoteForm.notes}
                onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                placeholder="Ex.: Garantia de 90 dias, materiais inclusos, prazo de execução..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitQuote}
              disabled={createQuote.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              Criar e Gerar Link do Orçamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Criar Atendimento a partir da Solicitação */}
      <Dialog open={appointmentModalOpen} onOpenChange={setAppointmentModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Agendar Atendimento para {selectedRequestForAppointment?.requesterName}</DialogTitle>
            <DialogDescription>
              Marque o dia e horário na sua Agenda para realizar este serviço.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-3.5 text-xs text-[#526d64]">
              <p><strong>Telefone:</strong> {formatPhone(selectedRequestForAppointment?.requesterPhone)}</p>
              {selectedRequestForAppointment?.requesterEmail && <p className="mt-0.5"><strong>E-mail:</strong> {selectedRequestForAppointment.requesterEmail}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Serviço"
                value={appointmentForm.serviceId}
                onChange={val => {
                  const s = services.data?.find(item => String(item.id) === val);
                  setAppointmentForm({
                    ...appointmentForm,
                    serviceId: val,
                    amount: s ? formatBrlInput(s.priceCents) : appointmentForm.amount,
                    durationMinutes: s ? String(s.durationMinutes) : appointmentForm.durationMinutes
                  });
                }}
                placeholder="Selecionar serviço"
                options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: `${s.name} (${money(s.priceCents)})` }))}
              />
              <div>
                <Label className="mb-2 block">Data e horário</Label>
                <Input
                  type="datetime-local"
                  value={appointmentForm.startsAt}
                  onChange={e => setAppointmentForm({ ...appointmentForm, startsAt: e.target.value })}
                />
              </div>
            </div>

            {team.data && team.data.length > 0 && (
              <FormSelect
                label="Profissional / Parceiro da Equipe"
                value={appointmentForm.teamMemberId}
                onChange={val => setAppointmentForm({ ...appointmentForm, teamMemberId: val })}
                placeholder="Eu mesmo (titular)"
                options={[
                  { value: "", label: "Eu mesmo (titular)" },
                  ...team.data.map(m => ({ value: String(m.id), label: `${m.name} (${m.role})` }))
                ]}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Duração (minutos)"
                value={appointmentForm.durationMinutes}
                onChange={val => setAppointmentForm({ ...appointmentForm, durationMinutes: val })}
              />
              <Field
                label="Valor do atendimento"
                prefix="R$ "
                value={appointmentForm.amount}
                onChange={val => setAppointmentForm({ ...appointmentForm, amount: val })}
              />
            </div>

            <Field
              label="Local"
              value={appointmentForm.location}
              onChange={val => setAppointmentForm({ ...appointmentForm, location: val })}
              placeholder="Endereço do cliente ou local do serviço"
            />

            <div>
              <Label className="mb-2 block">Observações para o atendimento</Label>
              <Textarea
                value={appointmentForm.notes}
                onChange={e => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                placeholder="Detalhes adicionais sobre o serviço..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitAppointment}
              disabled={convertAppointment.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              Confirmar e Adicionar à Agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guia Visual do Fluxo das Solicitações */}
      <div className="mb-6 grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 text-xs w-full min-w-0">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>1. Nova Solicitação</span>
          </div>
          <p className="mt-1 text-amber-800/80 leading-snug">
            Chegou pela sua página. Avalie a descrição e os anexos.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>2. Orçamento Enviado</span>
          </div>
          <p className="mt-1 text-blue-800/80 leading-snug">
            Você montou a proposta com valores e enviou o link ao cliente.
          </p>
        </div>
        <div className="rounded-2xl border border-lime-200 bg-lime-50/70 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>3. Proposta Aprovada</span>
          </div>
          <p className="mt-1 text-emerald-800/80 leading-snug">
            O cliente aprovou! Você recebe aviso imediato para marcar data.
          </p>
        </div>
        <div className="rounded-2xl border border-[#dce5dc] bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#284b42]">
            <span className="h-2 w-2 rounded-full bg-[#173a34]" />
            <span>4. Agendada</span>
          </div>
          <p className="mt-1 text-[#668076] leading-snug">
            Data e horário marcados no seu calendário da Agenda.
          </p>
        </div>
      </div>

      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
        <CardContent className="p-0">
          {requests.data?.length ? (
            <div className="divide-y divide-[#edf1eb]">
              {requests.data.map(request => (
                <div key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815]">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#284b42]">{request.requesterName}</h3>
                      <StatusBadge status={request.status} />
                      {((request as any).quoteStatus === "aceito" || request.status === "proposta_aceita") && request.status !== "proposta_aceita" && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          🎉 Proposta aprovada pelo cliente
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#82948e]">
                      {formatPhone(request.requesterPhone)}
                      {request.requesterEmail ? ` · ${request.requesterEmail}` : ""}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#526d64]">{request.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8b9c96]">
                      <span>
                        <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                        Recebida em {dateLabel(request.createdAt)}
                      </span>
                      {request.address && (
                        <span>
                          <MapPin className="mr-1 inline h-3.5 w-3.5" />
                          {request.address}
                        </span>
                      )}
                      {request.attachments?.map(file => (
                        <a
                          key={file.id}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#496b98] hover:underline"
                        >
                          <Paperclip className="mr-1 inline h-3.5 w-3.5" />
                          {file.fileName}
                        </a>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => convertClient.mutate({ id: request.id })}
                        disabled={Boolean(request.clientId) || convertClient.isPending}
                        className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs text-[#4c6960]"
                      >
                        {request.clientId ? "✓ Cliente cadastrado" : "Virar cliente"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenQuoteModal(request)}
                        className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs font-semibold text-[#173a34] hover:bg-[#f0f7f2]"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5 text-[#3e885c]" /> Criar orçamento
                      </Button>
                      <Button
                        onClick={() => handleOpenAppointmentModal(request)}
                        className="h-9 rounded-lg bg-[#173a34] text-xs text-white hover:bg-[#28564d]"
                      >
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-[#d9f56a]" /> Criar atendimento
                      </Button>
                      {request.requesterPhone && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const cleanPhone = request.requesterPhone.replace(/\D/g, "");
                            const greetingMsg = `Olá ${request.requesterName}! Vi sua solicitação no MeuAutônomo para o serviço: "${request.description.slice(0, 50)}...". Como posso te ajudar?`;
                            window.open(`https://wa.me/55${cleanPhone.startsWith("55") ? cleanPhone : cleanPhone}?text=${encodeURIComponent(greetingMsg)}`, "_blank");
                          }}
                          className="h-9 rounded-lg border-[#cbe4d1] bg-[#eef7f0] text-xs font-semibold text-[#173a34] hover:bg-[#d8eedf]"
                        >
                          <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#2d7d54]" /> Falar no WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                  <Select
                    value={request.status}
                    onValueChange={value => update.mutate({ id: request.id, status: value as any })}
                  >
                    <SelectTrigger className="h-9 w-[170px] rounded-lg border-[#dce5dc] bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["nova", "em_analise", "orcamento_enviado", "proposta_aceita", "agendada", "arquivada"].map(value => (
                        <SelectItem key={value} value={value}>
                          {statusLabel[value] || value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8">
              <div className="mx-auto max-w-xl text-center">
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-[#eef5d2] text-[#819815] shadow-sm">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#173a34]">Como funcionam as solicitações?</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d837c]">
                  Os clientes chegam através da sua página pública e cartão digital — <strong>sem precisar criar conta nem instalar aplicativos</strong>.
                </p>
                <div className="mt-8 space-y-3 text-left">
                  <div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#eef5d2] font-bold text-sm text-[#819815]">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#284b42]">Você divulga seu link ou cartão virtual</p>
                      <p className="mt-0.5 text-xs text-[#71867f]">
                        Compartilhe no WhatsApp, Instagram, bio ou envie direto quando alguém pedir seu contato.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e3f3e8] font-bold text-sm text-[#3e885c]">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#284b42]">O cliente solicita o serviço pelo navegador</p>
                      <p className="mt-0.5 text-xs text-[#71867f]">
                        Ele informa nome, WhatsApp, descreve o que precisa, pode anexar fotos e indicar o local.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e8eef8] font-bold text-sm text-[#496b98]">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#284b42]">O pedido cai instantaneamente aqui</p>
                      <p className="mt-0.5 text-xs text-[#71867f]">
                        Você visualiza todos os dados, fotos e informações para avaliar com rapidez.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d9f56a] font-bold text-sm text-[#173a34]">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#284b42]">Você responde em 1 clique</p>
                      <p className="mt-0.5 text-xs text-[#71867f]">
                        Basta clicar em <strong>"Criar orçamento"</strong> para enviar proposta digital, <strong>"Virar cliente"</strong> ou <strong>"Criar atendimento"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={() => window.location.href = "/cartao"}
                    className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Acessar e compartilhar meu cartão
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}

function Quotes() {
  const quotes = trpc.quote.list.useQuery(undefined, { refetchInterval: 5000, refetchOnWindowFocus: true });
  const clients = trpc.customer.list.useQuery();
  const services = trpc.service.list.useQuery();
  const profileQuery = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState<string>("");
  const [receiptQuote, setReceiptQuote] = useState<ReceiptData | null>(null);

  const [scheduleQuoteModalOpen, setScheduleQuoteModalOpen] = useState(false);
  const [selectedQuoteForSchedule, setSelectedQuoteForSchedule] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    startsAt: "",
    durationMinutes: "60",
    location: "",
    notes: ""
  });

  const getNextAppointmentSlot = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const scheduleQuoteMutation = trpc.quote.convertToAppointment.useMutation({
    onSuccess: () => {
      toast.success("Orçamento agendado com sucesso na sua Agenda!");
      utils.quote.list.invalidate();
      utils.appointment.list.invalidate();
      setScheduleQuoteModalOpen(false);
      setSelectedQuoteForSchedule(null);
    },
    onError: err => {
      toast.error(err.message || "Erro ao agendar orçamento.");
    }
  });

  const handleOpenScheduleModal = (quote: any) => {
    setSelectedQuoteForSchedule(quote);
    setScheduleForm({
      startsAt: getNextAppointmentSlot(),
      durationMinutes: "60",
      location: quote.notes?.includes("Endereço:") ? quote.notes.replace(/^Endereço:\s*/, "") : (quote.notes || ""),
      notes: quote.description || ""
    });
    setScheduleQuoteModalOpen(true);
  };

  const submitScheduleQuote = () => {
    if (!selectedQuoteForSchedule) return;
    if (!scheduleForm.startsAt || isNaN(new Date(scheduleForm.startsAt).getTime())) {
      return toast.error("Selecione data e horário válidos.");
    }
    scheduleQuoteMutation.mutate({
      id: selectedQuoteForSchedule.id,
      startsAt: new Date(scheduleForm.startsAt).toISOString(),
      durationMinutes: Number(scheduleForm.durationMinutes) || 60,
      location: scheduleForm.location || undefined,
      notes: scheduleForm.notes || undefined
    });
  };

  const initialForm = {
    clientId: "",
    serviceId: "",
    description: "",
    discount: "",
    paymentTerms: "",
    notes: "",
    validUntil: "",
    sendNow: true,
    items: [{ description: "", quantity: "1", unitPrice: "" }]
  };
  const [form, setForm] = useState(initialForm);

  const create = trpc.quote.create.useMutation({
    onSuccess: data => {
      if (data.token) {
        toast.success("Orçamento salvo e link gerado!");
        setCreatedToken(data.token);
      } else {
        toast.success("Orçamento salvo como rascunho.");
        setCreatedToken(null);
      }
      utils.quote.list.invalidate();
      setOpen(false);
    }
  });

  const update = trpc.quote.update.useMutation({
    onSuccess: data => {
      if (data.token) {
        toast.success("Proposta revisada e link atualizado!");
        setCreatedToken(data.token);
      } else {
        toast.success("Proposta atualizada como rascunho.");
        setCreatedToken(null);
      }
      utils.quote.list.invalidate();
      setOpen(false);
      setEditingQuoteId(null);
    }
  });

  const publishQuote = trpc.quote.publish.useMutation({
    onSuccess: data => {
      toast.success("Orçamento publicado e link gerado!");
      utils.quote.list.invalidate();
      setCreatedToken(data.token);
    },
    onError: err => {
      toast.error(err.message || "Erro ao publicar orçamento.");
    }
  });

  const deleteQuote = trpc.quote.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento excluído com sucesso!");
      utils.quote.list.invalidate();
    },
    onError: err => {
      toast.error(err.message || "Erro ao excluir orçamento.");
    }
  });

  const paymentPresets = [
    "Cartão de Crédito/Débito na maquininha do profissional",
    "PIX direto com o profissional na conclusão",
    "Dinheiro à vista no término do serviço",
    "50% de entrada + 50% na conclusão",
    "Cartão de Crédito parcelado (com taxa da máquina)",
    "A combinar diretamente entre as partes"
  ];

  const openNewQuote = () => {
    setEditingQuoteId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const parseQuantity = (val: any): number => {
    if (val === undefined || val === null || val === "") return 0;
    const clean = String(val).trim().replace(",", ".");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const openEditQuote = (quote: any) => {
    setEditingQuoteId(quote.id);
    setForm({
      clientId: quote.clientId ? String(quote.clientId) : "",
      serviceId: quote.serviceId ? String(quote.serviceId) : "",
      description: quote.description || "",
      discount: quote.discountCents ? formatBrlInput(quote.discountCents) : "",
      paymentTerms: quote.paymentTerms || "",
      notes: quote.notes || "",
      validUntil: quote.validUntil ? formatIsoToDateInput(quote.validUntil) : "",
      sendNow: true,
      items: quote.items?.length
        ? quote.items.map((it: any) => ({
            description: it.description,
            quantity: String(it.quantity).replace(".", ","),
            unitPrice: formatBrlInput(it.unitPriceCents)
          }))
        : [{ description: quote.description || "Serviço", quantity: "1", unitPrice: formatBrlInput(quote.subtotalCents) }]
    });
    setOpen(true);
  };

  const subtotal = form.items.reduce((sum, item) => {
    const q = parseQuantity(item.quantity);
    const p = parseBrlToCents(item.unitPrice);
    return sum + (q > 0 && p > 0 ? Math.round(q * p) : 0);
  }, 0);
  const discountCents = parseBrlToCents(form.discount);
  const total = Math.max(0, subtotal - discountCents);

  const submit = () => {
    for (const item of form.items) {
      if (!item.description.trim()) {
        return toast.error("Preencha a descrição de todos os itens.");
      }
      const q = parseQuantity(item.quantity);
      if (q <= 0) {
        return toast.error("A quantidade de cada item deve ser um número positivo maior que zero.");
      }
      if (item.unitPrice.includes("-") || parseBrlToCents(item.unitPrice) < 0) {
        return toast.error("O preço unitário não pode ser negativo.");
      }
    }
    if (form.discount.includes("-") || discountCents < 0) {
      return toast.error("O desconto não pode ser negativo.");
    }
    if (subtotal > 0 && discountCents > subtotal) {
      return toast.error("O desconto não pode ser maior que o subtotal da proposta.");
    }
    const payloadItems = form.items.map(item => {
      const spell = checkServiceSpelling(item.description);
      const cleanDesc = spell.hasCorrection ? spell.correctedText : item.description;
      return {
        description: cleanDesc,
        quantity: Math.max(0.01, parseQuantity(item.quantity)),
        unitPriceCents: parseBrlToCents(item.unitPrice)
      };
    });

    const descSpell = form.description ? checkServiceSpelling(form.description) : null;
    const finalQuoteDesc = (descSpell?.hasCorrection ? descSpell.correctedText : form.description) || undefined;

    if (editingQuoteId) {
      update.mutate({
        id: editingQuoteId,
        description: finalQuoteDesc,
        discountCents,
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        validUntil: form.validUntil ? `${form.validUntil}T12:00:00.000Z` : undefined,
        sendNow: form.sendNow,
        items: payloadItems
      });
    } else {
      create.mutate({
        clientId: form.clientId ? Number(form.clientId) : undefined,
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        description: finalQuoteDesc,
        discountCents,
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        validUntil: form.validUntil ? `${form.validUntil}T12:00:00.000Z` : undefined,
        sendNow: form.sendNow,
        items: payloadItems
      });
    }
  };

  const shareUrl = createdToken ? `${window.location.origin}/orcamento/${createdToken}` : "";
  const updateItem = (index: number, values: any) => setForm({ ...form, items: form.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item) });

  return (
    <Page
      title="Orçamentos"
      eyebrow="Propostas que fecham"
      description="Crie uma proposta clara com itens, desconto, condições de pagamento e um link seguro para o cliente responder."
      help={<HelpButton title="Como funciona Orçamentos?"><p><strong>Orçamentos</strong> são propostas formais que você envia ao cliente com itens, valores e condições.</p><p><strong>Status:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Rascunho</strong> — ainda não enviado ao cliente.</li><li><strong>Enviado</strong> — o cliente recebeu o link e pode responder.</li><li><strong>Aceito</strong> — cliente aprovou a proposta.</li><li><strong>Recusado</strong> — cliente pediu alteração ou recusou.</li></ul><p><strong>Link público:</strong> O cliente não precisa criar conta para visualizar e aceitar o orçamento. Basta abrir o link enviado.</p><p>Após aceito, o orçamento pode virar um atendimento na agenda com um clique.</p></HelpButton>}
      action={
        <Button onClick={openNewQuote} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]">
          <Plus className="mr-2 h-4 w-4" /> Novo orçamento
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setEditingQuoteId(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuoteId
                ? (quotes.data?.find(q => q.id === editingQuoteId)?.status === "aceito" ? "Revisar Proposta (Reabertura)" : "Revisar e Reenviar Proposta")
                : "Novo orçamento"}
            </DialogTitle>
            <DialogDescription>
              {editingQuoteId
                ? (quotes.data?.find(q => q.id === editingQuoteId)?.status === "aceito"
                    ? "Esta proposta já foi aceita pelo cliente. Ao salvar com novos itens ou valores, ela será reaberta para o cliente aprovar o novo total."
                    : "Ajuste os valores, itens ou condições e reenvie a proposta atualizada.")
                : "O cliente não precisa ter conta no MeuAutônomo para visualizar e aceitar."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Cliente"
                value={form.clientId}
                onChange={value => setForm({ ...form, clientId: value })}
                placeholder="Selecionar"
                options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))}
              />
              <FormSelect
                label="Serviço principal"
                value={form.serviceId}
                onChange={value => {
                  const service = services.data?.find(item => String(item.id) === value);
                  setForm({
                    ...form,
                    serviceId: value,
                    items: service ? [{ description: service.name, quantity: "1", unitPrice: formatBrlInput(service.priceCents) }, ...form.items.slice(1)] : form.items
                  });
                }}
                placeholder="Selecionar"
                options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: s.name }))}
              />
            </div>
            <Field label="Descrição da proposta" value={form.description} onChange={value => setForm({ ...form, description: value })} placeholder="O que está sendo proposto?" />

            <div className="rounded-2xl bg-[#f5f8f2] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#38584f]">Itens e Mão de Obra</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, items: [...form.items, { description: "", quantity: "1", unitPrice: "" }] })}
                  className="h-8 rounded-lg border-[#dce5dc] bg-white text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar item
                </Button>
              </div>

              {/* Chips rápidos dos serviços do catálogo para inserir com 1 clique no orçamento */}
              {services.data && services.data.filter(s => s.active).length > 0 && (
                <div className="mb-3 rounded-xl border border-[#dce5dc] bg-white p-2.5">
                  <p className="text-[11px] font-semibold text-[#526d64] mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#708818]" />
                    Inserir serviço do seu catálogo neste orçamento:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {services.data.filter(s => s.active).map(srv => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          const existingEmptyIndex = form.items.findIndex(it => !it.description.trim() && !it.unitPrice.trim());
                          const newItem = {
                            description: srv.name,
                            quantity: "1",
                            unitPrice: formatBrlInput(srv.priceCents)
                          };
                          if (existingEmptyIndex !== -1) {
                            const newItems = [...form.items];
                            newItems[existingEmptyIndex] = newItem;
                            setForm({ ...form, items: newItems });
                          } else {
                            setForm({ ...form, items: [...form.items, newItem] });
                          }
                          toast.success(`"${srv.name}" adicionado aos itens do orçamento.`);
                        }}
                        className="rounded-lg border border-[#dce5dc] bg-[#fbfcf9] px-2 py-1 text-xs text-[#284b42] hover:border-[#173a34] hover:bg-[#f4f7f2] transition cursor-pointer"
                      >
                        + {srv.name} <span className="font-semibold text-[#173a34]">({money(srv.priceCents)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {form.items.map((item, index) => (
                <div key={index} className="mb-3 grid gap-3 rounded-xl border border-[#e3ebe0] bg-white p-3 sm:grid-cols-[1fr_90px_120px_auto]">
                  <Field label={index === 0 ? "Descrição" : ""} value={item.description} onChange={value => updateItem(index, { description: value })} />
                  <Field label={index === 0 ? "Qtd." : ""} value={item.quantity} onChange={value => updateItem(index, { quantity: value })} />
                  <Field label={index === 0 ? "Preço unit." : ""} prefix="R$ " value={item.unitPrice} onChange={value => updateItem(index, { unitPrice: value })} />
                  {form.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) })}
                      className="sm:mt-5 mt-1 self-end sm:self-auto h-10 px-2 text-[#9c4d43]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f5f8f2] p-3">
                <p className="text-xs text-[#82948e]">Subtotal</p>
                <p className="mt-1 font-bold text-[#173a34]">{money(subtotal)}</p>
              </div>
              <Field label="Desconto" prefix="R$ " value={form.discount} onChange={value => setForm({ ...form, discount: value })} />
              <div className="rounded-xl bg-[#173a34] p-3 text-white">
                <p className="text-xs text-white/65">Total</p>
                <p className="mt-1 font-bold">{money(total)}</p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Condições e Formas de Pagamento</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {paymentPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, paymentTerms: form.paymentTerms ? `${form.paymentTerms} ou ${preset}` : preset })}
                    className="rounded-full border border-[#dce5dc] bg-white px-2.5 py-1 text-xs text-[#4c6960] hover:bg-[#eef5d2] transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <Input
                value={form.paymentTerms}
                onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                placeholder="Ex.: PIX à vista ou Cartão em até 3x sem juros"
              />
              <p className="mt-1 text-[11px] text-[#82948e]">
                O pagamento será realizado diretamente com você. A plataforma não processa ou retém valores.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Validade</Label>
              <Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            </div>

            <div>
              <Label className="mb-2 block">Observações e garantias</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ex.: Garantia de 90 dias, materiais inclusos, etc." />
            </div>

            <label className="flex items-center gap-3 text-sm text-[#526d64]">
              <input type="checkbox" checked={form.sendNow} onChange={e => setForm({ ...form, sendNow: e.target.checked })} className="h-4 w-4 accent-[#173a34]" />
              {editingQuoteId ? "Reenviar e reabrir link para o cliente" : "Enviar agora e gerar link público"}
            </label>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={create.isPending || update.isPending} className="rounded-xl bg-[#173a34] text-white">
              {editingQuoteId ? (form.sendNow ? "Reenviar proposta revisada" : "Salvar alterações") : "Salvar orçamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agendar Atendimento a partir do Orçamento Aceito */}
      <Dialog open={scheduleQuoteModalOpen} onOpenChange={setScheduleQuoteModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Agendar Atendimento — Orçamento #{selectedQuoteForSchedule?.id}</DialogTitle>
            <DialogDescription>
              Marque o dia e horário para executar o serviço aceito por <strong>{selectedQuoteForSchedule?.clientName || "Cliente"}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="rounded-2xl border border-lime-300 bg-[#f7faf2] p-4 text-xs text-[#284b42]">
              <p><strong>Valor orçado:</strong> {money(selectedQuoteForSchedule?.totalCents)}</p>
              <p className="mt-1"><strong>Condições de pagamento:</strong> {selectedQuoteForSchedule?.paymentTerms || "Acerto direto com o prestador"}</p>
            </div>
            <div>
              <Label className="mb-2 block">Data e horário do atendimento</Label>
              <Input
                type="datetime-local"
                value={scheduleForm.startsAt}
                onChange={e => setScheduleForm({ ...scheduleForm, startsAt: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Duração estimada (minutos)"
                value={scheduleForm.durationMinutes}
                onChange={val => setScheduleForm({ ...scheduleForm, durationMinutes: val })}
              />
              <Field
                label="Local do atendimento"
                value={scheduleForm.location}
                onChange={val => setScheduleForm({ ...scheduleForm, location: val })}
                placeholder="Endereço ou local combinado"
              />
            </div>
            <div>
              <Label className="mb-2 block">Observações para o atendimento</Label>
              <Textarea
                value={scheduleForm.notes}
                onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                placeholder="Instruções, materiais a levar, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitScheduleQuote}
              disabled={scheduleQuoteMutation.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              Confirmar e colocar na Agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {createdToken && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d9e7bf] bg-[#f1f7dd] p-4 text-sm text-[#53674a] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-[#304d2c]">Link da proposta pronto!</strong> Envie para o cliente visualizar e responder.
          </div>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl);
              toast.success("Link copiado para a área de transferência.");
            }}
            className="rounded-xl border-[#c8d9a4] bg-white"
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar link
          </Button>
        </div>
      )}

      <div className="mb-5 grid gap-2.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 text-xs w-full min-w-0">
        <div className="rounded-2xl border border-[#dce5dc] bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#5d746d]">
            <span className="h-2 w-2 rounded-full bg-[#82948e]" />
            <span>Rascunho</span>
          </div>
          <p className="mt-1 text-[#82948e] leading-snug">Ainda não enviado ao cliente.</p>
        </div>
        <div className="rounded-2xl border border-[#cbe2f8] bg-[#f4f8fe] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#2d5c88]">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
            <span>Enviado</span>
          </div>
          <p className="mt-1 text-[#5d7d9e] leading-snug">O cliente recebeu o link e pode responder.</p>
        </div>
        <div className="rounded-2xl border border-[#c2e4cc] bg-[#f0f9f3] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#27663d]">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span>Aceito</span>
          </div>
          <p className="mt-1 text-[#518261] leading-snug">Cliente aprovou a proposta.</p>
        </div>
        <div className="rounded-2xl border border-[#f5d6cf] bg-[#fef5f3] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#963d30]">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span>Recusado / Ajuste</span>
          </div>
          <p className="mt-1 text-[#8e6059] leading-snug">Cliente pediu alteração ou recusou.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "todos", label: "Todos", count: quotes.data?.length || 0 },
            { id: "rascunho", label: "Rascunho", count: quotes.data?.filter(q => q.status === "rascunho").length || 0 },
            { id: "enviado", label: "Enviado", count: quotes.data?.filter(q => q.status === "enviado").length || 0 },
            { id: "aceito", label: "Aceito", count: quotes.data?.filter(q => q.status === "aceito").length || 0 },
            { id: "alteracao", label: "Alteração / Recusado", count: quotes.data?.filter(q => q.status === "alteracao_solicitada" || q.status === "recusado").length || 0 },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === tab.id
                  ? "bg-[#173a34] text-white"
                  : "border border-[#dce5dc] bg-white text-[#526d64] hover:bg-[#f5f8f2]"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-[#edf2ec] text-[#6b827a]"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, itens..."
            className="h-9 rounded-xl border-[#dce5dc] bg-white pl-9 text-xs"
          />
        </div>
      </div>

      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
        <CardContent className="p-0">
          {quotes.data?.length ? (
            <div className="divide-y divide-[#edf1eb]">
              {(quotes.data || []).filter(q => {
                if (statusFilter !== "todos") {
                  if (statusFilter === "alteracao") {
                    if (q.status !== "alteracao_solicitada" && q.status !== "recusado") return false;
                  } else if (q.status !== statusFilter) {
                    return false;
                  }
                }
                if (!search.trim()) return true;
                const cName = clients.data?.find(c => c.id === q.clientId)?.name || q.clientName || "";
                const itemsDesc = (q.items || []).map((it: any) => it.description).join(" ");
                return `${q.description || ""} ${cName} ${itemsDesc} ${q.paymentTerms || ""} ${q.notes || ""}`.toLowerCase().includes(search.toLowerCase());
              }).map(quote => {
                const clientObj = clients.data?.find(client => client.id === quote.clientId);
                const clientDisplayName = quote.clientName || clientObj?.name || "Cliente";
                const clientPhone = (quote as any).clientPhone || clientObj?.whatsapp || clientObj?.phone || "";

                return (
                  <div key={quote.id} className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8eef8] text-[#496b98]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#284b42]">{quote.description || `Orçamento #${quote.id}`}</h3>
                            <StatusBadge status={quote.status} />
                            {(quote as any).isScheduled && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-300">
                                <Check className="h-3 w-3 text-emerald-600" /> Agendado na agenda
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[#82948e]">
                            <strong className="text-[#284b42] font-semibold">{clientDisplayName}</strong> · {dateLabel(quote.createdAt)} · Total de {money(quote.totalCents)}
                          </p>
                          {quote.status === "aceito" && quote.clientName && (
                            <p className="mt-1 text-xs text-[#2e6e4a] font-medium">
                              <Check className="mr-1 inline h-3.5 w-3.5" /> Aprovado por {quote.clientName} {quote.clientEmail ? `(${quote.clientEmail})` : ""}
                            </p>
                          )}
                          {quote.status === "recusado" && (
                            <p className="mt-1 text-xs text-[#c0392b] font-medium">
                              <X className="mr-1 inline h-3.5 w-3.5" /> Proposta recusada pelo cliente
                            </p>
                          )}
                          {quote.paymentTerms && (
                            <p className="mt-1 text-xs text-[#526d64]">
                              <CreditCard className="mr-1 inline h-3.5 w-3.5 text-[#8aa500]" /> Pagamento: {quote.paymentTerms}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {quote.status === "rascunho" ? (
                          <Button
                            size="sm"
                            onClick={() => publishQuote.mutate({ id: quote.id })}
                            disabled={publishQuote.isPending}
                            className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs"
                          >
                            <Send className="mr-1.5 h-3.5 w-3.5" /> Publicar e gerar link
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rawPhone = clientPhone.replace(/\D/g, "");
                              const quoteUrl = `${window.location.origin}/orcamento/${quote.secureToken}`;
                              const desc = quote.description || "prestação de serviços";
                              const val = money(quote.totalCents);
                              const msg = encodeURIComponent(`Olá ${clientDisplayName}! Segue a proposta de orçamento referente a ${desc} no valor de ${val}.\n\nVocê pode consultar os itens detalhados e aprovar diretamente por este link seguro:\n${quoteUrl}\n\nQualquer dúvida estou à disposição!`);
                              if (rawPhone) {
                                window.open(`https://wa.me/55${rawPhone.replace(/^55/, "")}?text=${msg}`, "_blank");
                              } else {
                                navigator.clipboard?.writeText(decodeURIComponent(msg));
                                toast.success("Mensagem de orçamento copiada! Cole no WhatsApp do cliente.");
                              }
                            }}
                            className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#28564d] hover:bg-[#f0fdf4]"
                          >
                            <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> Enviar WhatsApp
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditQuote(quote)}
                          className={cn(
                            "rounded-xl border-[#dce5dc] bg-white text-xs text-[#4c6960]",
                            quote.status === "aceito" && "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          )}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> {quote.status === "aceito" ? "Revisar / Reabrir" : "Revisar / Editar"}
                        </Button>
                        {quote.status !== "rascunho" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard?.writeText(`${window.location.origin}/orcamento/${quote.secureToken}`);
                              toast.success("Link copiado.");
                            }}
                            className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#4c6960]"
                          >
                            <Link2 className="mr-1.5 h-3.5 w-3.5" /> Copiar link
                          </Button>
                        )}
                        {quote.status !== "rascunho" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/orcamento/${quote.secureToken}`, "_blank")}
                            className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#4c6960] hover:bg-[#f5f8f2]"
                            title="Visualizar e imprimir proposta em PDF"
                          >
                            <Printer className="mr-1.5 h-3.5 w-3.5 text-[#4c6960]" /> Imprimir PDF
                          </Button>
                        )}
                        {quote.status === "aceito" && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenScheduleModal(quote)}
                            className={cn(
                              "rounded-xl text-xs font-semibold text-white",
                              (quote as any).isScheduled
                                ? "bg-[#28564d] hover:bg-[#173a34]"
                                : "bg-[#173a34] hover:bg-[#28564d]"
                            )}
                          >
                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-[#d9f56a]" />
                            {(quote as any).isScheduled ? "Reagendar / Alterar data" : "Agendar na Agenda"}
                          </Button>
                        )}
                        {quote.status === "aceito" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReceiptQuote({
                                receiptNumber: `REC-${String(quote.id).padStart(4, "0")}`,
                                date: quote.respondedAt || quote.createdAt,
                                professionalName: profileQuery.data?.displayName || "Profissional",
                                profession: profileQuery.data?.professionName || "Prestador de Serviços",
                                professionalPhone: profileQuery.data?.whatsapp || profileQuery.data?.phone || "",
                                professionalCity: profileQuery.data?.city || "",
                                pixKey: profileQuery.data?.pixKey || "",
                                clientName: clientDisplayName,
                                clientPhone: clientPhone,
                                serviceDescription: quote.description || "Prestação de serviços orçados",
                                amountCents: quote.totalCents,
                                paymentMethod: quote.paymentTerms || "Acerto direto com o prestador",
                                authCode: (quote as any).receiptCode || `MA-REC-Q${quote.id}`,
                              });
                            }}
                            className="rounded-xl border-[#b3d7bf] bg-[#f0f7f2] text-xs font-semibold text-[#173a34] hover:bg-[#e1f0e5]"
                          >
                            <Receipt className="mr-1.5 h-3.5 w-3.5 text-[#2e6e4a]" /> Gerar Recibo
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita.")) {
                              deleteQuote.mutate({ id: quote.id });
                            }
                          }}
                          disabled={deleteQuote.isPending}
                          className="rounded-xl border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          title="Excluir este orçamento"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Excluir
                        </Button>
                      </div>
                    </div>

                    {quote.status === "alteracao_solicitada" && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
                        <div className="flex items-center gap-2 font-semibold text-amber-900 text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>O cliente solicitou alterações nesta proposta:</span>
                        </div>
                        <p className="mt-2 rounded-xl border border-amber-200 bg-white/90 p-3 text-xs leading-5 text-amber-950 font-medium">
                          "{quote.changeRequest || "Cliente solicitou alterações."}"
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openEditQuote(quote)}
                            className="h-8 rounded-lg bg-[#173a34] text-xs text-white hover:bg-[#28564d]"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Revisar Proposta e Reenviar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title="Nenhum orçamento ainda"
                description="Transforme uma solicitação em uma proposta profissional e envie um link simples."
                action={
                  <Button onClick={openNewQuote} className="rounded-xl bg-[#173a34] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Criar orçamento
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
      <ReceiptModal open={Boolean(receiptQuote)} onOpenChange={v => !v && setReceiptQuote(null)} data={receiptQuote} />
    </Page>
  );
}

export function MeuDia() {
  const summary = trpc.dashboard.summary.useQuery();
  const services = trpc.service.list.useQuery();
  const clients = trpc.customer.list.useQuery();
  if (summary.isLoading) return <LoadingScreen />;
  if (summary.error) return <Page title="Meu Dia" description="Não foi possível carregar sua rotina agora."><Button onClick={() => summary.refetch()} className="bg-[#173a34] text-white">Tentar novamente</Button></Page>;
  const data = summary.data!;
  return <Page title="Meu Dia" eyebrow="Comece por aqui" description="Sua rotina de hoje, sem distrações." help={<HelpButton title="Como funciona Meu Dia?"><p><strong>Meu Dia</strong> é um resumo focado no que importa agora — sem a distração de toda a plataforma.</p><p><strong>Métricas do topo:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Atendimentos</strong> — quantos estão na agenda de hoje.</li><li><strong>Previsto</strong> — valor total estimado dos atendimentos de hoje.</li><li><strong>Solicitações</strong> — pedidos novos que precisam de atenção.</li><li><strong>Orçamentos</strong> — propostas enviadas aguardando resposta do cliente.</li></ul><p><strong>O que precisa de atenção:</strong> Lista as solicitações novas e os orçamentos pendentes para você agir rapidamente sem precisar navegar pela plataforma.</p></HelpButton>}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Atendimentos" value={String(data.metrics.todayCount)} hint="na agenda de hoje" icon={CalendarDays} accent="lime" /><Metric title="Previsto" value={money(data.metrics.todayProjectedCents)} hint="em atendimentos" icon={WalletCards} accent="blue" /><Metric title="Solicitações" value={String(data.recentRequests.filter(item => item.status === "nova").length)} hint="aguardando atenção" icon={ClipboardList} accent="orange" /><Metric title="Orçamentos" value={String(data.pendingQuotes.length)} hint="aguardando resposta" icon={FileText} accent="green" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Agenda de hoje</CardTitle></CardHeader><CardContent className="p-0">{data.today.length ? <div className="divide-y divide-[#edf1eb]">{data.today.map(item => { const client = clients.data?.find(c => c.id === item.clientId); const service = services.data?.find(s => s.id === item.serviceId); return <div key={item.id} className="flex items-center gap-4 p-5"><div className="grid h-12 w-16 place-items-center rounded-xl bg-[#f1f7dd] text-sm font-bold text-[#718600]">{timeLabel(item.startsAt)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente a confirmar")}</p>{service && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{service.name}</span>}</div><p className="mt-1 truncate text-sm text-[#82948e]">{item.location ? `${item.location} · ` : ""}{money(item.amountCents)}</p></div><StatusBadge status={item.status} /></div>; })}</div> : <div className="p-8"><EmptyState icon={CalendarDays} title="Nenhum atendimento hoje" description="Seu dia está livre. Você pode usar o tempo para organizar clientes e propostas." /></div>}</CardContent></Card><div className="grid gap-6"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">O que precisa de atenção</CardTitle></CardHeader><CardContent className="space-y-3">{data.recentRequests.filter(item => item.status === "nova").map(item => <div key={`r-${item.id}`} className="rounded-xl bg-[#f1f7dd] p-4"><p className="text-sm font-semibold text-[#526b4d]">Nova solicitação de {item.requesterName}</p><p className="mt-1 text-xs text-[#82948e]">{item.description}</p></div>)}{data.pendingQuotes.map(item => <div key={`q-${item.id}`} className="rounded-xl bg-[#e8eef8] p-4"><p className="text-sm font-semibold text-[#496b98]">Orçamento aguardando resposta</p><p className="mt-1 text-xs text-[#82948e]">{item.description || `Orçamento #${item.id}`} · {money(item.totalCents)}</p></div>)}{!data.recentRequests.some(item => item.status === "nova") && !data.pendingQuotes.length && <p className="py-4 text-sm text-[#82948e]">Tudo em dia por enquanto.</p>}</CardContent></Card></div></div></Page>;
}

function safeIsoStart(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim().length < 10) return undefined;
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function safeIsoEnd(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim().length < 10) return undefined;
  const d = new Date(`${dateStr}T23:59:59.999`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const range = useMemo(() => ({
    from: safeIsoStart(from),
    to: safeIsoEnd(to),
  }), [from, to]);
  const report = trpc.reports.summary.useQuery(range);
  return <Page title="Relatórios" eyebrow="Entenda seu negócio" description="Indicadores simples para acompanhar o período escolhido." help={<HelpButton title="Como funciona Relatórios?"><p><strong>Relatórios</strong> mostra um resumo do seu negócio para o período selecionado.</p><p><strong>Métricas:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Faturamento</strong> — soma de todos os pagamentos registrados.</li><li><strong>Recebido</strong> — apenas os pagamentos com status "Pago".</li><li><strong>Pendente</strong> — valor ainda a receber.</li><li><strong>Atendimentos</strong> — quantidade de atendimentos não cancelados.</li><li><strong>Novos clientes</strong> — clientes cadastrados no período.</li></ul><p><strong>Filtro de período:</strong> Defina uma data inicial e final para ver os dados de qualquer intervalo. Sem filtro, exibe todos os registros.</p><p><strong>Clientes recorrentes:</strong> Clientes com mais de um atendimento registrado — um sinal de fidelização.</p></HelpButton>} action={<RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />}>
    {report.isLoading ? <LoadingScreen /> : report.error ? <EmptyState icon={BarChart3} title="Não foi possível carregar o relatório" description="Tente novamente em alguns instantes." action={<Button onClick={() => report.refetch()} className="rounded-xl bg-[#173a34] text-white">Tentar novamente</Button>} /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric title="Faturamento" value={money(report.data?.revenueCents)} hint="no período" icon={CircleDollarSign} accent="green" /><Metric title="Recebido" value={money(report.data?.receivedCents)} hint="pagamentos pagos" icon={WalletCards} accent="blue" /><Metric title="Pendente" value={money(report.data?.pendingCents)} hint="a receber" icon={ClipboardList} accent="orange" /><Metric title="Atendimentos" value={String(report.data?.appointmentCount || 0)} hint="não cancelados" icon={CalendarDays} accent="lime" /><Metric title="Novos clientes" value={String(report.data?.newClients || 0)} hint="no período" icon={Users} accent="green" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Serviços mais realizados</CardTitle></CardHeader><CardContent>{report.data?.topServices.length ? <div className="space-y-4">{report.data.topServices.map((item, index) => <div key={item.serviceId}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-[#526d64]">{index + 1}. {item.name}</span><span className="text-[#82948e]">{item.count} atendimento(s)</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1eb]"><div className="h-full rounded-full bg-[#8aa500]" style={{ width: `${Math.max(12, (item.count / report.data!.topServices[0].count) * 100)}%` }} /></div></div>)}</div> : <EmptyState icon={BarChart3} title="Sem atendimentos no período" description="Quando houver atendimentos, eles aparecerão neste resumo." />}</CardContent></Card><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Clientes recorrentes</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-[#173a34]">{report.data?.recurringClients || 0}</p><p className="mt-2 text-sm leading-6 text-[#82948e]">Clientes com 2 ou mais atendimentos no histórico.</p></CardContent></Card></div></>}
  </Page>;
}

function RangeFilter({ from, to, setFrom, setTo }: { from: string; to: string; setFrom: (value: string) => void; setTo: (value: string) => void }) { return <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm"><Label className="sr-only" htmlFor="period-from">De</Label><Input id="period-from" type="date" value={from} onChange={event => setFrom(event.target.value)} className="h-8 w-[132px] rounded-lg border-0 bg-[#f5f8f2] text-xs" /><span className="text-xs text-[#9aa9a3]">até</span><Label className="sr-only" htmlFor="period-to">Até</Label><Input id="period-to" type="date" value={to} onChange={event => setTo(event.target.value)} className="h-8 w-[132px] rounded-lg border-0 bg-[#f5f8f2] text-xs" />{(from || to) && <Button variant="ghost" onClick={() => { setFrom(""); setTo(""); }} className="h-8 rounded-lg px-2 text-xs text-[#71867f]">Limpar</Button>}</div>; }

function Finance() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const range = useMemo(() => ({
    from: safeIsoStart(from),
    to: safeIsoEnd(to),
  }), [from, to]);
  const profile = trpc.profile.get.useQuery();
  const isTeamMode = profile.data?.accountType === "equipe";
  const payments = trpc.payment.list.useQuery(range); const expenses = trpc.expense.list.useQuery(range); const summary = trpc.dashboard.summary.useQuery(range); const clients = trpc.customer.list.useQuery(); const services = trpc.service.list.useQuery(); const teamMembers = trpc.team.list.useQuery(); const utils = trpc.useUtils();
  const createPayment = trpc.payment.create.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado.");
      utils.payment.list.invalidate();
      utils.dashboard.summary.invalidate();
      utils.reports.summary.invalidate();
      utils.appointment.list.invalidate();
      setPaymentOpen(false);
    },
    onError: err => {
      toast.error(err.message || "Não foi possível registrar o pagamento.");
    }
  });
  const createExpense = trpc.expense.create.useMutation({
    onSuccess: () => {
      toast.success("Despesa registrada.");
      utils.expense.list.invalidate();
      utils.dashboard.summary.invalidate();
      utils.reports.summary.invalidate();
      setExpenseOpen(false);
    },
    onError: err => {
      toast.error(err.message || "Não foi possível registrar a despesa.");
    }
  });
  const [paymentOpen, setPaymentOpen] = useState(false); const [expenseOpen, setExpenseOpen] = useState(false);
  const [payment, setPayment] = useState({ clientId: "", serviceId: "", teamMemberId: "", amount: "", method: "pix" as "pix" | "dinheiro" | "cartao" | "transferencia" | "outro", status: "pago" as "pago" | "pendente" | "parcial", note: "" });
  const [expense, setExpense] = useState({ description: "", category: "", amount: "", note: "" });
  const submitPayment = () => {
    if (createPayment.isPending) return;
    if (payment.amount.includes("-")) return toast.error("O valor da receita não pode ser negativo.");
    const cents = parseBrlToCents(payment.amount);
    if (cents <= 0) return toast.error("Informe um valor válido e positivo para a receita.");
    if (cents > 100_000_000) return toast.error("O valor máximo permitido para uma movimentação é de R$ 1.000.000,00.");
    createPayment.mutate({
      clientId: payment.clientId ? Number(payment.clientId) : undefined,
      serviceId: payment.serviceId ? Number(payment.serviceId) : undefined,
      teamMemberId: payment.teamMemberId ? Number(payment.teamMemberId) : undefined,
      amountCents: cents,
      method: payment.method,
      status: payment.status,
      note: payment.note || undefined
    });
  };
  const submitExpense = () => {
    if (createExpense.isPending) return;
    if (expense.amount.includes("-")) return toast.error("O valor da despesa não pode ser negativo.");
    const cents = parseBrlToCents(expense.amount);
    if (!expense.description || !expense.description.trim()) return toast.error("Informe a descrição da despesa.");
    if (cents <= 0) return toast.error("Informe um valor válido e positivo para a despesa.");
    if (cents > 100_000_000) return toast.error("O valor máximo permitido para uma despesa é de R$ 1.000.000,00.");
    createExpense.mutate({
      description: expense.description,
      category: expense.category || undefined,
      amountCents: cents,
      note: expense.note || undefined
    });
  };
  const received = (payments.data || []).filter(p => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0); const pending = (payments.data || []).filter(p => p.status !== "pago").reduce((sum, p) => sum + p.amountCents, 0); const spent = (expenses.data || []).reduce((sum, item) => sum + item.amountCents, 0);
  return <Page title="Financeiro" eyebrow="Dinheiro sem complicação" description="Registre receitas e despesas. Sem números inventados: tudo vem dos seus lançamentos." help={<HelpButton title="Como funciona Financeiro?"><p><strong>Financeiro</strong> registra todas as movimentações do seu negócio — receitas e despesas.</p><p><strong>Receitas (entradas):</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Pago</strong> — dinheiro já recebido, conta no saldo.</li><li><strong>Pendente</strong> — combinado mas ainda não pago.</li><li><strong>Parcial</strong> — parte foi paga, o resto está pendente.</li></ul><p><strong>Despesas (saídas):</strong> Custos do seu trabalho — materiais, deslocamento, ferramentas etc.</p><p><strong>Saldo:</strong> Receitas pagas menos despesas registradas no período.</p><p><strong>Filtro de período:</strong> Selecione um intervalo de datas para ver só o que aconteceu naquele período.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} /><Button onClick={() => setExpenseOpen(true)} variant="outline" className="h-11 rounded-xl border-[#dce5dc] bg-white text-[#4c6960]"><Plus className="mr-2 h-4 w-4" /> Nova despesa</Button><Button onClick={() => setPaymentOpen(true)} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Registrar receita</Button></div>}>
    <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] w-full max-w-lg min-w-0"><DialogHeader><DialogTitle>Registrar receita</DialogTitle><DialogDescription>Pagamento recebido ou a receber.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormSelect label="Cliente" value={payment.clientId} onChange={value => setPayment({ ...payment, clientId: value })} placeholder="Selecionar cliente" options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))} /><FormSelect label="Serviço" value={payment.serviceId} onChange={value => { const svc = services.data?.find(s => String(s.id) === value); setPayment({ ...payment, serviceId: value, amount: svc && (!payment.amount || payment.amount === "0" || payment.amount === "0,00") ? formatBrlInput(svc.priceCents) : payment.amount }); }} placeholder="Selecionar serviço" options={(services.data || []).filter(service => service.active).map(service => ({ value: String(service.id), label: service.name }))} />{isTeamMode && Boolean(teamMembers.data?.length) && <FormSelect label="Profissional / Parceiro(a)" value={payment.teamMemberId} onChange={value => setPayment({ ...payment, teamMemberId: value })} placeholder="Receita própria (sem comissão)" options={[{ value: "", label: "Receita própria (sem comissão)" }, ...(teamMembers.data || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role || "Parceiro"} - ${m.commissionPercent}% comissão)` }))]} />}<Field label="Valor" prefix="R$ " value={payment.amount} onChange={value => setPayment({ ...payment, amount: value })} /><div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Forma" value={payment.method} onChange={value => setPayment({ ...payment, method: value as typeof payment.method })} options={[["pix","Pix"],["dinheiro","Dinheiro"],["cartao","Cartão"],["transferencia","Transferência"],["outro","Outro"]].map(([value,label]) => ({ value, label }))} /><FormSelect label="Situação" value={payment.status} onChange={value => setPayment({ ...payment, status: value as typeof payment.status })} options={[["pago","Pago"],["pendente","Pendente"],["parcial","Parcial"]].map(([value,label]) => ({ value, label }))} /></div><Field label="Observação" value={payment.note} onChange={value => setPayment({ ...payment, note: value })} /></div><DialogFooter><Button onClick={submitPayment} disabled={createPayment.isPending} className="rounded-xl bg-[#173a34] text-white">{createPayment.isPending ? "Salvando..." : "Salvar receita"}</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] w-full max-w-lg min-w-0"><DialogHeader><DialogTitle>Nova despesa</DialogTitle><DialogDescription>Registre um custo real do seu trabalho.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="Descrição" value={expense.description} onChange={value => setExpense({ ...expense, description: value })} placeholder="Ex.: Material elétrico" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Categoria" value={expense.category} onChange={value => setExpense({ ...expense, category: value })} placeholder="Ex.: Materiais" /><Field label="Valor" prefix="R$ " value={expense.amount} onChange={value => setExpense({ ...expense, amount: value })} /></div><Field label="Observação" value={expense.note} onChange={value => setExpense({ ...expense, note: value })} /></div><DialogFooter><Button onClick={submitExpense} disabled={createExpense.isPending} className="rounded-xl bg-[#173a34] text-white">{createExpense.isPending ? "Salvando..." : "Salvar despesa"}</Button></DialogFooter></DialogContent></Dialog>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Recebido" value={money(received)} hint="receitas pagas" icon={CircleDollarSign} accent="green" /><Metric title="Pendente" value={money(pending)} hint="a receber" icon={ClipboardList} accent="orange" /><Metric title="Despesas" value={money(spent)} hint="custos registrados" icon={WalletCards} accent="blue" /><Metric title="Saldo" value={money(received - spent)} hint="recebido menos despesas" icon={CircleDollarSign} accent="lime" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg text-[#173a34]">Resumo do período</CardTitle><p className="mt-1 text-sm text-[#82948e]">Receitas pagas, valores pendentes e despesas por dia.</p></div><BarChart3 className="h-5 w-5 text-[#8aa500]" /></div></CardHeader><CardContent className="pt-0">{summary.isLoading ? <div className="grid h-[250px] place-items-center text-sm text-[#82948e]">Carregando gráfico…</div> : summary.data?.monthlySeries.length ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={summary.data.monthlySeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tickFormatter={value => String(value).slice(8, 10)} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis tickFormatter={value => `R$ ${Math.round(Number(value) / 100)}`} tickLine={false} axisLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip formatter={(value, name) => [money(Number(value)), name === "receitas" ? "Receitas" : name === "pendentes" ? "Pendentes" : "Despesas"]} labelFormatter={value => `Dia ${String(value).slice(8, 10)}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} /><Legend formatter={value => value === "receitas" ? "Receitas" : value === "pendentes" ? "Pendentes" : "Despesas"} iconType="circle" /><Line type="monotone" dataKey="receitas" stroke="var(--chart-1)" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="pendentes" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" dot={false} /><Line type="monotone" dataKey="despesas" stroke="var(--destructive)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <div className="grid h-[250px] place-items-center rounded-2xl bg-[#f5f8f2] text-center"><div><BarChart3 className="mx-auto h-7 w-7 text-[#9bad9a]" /><p className="mt-3 text-sm font-semibold text-[#526d64]">Nenhuma movimentação no período</p><p className="mt-1 text-xs text-[#82948e]">O gráfico aparecerá quando você registrar receitas ou despesas.</p></div></div>}</CardContent></Card>
      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Saldo acumulado</CardTitle><p className="text-sm text-[#82948e]">Evolução do saldo recebido menos despesas.</p></CardHeader><CardContent className="pt-0">{summary.data?.monthlySeries.length ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.data.monthlySeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tickFormatter={value => String(value).slice(8, 10)} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis tickFormatter={value => `R$ ${Math.round(Number(value) / 100)}`} tickLine={false} axisLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip formatter={value => [money(Number(value)), "Saldo"]} labelFormatter={value => `Dia ${String(value).slice(8, 10)}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} /><Bar dataKey="saldo" fill="var(--chart-2)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="grid h-[250px] place-items-center text-sm text-[#82948e]">Sem dados para calcular o saldo.</div>}</CardContent></Card>
    </div>
    <Card className="mt-6 rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Movimentações</CardTitle></CardHeader><CardContent className="p-0">{payments.data?.length || expenses.data?.length ? <div className="divide-y divide-[#edf1eb]">{payments.data?.map(item => { const member = teamMembers.data?.find(m => m.id === item.teamMemberId); const client = clients.data?.find(c => c.id === item.clientId); const service = services.data?.find(s => s.id === item.serviceId); const clientName = client?.name || (item as any).clientName || (item.clientId ? `Cliente #${item.clientId}` : "Receita"); const serviceName = service?.name || (item as any).serviceName; return <div key={`p-${item.id}`} className="flex items-center gap-3 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c]"><WalletCards className="h-4 w-4" /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{clientName}</p>{serviceName && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{serviceName}</span>}{isTeamMode && member && <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f1f5] px-2 py-0.5 text-xs font-semibold text-[#2f5e77]"><UserCheck className="h-3 w-3" />{member.name} ({item.commissionPercent || member.commissionPercent}%)</span>}</div><p className="mt-1 text-xs text-[#82948e]">{item.method.toUpperCase()} · {dateLabel(item.createdAt)}{isTeamMode && item.commissionAmountCents ? ` · Repasse parceiro: ${money(item.commissionAmountCents)}` : ""}</p></div><div className="text-right"><p className="font-bold text-[#173a34]">+ {money(item.amountCents)}</p><StatusBadge status={item.status} /></div></div>; })}{expenses.data?.map(item => <div key={`e-${item.id}`} className="flex items-center gap-3 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9e5e3] text-[#9c4d43]"><WalletCards className="h-4 w-4" /></div><div className="flex-1"><p className="font-semibold text-[#284b42]">{item.description}</p><p className="mt-1 text-xs text-[#82948e]">{item.category || "Despesa"} · {dateLabel(item.occurredAt)}</p></div><p className="font-bold text-[#9c4d43]">- {money(item.amountCents)}</p></div>)}</div> : <div className="p-8"><EmptyState icon={CircleDollarSign} title="Nenhuma movimentação registrada" description="Quando você registrar uma receita ou despesa, ela aparecerá aqui." /></div>}</CardContent></Card>
  </Page>;
}

export { TeamPage, IndividualTeamPromo, TeamModuleView, PARTNER_BADGE_COLORS, parsePartnerAvatar } from "./TeamPage";


function ProfessionalCard() {
  const profile = trpc.profile.get.useQuery();
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  if (!profile.data) return null;
  const shareUrl = `${window.location.origin}/p/${profile.data.slug}`;
  const copy = () => {
    navigator.clipboard?.writeText(shareUrl);
    toast.success("Link do cartão copiado!");
  };

  const handleShareWhatsApp = () => {
    const name = profile.data?.displayName || "Profissional";
    const profession = profile.data?.professionName ? ` (${profile.data.professionName})` : "";
    const text = `Olá! Aqui é *${name}*${profession} ✨\n\nAcesse meu cartão profissional para ver meus serviços, valores e agendar seu horário:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareFacebook = () => {
    const name = profile.data?.displayName || "Profissional";
    const profession = profile.data?.professionName ? ` (${profile.data.professionName})` : "";
    const text = `Conheça meu trabalho como ${name}${profession}! Acesse meu cartão profissional para ver serviços, valores e agendar seu horário:\n${shareUrl}`;
    navigator.clipboard?.writeText(text);
    toast.success("Texto copiado! Cole na sua publicação do Facebook.", { duration: 4000 });
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=500,menubar=no,toolbar=no");
  };

  const handleNativeShare = () => {
    const name = profile.data?.displayName || "Profissional";
    const profession = profile.data?.professionName || "Cartão Profissional";
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      navigator.share({
        title: `${name} — ${profession}`,
        text: `Olá! Aqui é ${name} (${profession}). Acesse meu cartão profissional para ver serviços e agendar seu atendimento:\n`,
        url: shareUrl,
      }).catch(() => copy());
    } else {
      copy();
    }
  };

  return (
    <Page
      title="Meu cartão"
      eyebrow="Sua presença profissional"
      description="Um link simples para compartilhar onde seus clientes já estão."
      help={
        <HelpButton title="Como funciona meu Cartão?">
          <p><strong>Meu Cartão</strong> é sua presença digital — um link público para compartilhar com clientes.</p>
          <p><strong>Link público:</strong> Seu link único no formato <code>meuautonomo.creativeam.com.br/p/seu-slug</code>. Clientes acessam sem precisar criar conta.</p>
          <p><strong>Como divulgar:</strong> Coloque o link na bio do Instagram, no status do WhatsApp e em suas propostas.</p>
          <p>Clientes que acessam seu cartão podem preencher uma solicitação que cai direto em <strong>Solicitações</strong>.</p>
        </HelpButton>
      }
    >
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[0.85fr_1.15fr] w-full min-w-0 max-w-full">
        {/* PRÉVIA DO CARTÃO DIGITAL DO PROFISSIONAL */}
        <Card className="overflow-hidden rounded-[24px] sm:rounded-[28px] border-0 bg-[#173a34] text-white shadow-[0_16px_45px_rgba(19,42,39,0.18)] w-full min-w-0">
          <CardContent className="relative p-5 sm:p-7 md:p-9 min-w-0">
            <div className="absolute -right-10 -top-10 h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-[#d9f56a]/10 pointer-events-none" />
            <div className="relative min-w-0">
              <div className="mb-6 sm:mb-8 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#d9f56a]" /> MeuAutônomo
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75 shrink-0">
                  Cartão digital
                </span>
              </div>

              <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-[#d9f56a] text-xl sm:text-2xl font-extrabold text-[#173a34] shadow-sm">
                {profile.data.avatarUrl ? (
                  <img src={profile.data.avatarUrl} alt={profile.data.displayName} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  profile.data.displayName.charAt(0).toUpperCase()
                )}
              </div>

              <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-words text-white">
                {profile.data.displayName}
              </h2>
              <p className="mt-1 text-sm sm:text-base md:text-lg font-medium text-[#d9f56a] break-words">
                {profile.data.professionName}
              </p>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-white/70 break-words">
                {profile.data.bio || "Profissional autônomo pronto para ajudar você com agilidade e qualidade."}
              </p>

              <div className="mt-5 sm:mt-6 space-y-2 border-t border-white/10 pt-4 text-xs sm:text-sm text-white/75">
                {profile.data.serviceRegion && (
                  <p className="flex items-start gap-2 break-words">
                    <MapPin className="h-4 w-4 text-[#d9f56a] shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">Atende em {profile.data.serviceRegion}</span>
                  </p>
                )}
                {profile.data.whatsapp && (
                  <p className="flex items-center gap-2 break-words">
                    <Share2 className="h-4 w-4 text-[#d9f56a] shrink-0" />
                    <span className="min-w-0 break-words">{formatPhone(profile.data.whatsapp)}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CONTROLES DE COMPARTILHAMENTO E DICAS */}
        <div className="space-y-4 sm:space-y-5 w-full min-w-0">
          <Card className="rounded-[22px] sm:rounded-[24px] border-0 bg-white shadow-[0_10px_35px_rgba(19,42,39,0.05)] w-full min-w-0">
            <CardContent className="p-4 sm:p-6 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815] shrink-0">
                  <Link2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#284b42] text-sm sm:text-base truncate">Seu link público</h3>
                  <p className="text-xs text-[#82948e] truncate">Compartilhe e receba novas solicitações</p>
                </div>
              </div>

              {/* CAIXA COM LINK DO CARTÃO COM ZERO ESTOURO */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f5f8f2] p-2.5 sm:p-3 border border-[#dce5dc] w-full min-w-0 overflow-hidden">
                <span className="min-w-0 flex-1 truncate text-xs sm:text-sm text-[#406157] font-medium select-all">
                  {shareUrl}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copy}
                  className="h-8 px-2.5 shrink-0 rounded-lg border-[#dce5dc] bg-white text-xs font-bold text-[#173a34] hover:bg-[#ebf3ea]"
                  title="Copiar link"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
                </Button>
              </div>

              {/* BOTÕES DE AÇÃO TOTALMENTE RESPONSIVOS PARA MOBILE */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5 w-full">
                <Button
                  onClick={handleNativeShare}
                  className="h-11 w-full sm:flex-1 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                >
                  <Share2 className="mr-2 h-4 w-4 text-[#d9f56a]" /> Compartilhar cartão
                </Button>
                <a
                  href={`/p/${profile.data.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 block"
                >
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl border-[#dce5dc] bg-white text-[#4c6960] hover:bg-[#f4f7f2] text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Abrir página
                  </Button>
                </a>
              </div>

              {/* REDES SOCIAIS: WHATSAPP, FACEBOOK E INSTAGRAM */}
              <div className="mt-3.5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6d887f]">Divulgar nas redes sociais</p>
                
                {/* WHATSAPP */}
                <Button
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="h-10 sm:h-11 w-full rounded-xl border-[#cbe4d1] bg-[#eef7f0] text-[#173a34] hover:bg-[#dff1e3] text-xs sm:text-sm font-semibold cursor-pointer justify-start px-4"
                >
                  <Share2 className="mr-2.5 h-4 w-4 text-[#25D366] shrink-0" /> Enviar no WhatsApp
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* FACEBOOK */}
                  <Button
                    variant="outline"
                    onClick={handleShareFacebook}
                    className="h-10 sm:h-11 w-full rounded-xl border-[#cdddec] bg-[#f0f6fc] text-[#1877F2] hover:bg-[#e4effa] text-xs sm:text-sm font-semibold cursor-pointer justify-start px-3.5"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 text-[#1877F2] shrink-0" /> Postar no Facebook
                  </Button>

                  {/* INSTAGRAM */}
                  <Button
                    variant="outline"
                    onClick={() => setInstagramModalOpen(true)}
                    className="h-10 sm:h-11 w-full rounded-xl border-[#ebd2e0] bg-[#fdf2f7] text-[#C13584] hover:bg-[#fae6f1] text-xs sm:text-sm font-semibold cursor-pointer justify-start px-3.5"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-[#C13584] shrink-0" /> Como usar no Instagram
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[22px] sm:rounded-[24px] border-0 bg-[#f1f7dd] w-full min-w-0">
            <CardContent className="p-4 sm:p-6 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#52674c]">Dica de divulgação</p>
              <p className="mt-1.5 text-base sm:text-lg font-bold text-[#304d2c] leading-snug">Seu cartão é seu ponto de encontro.</p>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6d805f]">
                Coloque o link na <strong>bio do Instagram</strong>, poste no <strong>Facebook</strong>, envie no status do WhatsApp e compartilhe com cada cliente após um atendimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIÁLOGO / GUIA VISUAL DE COMO USAR NO INSTAGRAM */}
      <Dialog open={instagramModalOpen} onOpenChange={setInstagramModalOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-lg max-h-[85vh] p-4 sm:p-6 flex flex-col rounded-[22px] sm:rounded-[26px]">
          <DialogHeader className="text-left shrink-0 pb-2 border-b border-[#edf1eb]">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#173a34]">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#C13584] shrink-0" /> Como divulgar no Instagram
            </DialogTitle>
            <DialogDescription className="text-xs text-[#71867f]">
              Compartilhe seu cartão no seu perfil e nos Stories:
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-2.5 pr-1 text-xs sm:text-sm text-[#406157]">
            {/* Opção 1: Bio */}
            <div className="rounded-xl border border-[#dce5dc] bg-[#fbfcf9] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#173a34] text-xs sm:text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fdf2f7] text-[#C13584] text-[11px] font-extrabold shrink-0">1</span>
                <span>Link na Bio do Instagram</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#627e74] leading-relaxed">
                No app do Instagram: vá em <strong>Editar perfil</strong> ➔ <strong>Links</strong> ➔ <strong>Adicionar link externo</strong> e cole o link do seu cartão.
              </p>
            </div>

            {/* Opção 2: Stories */}
            <div className="rounded-xl border border-[#dce5dc] bg-[#fbfcf9] p-3 sm:p-3.5 space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#173a34] text-xs sm:text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fdf2f7] text-[#C13584] text-[11px] font-extrabold shrink-0">2</span>
                <span>Figurinha de Link nos Stories</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#627e74] leading-relaxed">
                Poste uma foto do seu trabalho nos Stories, toque em <strong>Figurinhas</strong>, selecione <strong>"LINK"</strong>, cole seu link e publique.
              </p>
            </div>

            {/* Caixa com o link para cópia imediata */}
            <div className="rounded-xl border border-pink-200 bg-[#fff5f9] p-2.5 sm:p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-[#8a2d59] block">Seu link para colar no Instagram:</span>
              <div className="flex items-center gap-2 bg-white p-1.5 sm:p-2 rounded-lg border border-pink-100 min-w-0">
                <span className="text-[11px] sm:text-xs font-mono text-[#173a34] truncate min-w-0 flex-1 select-all px-1">
                  {shareUrl}
                </span>
                <Button
                  size="sm"
                  onClick={copy}
                  className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-md bg-[#C13584] hover:bg-[#a92b71] text-white text-[11px] sm:text-xs font-bold shrink-0 cursor-pointer"
                >
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" /> Copiar
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 pt-2 border-t border-[#edf1eb]">
            <Button
              onClick={() => setInstagramModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Entendido!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

function SettingsPage() {
  const profile = trpc.profile.get.useQuery();
  const availability = trpc.profile.getAvailability.useQuery();
  const update = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas.");
      profile.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao salvar configurações.");
    }
  });
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (res: any) => {
      toast.success("Foto atualizada.");
      if (res?.avatarUrl) {
        setForm((prev: any) => ({ ...(prev || profile.data), avatarUrl: res.avatarUrl }));
      }
      profile.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar foto de perfil.");
    }
  });
  const saveAvailability = trpc.profile.saveAvailability.useMutation({
    onSuccess: () => {
      toast.success("Horários salvos.");
      availability.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao salvar horários de disponibilidade.");
    }
  });
  const setAccountTypeMutation = trpc.profile.setAccountType.useMutation({
    onSuccess: (res) => {
      toast.success(res.accountType === "equipe" ? "Modo Equipe & Estúdio ativado!" : "Modo Individual ativado!");
      profile.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao alterar modo.");
    }
  });
  const resetDb = trpc.database.reset.useMutation({
    onSuccess: () => {
      toast.success("Banco zerado com sucesso!");
      setTimeout(() => window.location.reload(), 700);
    }
  });

  const [form, setForm] = useState<any>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [availabilityTimes, setAvailabilityTimes] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    if (availability.data?.schedule) {
      try {
        const parsed = JSON.parse(availability.data.schedule);
        setAvailabilityTimes({
          start: parsed.start || "08:00",
          end: parsed.end || "18:00"
        });
      } catch {
        setAvailabilityTimes({ start: "08:00", end: "18:00" });
      }
    } else if (!availability.isLoading && !availabilityTimes) {
      setAvailabilityTimes({ start: "08:00", end: "18:00" });
    }
  }, [availability.data, availability.isLoading]);

  if (!profile.data) return null;

  const current = form || {
    displayName: profile.data.displayName,
    slug: profile.data.slug,
    professionCategory: profile.data.professionCategory || "",
    professionName: profile.data.professionName,
    bio: profile.data.bio || "",
    city: profile.data.city || "",
    serviceRegion: profile.data.serviceRegion || "",
    phone: profile.data.phone || "",
    whatsapp: profile.data.whatsapp || "",
    avatarUrl: profile.data.avatarUrl || "",
    showPrices: profile.data.showPrices,
    bookingEnabled: profile.data.bookingEnabled,
    pixKey: profile.data.pixKey || "",
    pixKeyType: profile.data.pixKeyType || "cpf",
  };

  const save = () => {
    if (!current.displayName || !current.displayName.trim()) {
      return toast.error("Nome do perfil é obrigatório.");
    }
    if (current.displayName.trim().length > 120) {
      return toast.error("Nome do perfil deve ter no máximo 120 caracteres.");
    }
    if (current.whatsapp && current.whatsapp.trim()) {
      const cleanWa = current.whatsapp.replace(/\D/g, "");
      if (cleanWa.length < 10 || cleanWa.length > 11) {
        return toast.error("WhatsApp deve conter DDD e 8 ou 9 dígitos.");
      }
    }
    if (current.phone && current.phone.trim()) {
      const cleanPh = current.phone.replace(/\D/g, "");
      if (cleanPh.length < 10 || cleanPh.length > 11) {
        return toast.error("Telefone deve conter DDD e 8 ou 9 dígitos.");
      }
    }
    if (current.pixKey && current.pixKey.trim()) {
      const pKey = current.pixKey.trim();
      const pType = current.pixKeyType || "cpf";
      const cleanDigits = pKey.replace(/\D/g, "");
      if (pType === "cpf" && cleanDigits.length !== 11) {
        return toast.error("Chave PIX do tipo CPF deve conter 11 dígitos.");
      }
      if (pType === "cnpj" && cleanDigits.length !== 14) {
        return toast.error("Chave PIX do tipo CNPJ deve conter 14 dígitos.");
      }
      if (pType === "telefone" && (cleanDigits.length < 10 || cleanDigits.length > 11)) {
        return toast.error("Chave PIX do tipo telefone deve conter DDD + número (10 ou 11 dígitos).");
      }
      if (pType === "email" && (!pKey.includes("@") || !pKey.includes("."))) {
        return toast.error("Chave PIX do tipo e-mail inválida.");
      }
    }

    const spellBio = current.bio ? checkServiceSpelling(current.bio) : null;
    const finalBio = spellBio?.hasCorrection ? spellBio.correctedText : current.bio;
    update.mutate({
      ...current,
      professionCategory: current.professionCategory || undefined,
      city: current.city || undefined,
      serviceRegion: current.serviceRegion || undefined,
      bio: finalBio || undefined,
      phone: current.phone ? current.phone.trim() : "",
      whatsapp: current.whatsapp ? current.whatsapp.trim() : "",
      avatarUrl: current.avatarUrl || undefined,
      pixKey: current.pixKey ? current.pixKey.trim() : "",
      pixKeyType: current.pixKeyType || undefined,
    });
  };

  return (
    <Page
      title="Configurações"
      eyebrow="Seu espaço, do seu jeito"
      description="Atualize seus dados públicos, chave PIX e sua disponibilidade."
      help={
        <HelpButton title="Como funciona Configurações?">
          <p><strong>Configurações</strong> é onde você ajusta seu perfil profissional, sua chave PIX e sua disponibilidade de horários.</p>
          <p><strong>Perfil público:</strong> Nome, profissão, endereço público (slug), cidade, WhatsApp e descrição aparecem no seu cartão e página pública.</p>
          <p><strong>Chave PIX:</strong> Configurada aqui, ela aparece com botão de 1 clique "Copiar PIX" nos orçamentos aprovados e nos recibos digitais.</p>
          <p><strong>Foto de perfil:</strong> Imagens até 5 MB nos formatos JPEG, PNG ou WebP.</p>
          <p><strong>Disponibilidade:</strong> Defina horário de início e fim para que o sistema valide novos agendamentos.</p>
        </HelpButton>
      }
    >
      <div className="space-y-6 w-full min-w-0">
        {/* CARD MODO DE OPERAÇÃO (INDIVIDUAL VS EQUIPE) */}
        <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] w-full min-w-0">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-[#173a34] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#8aa500]" />
                  Modo de Operação do MeuAutônomo
                </CardTitle>
                <p className="mt-1 text-sm text-[#71867f]">
                  Alterne entre o modo individual (você sozinho) e o modo equipe & estúdio (com parceiros ou ajudantes).
                </p>
              </div>
              <Badge
                className={cn(
                  "px-3 py-1 text-xs font-bold w-fit",
                  profile.data.accountType === "equipe"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-[#eef5d2] text-[#6d8300]"
                )}
              >
                {profile.data.accountType === "equipe"
                  ? "👥 Modo Atual: Equipe & Estúdio"
                  : "👤 Modo Atual: Individual"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid gap-4 md:grid-cols-2 w-full min-w-0">
              <div
                className={cn(
                  "rounded-2xl border-2 p-4 transition-all flex flex-col justify-between min-w-0",
                  profile.data.accountType === "individual"
                    ? "border-[#173a34] bg-[#f9fbf8]"
                    : "border-[#edf1eb] bg-white opacity-85"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                      <UserRound className="h-4 w-4 text-[#8aa500]" />
                      <span>MeuAutônomo Individual</span>
                    </div>
                    {profile.data.accountType === "individual" && (
                      <span className="text-[10px] font-bold text-[#8aa500] uppercase tracking-wider">Ativo</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#526d64] leading-relaxed">
                    Ideal para quem trabalha por conta própria (marido de aluguel, eletricista, manicure solo). Menus simplificados, orçamentos rápidos e agenda pessoal sem divisão de comissões.
                  </p>
                </div>
                {profile.data.accountType !== "individual" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAccountTypeMutation.mutate({ accountType: "individual" })}
                    disabled={setAccountTypeMutation.isPending}
                    className="mt-4 rounded-xl border-[#dce5dc] text-xs font-bold text-[#173a34] hover:bg-[#f4f7f2]"
                  >
                    Mudar para Modo Individual
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "rounded-2xl border-2 p-4 transition-all flex flex-col justify-between min-w-0",
                  profile.data.accountType === "equipe"
                    ? "border-purple-600 bg-[#faf5ff]"
                    : "border-[#edf1eb] bg-white opacity-85"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                      <Users className="h-4 w-4 text-purple-700" />
                      <span>MeuAutônomo Equipe & Estúdio</span>
                    </div>
                    {profile.data.accountType === "equipe" && (
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Ativo</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#526d64] leading-relaxed">
                    Ideal para salões, barbearias, oficinas e equipes. Libera a aba <strong>Equipe / Parceiros</strong>, divisão automática de comissões (Lei do Salão-Parceiro) e agenda simultânea.
                  </p>
                </div>
                {profile.data.accountType !== "equipe" && (
                  <Button
                    size="sm"
                    onClick={() => setAccountTypeMutation.mutate({ accountType: "equipe" })}
                    disabled={setAccountTypeMutation.isPending}
                    className="mt-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-xs font-bold text-white shadow-xs"
                  >
                    Ativar Modo Equipe & Estúdio
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GRID PERFIL PROFISSIONAL + CHAVE PIX & DISPONIBILIDADE */}
        <div className="grid gap-6 lg:grid-cols-12 w-full min-w-0 items-start">
          {/* PERFIL PROFISSIONAL */}
          <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] lg:col-span-7 w-full min-w-0">
            <CardHeader>
              <CardTitle className="text-lg text-[#173a34]">Perfil profissional</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 w-full min-w-0">
              <div className="flex items-center gap-4 rounded-2xl bg-[#f5f8f2] p-4 min-w-0">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#d9f56a] text-xl font-bold text-[#173a34]">
                  {current.avatarUrl ? <img src={current.avatarUrl} alt={current.displayName} className="h-full w-full object-cover" /> : current.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="mb-1 block text-sm text-[#38584f]">Foto do perfil</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                        return toast.error("Formato não suportado. Escolha uma imagem JPEG, PNG ou WebP.");
                      }
                      if (file.size > 5_000_000) return toast.error("Escolha uma imagem de até 5 MB.");
                      const reader = new FileReader();
                      reader.onload = () => uploadAvatar.mutate({
                        fileName: file.name,
                        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
                        dataUrl: String(reader.result)
                      });
                      reader.readAsDataURL(file);
                    }}
                    className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs max-w-full"
                  />
                </div>
              </div>
              <Field label="Nome" value={current.displayName} onChange={value => setForm({ ...current, displayName: value })} />
              <ProfessionSelectField
                professionName={current.professionName}
                professionCategory={current.professionCategory}
                onChange={(name, category) => setForm({ ...current, professionName: name, professionCategory: category })}
              />
              <PublicAddressField value={current.slug} onChange={value => setForm({ ...current, slug: value })} />
              <StateCitySelect
                value={current.city}
                onChange={value => setForm({ ...current, city: value, serviceRegion: value ? `${value} e região` : current.serviceRegion })}
              />
              <Field label="WhatsApp" value={current.whatsapp} onChange={value => setForm({ ...current, whatsapp: value })} />
              <div className="w-full min-w-0">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[#38584f]">Descrição sobre seu trabalho</Label>
                  <span className={`text-[11px] font-medium ${(current.bio?.length || 0) > 450 ? "text-amber-600 font-bold" : "text-[#71867f]"}`}>
                    {current.bio?.length || 0} / 500 caracteres
                  </span>
                </div>
                <Textarea
                  maxLength={500}
                  value={current.bio}
                  onChange={e => setForm({ ...current, bio: e.target.value })}
                  placeholder="Conte sobre sua experiência, especialidades e diferenciais..."
                  className="min-h-24 rounded-2xl border-[#dce5dc] bg-[#fbfcf9] text-sm w-full"
                />
              </div>
              <Button onClick={save} disabled={update.isPending} className="mt-2 w-fit rounded-xl bg-[#173a34] text-white">
                Salvar perfil
              </Button>
            </CardContent>
          </Card>

          {/* CHAVE PIX E DISPONIBILIDADE */}
          <div className="space-y-6 lg:col-span-5 w-full min-w-0">
            <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] w-full min-w-0">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e3f3e8] text-[#2c7a45] shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg text-[#173a34] truncate">Chave PIX para Recebimentos</CardTitle>
                    <p className="text-xs text-[#82948e] line-clamp-1">Aparece na proposta aprovada e no recibo para seu cliente</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 w-full min-w-0">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 w-full min-w-0">
                  <div className="sm:col-span-1 min-w-0">
                    <Label className="mb-2 block text-xs font-semibold text-[#38584f]">Tipo de Chave</Label>
                    <Select
                      value={current.pixKeyType || "cpf"}
                      onValueChange={v => setForm({ ...current, pixKeyType: v })}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-[#dce5dc] bg-white text-xs sm:text-sm w-full">
                        <SelectValue placeholder="Tipo de Chave" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <Field
                      label="Chave PIX"
                      placeholder={
                        current.pixKeyType === "telefone"
                          ? "(11) 99999-9999"
                          : current.pixKeyType === "email"
                          ? "seu@email.com"
                          : current.pixKeyType === "cnpj"
                          ? "00.000.000/0001-00"
                          : current.pixKeyType === "aleatoria"
                          ? "Chave aleatória gerada pelo banco"
                          : "000.000.000-00"
                      }
                      value={current.pixKey || ""}
                      onChange={value => setForm({ ...current, pixKey: value })}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-[#f5f8f2] p-3 text-xs leading-5 text-[#627a6f]">
                  💡 <strong>Facilidade para receber:</strong> Quando o cliente aprova o orçamento, um botão destacado <em>"Copiar Chave PIX"</em> é exibido automaticamente, agilizando o seu recebimento.
                </div>
                <Button onClick={save} disabled={update.isPending} className="rounded-xl bg-[#173a34] text-white">
                  Salvar Chave PIX
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] w-full min-w-0">
              <CardHeader>
                <CardTitle className="text-lg text-[#173a34]">Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 w-full min-w-0">
                <p className="text-sm leading-6 text-[#71867f]">
                  Esses horários são usados para validar novos agendamentos e evitar conflitos.
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full min-w-0">
                  <div className="min-w-0">
                    <Label className="mb-2 block text-xs font-semibold text-[#38584f]">Começo</Label>
                    <Input
                      id="availability-start"
                      type="time"
                      value={availabilityTimes?.start ?? "08:00"}
                      onChange={e => setAvailabilityTimes(prev => ({ start: e.target.value, end: prev?.end ?? "18:00" }))}
                      className="h-10 rounded-xl border-[#dce5dc] bg-white text-xs sm:text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label className="mb-2 block text-xs font-semibold text-[#38584f]">Fim</Label>
                    <Input
                      id="availability-end"
                      type="time"
                      value={availabilityTimes?.end ?? "18:00"}
                      onChange={e => setAvailabilityTimes(prev => ({ start: prev?.start ?? "08:00", end: e.target.value }))}
                      className="h-10 rounded-xl border-[#dce5dc] bg-white text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <Button
                  disabled={saveAvailability.isPending}
                  onClick={() => {
                    const start = availabilityTimes?.start || "08:00";
                    const end = availabilityTimes?.end || "18:00";
                    if (start >= end) {
                      return toast.error("O horário de início deve ser anterior ao horário de fim.");
                    }
                    saveAvailability.mutate({
                      schedule: JSON.stringify({ days: ["mon","tue","wed","thu","fri"], start, end }),
                      unavailableDays: JSON.stringify([])
                    });
                  }}
                  className="rounded-xl bg-[#173a34] text-white"
                >
                  {saveAvailability.isPending ? "Salvando..." : "Salvar horários"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AMBIENTE DE TESTES */}
        <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] w-full min-w-0">
          <CardHeader>
            <CardTitle className="text-lg text-[#173a34]">Ambiente de Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[#71867f]">
              O sistema salva seus dados em tempo real. Se desejar limpar todos os registros (clientes, orçamentos, atendimentos e despesas) para iniciar testes do zero, você pode usar a ação rápida abaixo ou acessar o painel <Link href="/admin" className="font-semibold text-[#173a34] underline">Administrativo (/admin)</Link>.
            </p>
            <Button
              variant="outline"
              onClick={() => setResetConfirmOpen(true)}
              disabled={resetDb.isPending}
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Zerar dados para novos testes
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Zerar dados de teste?"
        description="Esta ação apagará todos os clientes, orçamentos, atendimentos e despesas de teste, restaurando o estado inicial do sistema para que você possa recomeçar suas validações."
        confirmLabel="Sim, zerar dados"
        variant="danger"
        onConfirm={() => {
          setResetConfirmOpen(false);
          resetDb.mutate();
        }}
      />
    </Page>
  );
}

export function TutorialPage() {
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"passos" | "estudio" | "dicas">("passos");

  const profileQuery = trpc.profile.get.useQuery();
  const isTeamMode = profileQuery.data?.accountType === "equipe";

  const openTour = (tab: "passos" | "estudio" | "dicas" = "passos") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const soloSteps = [
    {
      num: 1,
      icon: UserRound,
      color: "bg-[#eef5d2] text-[#819815]",
      title: "Seu Cartão Digital & Link Profissional",
      badge: "Comece Aqui",
      desc: "Você ganha uma página pública exclusiva (ex: /p/seu-nome). É o seu cartão de visitas na web. Seus clientes NÃO precisam instalar app nem criar conta para ver seus serviços.",
      path: "/cartao",
      buttonText: "Acessar Meu Cartão",
      tip: "Coloque o link na bio do seu Instagram e no status do WhatsApp!",
    },
    {
      num: 2,
      icon: BriefcaseBusiness,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Catálogo de Serviços com Preços Prontos",
      badge: "Catálogo Rápido",
      desc: "Cadastre seus serviços com duração, valor e modalidade. Use nossas sugestões prontas para sua profissão ou adicione qualquer especialidade autônoma.",
      path: "/servicos",
      buttonText: "Configurar Serviços",
      tip: "Os serviços cadastrados preenchem automaticamente a agenda e os orçamentos.",
    },
    {
      num: 3,
      icon: FileText,
      color: "bg-[#fff1d9] text-[#a27320]",
      title: "Orçamentos Formais no WhatsApp",
      badge: "Feche Mais Vendas",
      desc: "Crie propostas claras e elegantes em menos de 1 minuto. O cliente recebe um link no WhatsApp, confere os detalhes e aprova em 1 clique. Acaba a insegurança sobre valores combinados.",
      path: "/orcamentos",
      buttonText: "Criar Orçamento",
      tip: "Orçamentos aprovados viram atendimentos na agenda com apenas um toque.",
    },
    {
      num: 4,
      icon: CalendarDays,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Agenda Inteligente Pessoal",
      badge: "Organização Total",
      desc: "Controle seus compromissos nos modos Dia, Semana ou Mês. Sem conflitos, com rotas rápidas e alertas caso esqueça de atualizar o status.",
      path: "/agenda",
      buttonText: "Minha Agenda",
      tip: "Clique em 'Abrir rota' para traçar o caminho até o endereço do cliente no Google Maps.",
    },
    {
      num: 5,
      icon: CircleDollarSign,
      color: "bg-[#e3f3e8] text-[#3e885c]",
      title: "Financeiro & Recibos em PDF",
      badge: "Zero Taxas",
      desc: "Receba 100% dos seus ganhos diretamente via PIX, cartão ou dinheiro — sem intermediários. Registre pagamentos, acompanhe valores a receber e emita Recibos em PDF com assinatura formal.",
      path: "/financeiro",
      buttonText: "Abrir Financeiro",
      tip: "Recibos em PDF podem ser compartilhados direto no WhatsApp ou impressos.",
    },
    {
      num: 6,
      icon: SunMedium,
      color: "bg-[#fdf3d8] text-[#966b15]",
      title: "Meu Dia & Rotina Sem Estresse",
      badge: "Assistente Diário",
      desc: "Abra pela manhã e veja em uma única tela quem são seus clientes do dia, horários marcados, total previsto para faturar e ações pendentes. Produtividade máxima sem perder tempo.",
      path: "/meu-dia",
      buttonText: "Ver Meu Dia",
      tip: "A rotina ideal: confira o 'Meu Dia' antes de começar os atendimentos.",
    },
  ];

  const teamSteps = [
    {
      num: 1,
      icon: Building2,
      color: "bg-[#f3e8ff] text-purple-700",
      title: "Configuração do Estúdio & Negócio",
      badge: "Identidade",
      desc: "Configure o nome do seu salão, estúdio ou oficina, logotipo, cidade de atendimento e sua chave PIX principal nas Configurações.",
      path: "/configuracoes",
      buttonText: "Configurações",
      tip: "Seus clientes verão a marca do seu espaço nos orçamentos e agendamentos.",
    },
    {
      num: 2,
      icon: UserCheck,
      color: "bg-[#eef5d2] text-[#819815]",
      title: "Módulo Equipe & Parceiros (Salão-Parceiro)",
      badge: "Lei 13.352",
      desc: "Cadastre parceiros autônomos com comissões individuais (ex: 50%, 60%) e gerencie tudo sem conflitos com segurança jurídica pela Lei do Salão-Parceiro.",
      path: "/equipe",
      buttonText: "Módulo Equipe",
      tip: "Gera extratos individuais prontos para enviar no WhatsApp do parceiro com a chave PIX!",
    },
    {
      num: 3,
      icon: BriefcaseBusiness,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Catálogo de Serviços da Equipe",
      badge: "Catálogo Rápido",
      desc: "Cadastre seus procedimentos e serviços com duração, valor e modalidade para toda a sua equipe atender.",
      path: "/servicos",
      buttonText: "Configurar Serviços",
      tip: "Os serviços cadastrados preenchem automaticamente a agenda e os orçamentos.",
    },
    {
      num: 4,
      icon: CalendarDays,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Agenda Simultânea por Profissional",
      badge: "Sem Conflitos",
      desc: "Múltiplos parceiros podem atender clientes no mesmo horário sem bloquear o sistema. Alterne a visão entre toda a equipe ou um parceiro específico.",
      path: "/agenda",
      buttonText: "Minha Agenda",
      tip: "Filtre a agenda por profissional para ver os horários de cada um.",
    },
    {
      num: 5,
      icon: FileText,
      color: "bg-[#fff1d9] text-[#a27320]",
      title: "Orçamentos Formais da Equipe",
      badge: "Feche Mais Vendas",
      desc: "Crie propostas claras em menos de 1 minuto. O cliente recebe o link no WhatsApp, confere os detalhes e aprova em 1 clique.",
      path: "/orcamentos",
      buttonText: "Criar Orçamento",
      tip: "Orçamentos aprovados viram atendimentos na agenda com apenas um toque.",
    },
    {
      num: 6,
      icon: CircleDollarSign,
      color: "bg-[#e3f3e8] text-[#3e885c]",
      title: "Financeiro, Comissões e Repasses PIX",
      badge: "Zero Calculadora",
      desc: "Ao registrar pagamentos, o sistema calcula na hora: quanto é repasse da parceira e quanto é o lucro líquido do estúdio.",
      path: "/financeiro",
      buttonText: "Abrir Financeiro",
      tip: "Envie extrato de repasse formatado no WhatsApp com a chave PIX em 1 toque.",
    },
    {
      num: 7,
      icon: SunMedium,
      color: "bg-[#fdf3d8] text-[#966b15]",
      title: "Meu Dia do Gestor",
      badge: "Visão Geral",
      desc: "Abra pela manhã e veja a lista de todos os atendimentos do estúdio para hoje, faturamento previsto e pendências.",
      path: "/meu-dia",
      buttonText: "Ver Meu Dia",
      tip: "Acompanhe o movimento geral do seu time antes de iniciar o expediente.",
    },
  ];

  const steps = isTeamMode ? teamSteps : soloSteps;

  return (
    <Page
      eyebrow={isTeamMode ? "Aprenda a Usar • Modo Equipe & Estúdio" : "Aprenda a Usar • Modo Individual"}
      title={isTeamMode ? "Guia do Salão, Oficina & Estúdio Parceiro" : "Guia Prático do Autônomo Solo"}
      description={
        isTeamMode
          ? "Como gerenciar múltiplos colaboradores, agenda simultânea e cálculo automático de comissões pela Lei do Salão-Parceiro."
          : "Tudo o que você precisa saber para gerenciar seus serviços, fechar orçamentos no WhatsApp e receber 100% no PIX sem taxas."
      }
      action={
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => openTour("passos")}
            className="w-full sm:w-auto min-h-[44px] h-auto py-2.5 px-3 sm:px-4 rounded-xl bg-[#173a34] font-bold text-white shadow-sm hover:bg-[#28564d] text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap text-center cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#d9f56a] shrink-0" /> Iniciar Tour Interativo
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/app")}
            className="w-full sm:w-auto min-h-[44px] h-auto py-2.5 px-3 sm:px-4 rounded-xl border-[#ccdccc] bg-white text-[#34564d] text-xs sm:text-sm cursor-pointer"
          >
            Ir para o Painel
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Banner de Boas-Vindas e Atalho */}
        <div className="rounded-[26px] border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-6 shadow-[0_8px_30px_rgba(23,58,52,0.06)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#173a34] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d9f56a]">
                  {isTeamMode ? "👥 Modo Equipe Ativo" : "👤 Modo Individual Ativo"}
                </span>
                <span className="text-xs font-semibold text-[#667700]">
                  {isTeamMode ? "Guia de Gestão de Equipe & Parceiros" : "Guia Exclusivo para Autônomo Solo"}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#173a34] md:text-3xl">
                {isTeamMode
                  ? "7 Passos para Gerenciar sua Equipe & Negócio"
                  : "6 Passos para Dominar seu Trabalho Sozinho"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#486255] md:text-base">
                {isTeamMode
                  ? "Aprenda a cadastrar suas parceiras, enviar links individuais de acesso no celular delas e calcular os repasses de comissão sem expor seu faturamento geral."
                  : "Interface 100% enxuta, sem ruído de equipe. Foque nos seus clientes, monte propostas pelo WhatsApp e acompanhe seu lucro líquido diário."}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-96">
              <button
                type="button"
                onClick={() => openTour("passos")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Sparkles className="h-6 w-6 text-[#8aa500]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">
                  {isTeamMode ? "7 Passos Equipe" : "6 Passos Solo"}
                </span>
                <span className="text-[11px] text-[#71867f]">Para começar</span>
              </button>
              <button
                type="button"
                onClick={() => openTour("estudio")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Building2 className="h-6 w-6 text-[#28564d]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">
                  {isTeamMode ? "Estúdio & Equipe" : "Mudar p/ Equipe"}
                </span>
                <span className="text-[11px] text-[#71867f]">
                  {isTeamMode ? "Salão-Parceiro" : "Quando migrar?"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => openTour("dicas")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Lightbulb className="h-6 w-6 text-[#a27320]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">Dicas de Ouro</span>
                <span className="text-[11px] text-[#71867f]">0% de taxas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Abas com Conteúdo Detalhado */}
        <Tabs defaultValue="passos" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-4 rounded-2xl bg-[#e8eee5] p-1.5 h-auto gap-1">
            <TabsTrigger
              value="passos"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              {isTeamMode ? "👑 7 Passos para Começar" : "🚀 6 Passos para Começar"}
            </TabsTrigger>
            <TabsTrigger
              value="estudio"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              {isTeamMode ? "🏢 Estúdio & Equipe" : "🌱 Mudar para Equipe?"}
            </TabsTrigger>
            <TabsTrigger
              value="dicas"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              💡 Dicas & Perguntas
            </TabsTrigger>
            <TabsTrigger
              value="simulador"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              ✨ Simulador Visual
            </TabsTrigger>
          </TabsList>

          {/* ABA 0: SIMULADOR VISUAL COMPLETO */}
          <TabsContent value="simulador" className="space-y-4">
            <SimulatorTour />
          </TabsContent>

          {/* ABA 1: OS PASSOS */}
          <TabsContent value="passos" className="space-y-4">
            <div className="grid gap-4">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <Card key={step.num} className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-bold", step.color)}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-[#edf2ec] px-2 py-0.5 text-xs font-bold text-[#4e685f]">
                                Passo {step.num}
                              </span>
                              <Badge className="border-0 bg-[#eef5d2] text-xs font-semibold text-[#667700]">
                                {step.badge}
                              </Badge>
                            </div>
                            <h3 className="mt-1.5 text-lg font-bold text-[#173a34]">
                              {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-[#5d756d] leading-relaxed max-w-2xl">
                              {step.desc}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#718600] bg-[#fbfdec] px-3 py-1.5 rounded-lg border border-[#e4edcd] w-fit">
                              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                              <span>{step.tip}</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 sm:self-center">
                          <Button
                            onClick={() => setLocation(step.path)}
                            className="w-full sm:w-auto rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-bold h-10 px-4 cursor-pointer"
                          >
                            {step.buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ABA 2: ESTÚDIO & EQUIPE OU GUIA DE TRANSIÇÃO */}
          {!isTeamMode ? (
            <TabsContent value="estudio" className="space-y-6">
              <Card className="rounded-[24px] border-0 bg-[#173a34] text-white shadow-[0_12px_40px_rgba(19,42,39,0.12)]">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-[#d9f56a]">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Crescimento Sem Complicação
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">
                    Quando migrar para o Modo Equipe & Estúdio?
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/70 max-w-3xl">
                    Você começou sozinho(a) no modo <strong>Individual</strong>. Mas se a sua agenda lotar e você trouxer um ajudante, manicure parceira ou assistente, o MeuAutônomo cresce com você sem você perder nenhum cliente, serviço ou histórico.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/configuracoes")}
                      className="rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e] font-bold text-xs h-10 px-5 cursor-pointer"
                    >
                      Ver Configurações de Modo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openTour("estudio")}
                      className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 text-xs font-medium h-10 cursor-pointer"
                    >
                      Ver Como Funciona a Equipe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815] font-bold">1</div>
                      <CardTitle className="text-base text-[#173a34]">Ativação Instantânea</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Em <strong>Configurações</strong>, basta clicar em <em>'Ativar Modo Equipe & Estúdio'</em>. A aba <strong>Equipe / Parceiros</strong> aparece imediatamente no seu menu.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e] font-bold">2</div>
                      <CardTitle className="text-base text-[#173a34]">Divisão Automática de Comissões</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Defina a porcentagem de comissão combinada (ex: 50% ou 60%). Ao registrar os atendimentos, o sistema calcula o rateio na hora, sem contas manuais.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c] font-bold">3</div>
                      <CardTitle className="text-base text-[#173a34]">Agenda Simultânea Livre</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Você e seus parceiros podem atender no mesmo horário sem conflito. A agenda ganha filtro rápido por profissional para visualização individual.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d9] text-[#a27320] font-bold">4</div>
                      <CardTitle className="text-base text-[#173a34]">Extrato PIX no WhatsApp</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    No fechamento da semana ou mês, envie o extrato direto no WhatsApp do parceiro com todos os atendimentos discriminados e a chave PIX dele pronta.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ) : (
            <TabsContent value="estudio" className="space-y-6">
              <Card className="rounded-[24px] border-0 bg-[#173a34] text-white shadow-[0_12px_40px_rgba(19,42,39,0.12)]">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-[#d9f56a]">
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Gestão Completa de Salão & Estúdio
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">
                    Como funciona o Módulo de Equipe (Lei do Salão-Parceiro)?
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/70 max-w-3xl">
                    Se você possui um estúdio de estética, salão de beleza, barbearia ou espaço compartilhado onde outras manicures, lash designers ou profissionais autônomas atendem, o MeuAutônomo resolve 100% da sua gestão contábil e de repasses.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/equipe")}
                      className="rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e] font-bold text-xs h-10 px-5 cursor-pointer"
                    >
                      Acessar Módulo Equipe <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openTour("estudio")}
                      className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 text-xs font-medium h-10 cursor-pointer"
                    >
                      Ver Tour do Módulo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815] font-bold">1</div>
                      <CardTitle className="text-base text-[#173a34]">Cadastro com Comissão Flexível</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Cadastre cada profissional parceiro(a) com nome, cargo (ex: Manicure, Lash Designer), chave PIX e porcentagem de comissão (ex: 50% ou 60%). Cada profissional tem sua comissão calculada de forma individual e automática.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e] font-bold">2</div>
                      <CardTitle className="text-base text-[#173a34]">Agenda Simultânea sem Conflitos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Ao criar um agendamento, selecione qual parceiro atenderá. O sistema permite atendimentos no mesmo horário para profissionais diferentes, perfeito para estúdios com várias mesas ou macas.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c] font-bold">3</div>
                      <CardTitle className="text-base text-[#173a34]">Divisão Automática de Receita</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Você não precisa fazer contas de calculadora no fim do mês! A aba 'Extrato & Repasses' mostra exatamente o faturamento bruto gerado por cada parceiro, o valor da comissão a pagar e o quanto ficou de retenção para o estúdio.
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d9] text-[#a27320] font-bold">4</div>
                      <CardTitle className="text-base text-[#173a34]">Extrato no WhatsApp em 1 Clique</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                    Basta tocar no botão verde 'Enviar Extrato WhatsApp'. O sistema monta uma mensagem completa com os atendimentos realizados, a soma devida e a chave PIX do parceiro para você realizar a transferência com total transparência.
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* ABA 3: DICAS & PERGUNTAS */}
          <TabsContent value="dicas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c]">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">100% Direto na Sua Conta (Zero Taxas)</CardTitle>
                      <p className="text-xs text-[#82948e]">Como funciona o pagamento dos clientes?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  O MeuAutônomo <strong>NÃO é um intermediador financeiro</strong>. Não cobramos nenhuma porcentagem sobre os seus atendimentos. O cliente paga diretamente para você via PIX, dinheiro ou na sua maquininha de cartão. Você apenas registra o pagamento no sistema para alimentar seu controle.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">Instalar no Celular como Aplicativo</CardTitle>
                      <p className="text-xs text-[#82948e]">Sem precisar de Play Store ou App Store</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  O sistema é um PWA moderno. No iPhone, abra no Safari, toque no ícone de Compartilhar e selecione <strong>'Adicionar à Tela de Início'</strong>. No Android, toque no menu de 3 pontinhos do Chrome e escolha <strong>'Instalar aplicativo'</strong>. Ele funcionará com ícone na sua tela inicial em tela cheia!
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e]">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">Recibos Formais em PDF</CardTitle>
                      <p className="text-xs text-[#82948e]">Profissionalismo para seus clientes</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Na aba <strong>Financeiro</strong> ou ao concluir um atendimento, você pode clicar no botão <strong>Recibo</strong>. O sistema gera um comprovante oficial em PDF formatado com seus dados, CPF/CNPJ, valor por extenso e assinatura digital para você enviar direto no WhatsApp do cliente.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d9] text-[#a27320]">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">O Cliente Precisa Criar Conta?</CardTitle>
                      <p className="text-xs text-[#82948e]">Zero atrito para quem contrata você</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  <strong>Não!</strong> Seu cliente nunca é obrigado a cadastrar senha ou baixar aplicativos. Ele abre seu link público, vê seus serviços e faz o pedido em 20 segundos. Você recebe a notificação no painel e no WhatsApp e já tem o contato dele salvo na sua carteira de clientes.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <GuidedTutorialModal open={modalOpen} onOpenChange={setModalOpen} defaultTab={modalTab} />
    </Page>
  );
}

export function FormSelect({ label, value, onChange, options, placeholder = "Selecionar" }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  const internalValue = !value || value === "" ? "__empty__" : value;
  const normalizedOptions = options.map(opt => ({
    ...opt,
    radixValue: opt.value === "" ? "__empty__" : opt.value
  }));
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Select value={internalValue} onValueChange={val => onChange(val === "__empty__" ? "" : val)}>
        <SelectTrigger className="h-10 w-full min-w-0 max-w-full rounded-xl border-[#dce5dc] bg-white overflow-hidden text-left [&>span]:truncate [&>span]:block [&>span]:max-w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          {normalizedOptions.length ? (
            normalizedOptions.map(option => (
              <SelectItem key={option.radixValue} value={option.radixValue} className="truncate max-w-full block">
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              Nenhuma opção
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export { PublicProfile } from "./PublicProfile";
export { PublicQuote } from "./PublicQuote";

