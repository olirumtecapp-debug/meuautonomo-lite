import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  Smartphone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  DollarSign,
  Send,
  Eye,
  RotateCcw,
  Check,
  AlertCircle,
  Briefcase,
  QrCode,
  ShieldCheck,
  Bell,
  ChevronRight,
  SunMedium,
  CalendarDays,
  UserRound,
  Wrench,
  Inbox,
  TrendingUp,
  BarChart3,
  Search,
  MapPin,
  Phone,
  Percent,
  Plus,
  Filter,
} from "lucide-react";

export type SimulatorMode = "solo" | "team";
export type SimulatorViewSection = "funnel" | "screens";
export type SimulatorStep = 1 | 2 | 3 | 4 | 5 | 6;
export type AppScreenTab =
  | "meu-dia"
  | "agenda"
  | "clientes"
  | "servicos"
  | "equipe"
  | "solicitacoes"
  | "financeiro"
  | "relatorios";

export function SimulatorTour() {
  const [mode, setMode] = useState<SimulatorMode>("solo");
  const [section, setSection] = useState<SimulatorViewSection>("screens");
  const [step, setStep] = useState<SimulatorStep>(1);
  const [activeScreen, setActiveScreen] = useState<AppScreenTab>("meu-dia");
  const [reportSubTab, setReportSubTab] = useState<"general" | "by-member">("by-member");
  const [teamSubTab, setTeamSubTab] = useState<"owner" | "member-view">("owner");
  const [actionSimulated, setActionSimulated] = useState<"idle" | "approved" | "rejected" | "adjusted">("idle");
  const [rejectReason, setRejectReason] = useState("");
  const [simulatedWeekOffset, setSimulatedWeekOffset] = useState(0);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const resetSimulation = () => {
    setActionSimulated("idle");
    setRejectReason("");
  };

  const nextStep = () => {
    if (step === 5 && (rejectReason || actionSimulated === "adjusted")) {
      setStep(6);
    } else {
      resetSimulation();
      if (step < 6) setStep((step + 1) as SimulatorStep);
    }
  };

  const prevStep = () => {
    resetSimulation();
    if (step > 1) setStep((step - 1) as SimulatorStep);
  };

  // Dados fictícios para o Autônomo Solo (Marcos Silva - Eletricista)
  const soloData = {
    name: "Marcos Silva",
    profession: "Eletricista Residencial e Predial",
    city: "São Paulo, SP",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
    phone: "(11) 98765-4321",
    pixKey: "11987654321",
    clientName: "Dona Maria Fernandes",
    clientPhone: "(11) 99887-1122",
    serviceTitle: "Troca do Quadro de Disjuntores + Instalação de Chuveiro 7500W",
    serviceItems: [
      { desc: "Mão de obra: Substituição de quadro 8 disjuntores DIN", price: 280 },
      { desc: "Mão de obra: Troca e ligação de fiação chuveiro 6mm²", price: 120 },
      { desc: "Material: 4 disjuntores bipolares curva C + fita autofusão", price: 145 },
    ],
    date: "Hoje, às 14:00",
  };

  // Dados fictícios para a Equipe / Estúdio (Studio Bella Beleza)
  const teamData = {
    studioName: "Studio Bella Beleza & Estética",
    category: "Salão de Beleza e Estética Avançada",
    city: "Campinas, SP",
    avatar: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=160&auto=format&fit=crop&q=80",
    pixKey: "contato@studiobellabeleza.com.br",
    members: [
      { name: "Carla Souza", role: "Cabeleireira Master & Colorista", commission: 60, color: "bg-purple-100 text-purple-800" },
      { name: "Beatriz Lima", role: "Manicure, Pedicure & Nail Designer", commission: 50, color: "bg-pink-100 text-pink-800" },
      { name: "Juliana Mendes", role: "Designer de Sobrancelhas & Micropigmentadora", commission: 55, color: "bg-amber-100 text-amber-800" },
    ],
    clientName: "Camila Ribeiro",
    clientPhone: "(19) 98112-3344",
    serviceTitle: "Combo Dia de Rainha: Mechas Iluminadas + Esmaltação em Gel",
    serviceItems: [
      { desc: "Mechas Morena Iluminada + Tratamento Kérastase (Carla)", price: 420 },
      { desc: "Esmaltação em Gel nas mãos e pés (Beatriz)", price: 130 },
      { desc: "Design de Sobrancelhas com Henna (Juliana)", price: 65 },
    ],
    date: "Hoje, às 10:30",
  };

  const isSolo = mode === "solo";
  const currentTotal = isSolo
    ? soloData.serviceItems.reduce((acc, item) => acc + item.price, 0)
    : teamData.serviceItems.reduce((acc, item) => acc + item.price, 0);

  const stepsInfo = [
    { num: 1, title: "1. Cadastro & Perfil", desc: "Como o profissional ou estúdio se apresenta ao mundo." },
    { num: 2, title: "2. Catálogo & Orçamento", desc: "Criando o orçamento em 1 minuto e gerando o link do WhatsApp." },
    { num: 3, title: "3. Tela do Cliente", desc: "O que o cliente vê no celular quando abre a proposta." },
    { num: 4, title: "4. Aceite de Orçamento", desc: "O cliente aprova com 1 toque e recebe os dados do PIX." },
    { num: 5, title: "5. Recusa ou Alteração", desc: "Como funciona a negociação sem atritos nem constrangimento." },
    { num: 6, title: "6. Agenda & Notificações", desc: "A agenda bloqueando a data e o profissional sendo avisado." },
  ];

  const appScreens = [
    { id: "meu-dia", title: "Meu Dia", icon: SunMedium, badge: "Rotina", desc: "Visão do que fazer hoje, horários e rotas." },
    { id: "agenda", title: "Agenda", icon: CalendarDays, badge: "Calendário", desc: "Horários livres, bloqueados e choque de agenda." },
    { id: "clientes", title: "Clientes", icon: UserRound, badge: "Contatos", desc: "Histórico de compras e WhatsApp em 1 clique." },
    { id: "servicos", title: "Serviços", icon: Wrench, badge: "Catálogo", desc: "Tabela de preços, duração e antes/depois." },
    { id: "equipe", title: "Equipe / Parceiros", icon: Users, badge: isSolo ? "Disponível" : "3 Membros", desc: "Divisão de tarefas e comissões." },
    { id: "solicitacoes", title: "Solicitações", icon: Inbox, badge: "3 Novas", desc: "Pedidos de orçamento recebidos na vitrine." },
    { id: "financeiro", title: "Financeiro", icon: DollarSign, badge: "PIX Direto", desc: "Faturamento, a receber e 0% de taxa." },
    { id: "relatorios", title: "Relatórios", icon: BarChart3, badge: "Métricas", desc: "Serviços mais vendidos e lucro líquido." },
  ];

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DO SIMULADOR COM SELETOR DE MODO E VISÃO */}
      <div className="rounded-3xl border border-[#dce5dc] bg-gradient-to-br from-white via-[#fcfdfa] to-[#f4f7f0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173a34] text-[#d9f56a] shadow-xs">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#173a34]">
                Simulador Visual do MeuAutônomo
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#71867f]">
              Veja como o aplicativo funciona na vida real. Navegue pelas telas do menu ou assista ao fluxo completo de contratação.
            </p>
          </div>

          {/* SELETOR DE MODO: SOLO OU EQUIPE */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#dce5dc] bg-white p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setMode("solo");
                resetSimulation();
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                isSolo
                  ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                  : "text-[#71867f] hover:text-[#173a34]"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Modo Autônomo Solo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("team");
                resetSimulation();
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                !isSolo
                  ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                  : "text-[#71867f] hover:text-[#173a34]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Modo Estúdio / Equipe</span>
              <span className="rounded-full bg-[#eef5d2] px-1.5 py-0.5 text-[9px] font-black text-[#556b10]">
                Pro
              </span>
            </button>
          </div>
        </div>

        {/* SELETOR DE SEÇÃO: TELAS DO MENU VS TRILHA DE CONTRATAÇÃO */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#edf2ec]">
          <span className="text-xs font-bold text-[#173a34] mr-2">Escolha o que deseja simular:</span>
          
          <button
            type="button"
            onClick={() => setSection("screens")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              section === "screens"
                ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                : "bg-white border border-[#dce5dc] text-[#556963] hover:text-[#173a34]"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Telas do Menu Principal (8 Telas)</span>
            <span className="rounded-full bg-[#d9f56a] text-[#173a34] px-1.5 py-0.2 text-[9px] font-black">
              Novo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSection("funnel")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              section === "funnel"
                ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                : "bg-white border border-[#dce5dc] text-[#556963] hover:text-[#173a34]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Trilha de Venda & Orçamento (6 Passos)</span>
          </button>
        </div>

        {/* NAVEGAÇÃO DE BOTÕES RÁPIDOS SEGUNDO A SEÇÃO ESCOLHIDA */}
        {section === "screens" ? (
          /* RÉGUA DAS 8 TELAS DO MENU DO APP */
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 pt-2">
            {appScreens.map((scr) => {
              const Icon = scr.icon;
              const isSelected = activeScreen === scr.id;
              return (
                <button
                  key={scr.id}
                  type="button"
                  onClick={() => setActiveScreen(scr.id as AppScreenTab)}
                  className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-[#173a34] bg-white shadow-md ring-2 ring-[#d9f56a]/60"
                      : "border-[#e3ebe2] bg-white/70 hover:bg-white text-[#71867f]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-[#173a34]" : "text-[#8ea099]"}`} />
                    <span className="text-[9px] font-bold text-[#556b10] bg-[#eef5d2] px-1 rounded shrink-0">
                      {scr.badge}
                    </span>
                  </div>
                  <span className={`mt-1 text-xs font-bold leading-tight ${isSelected ? "text-[#173a34]" : "text-[#556963]"}`}>
                    {scr.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* RÉGUA DOS 6 PASSOS DO FUNIL DE ORÇAMENTO */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            {stepsInfo.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setStep(s.num as SimulatorStep);
                  resetSimulation();
                }}
                className={`flex flex-col text-left p-3 rounded-2xl border transition-all ${
                  step === s.num
                    ? "border-[#173a34] bg-white shadow-md ring-2 ring-[#d9f56a]/60"
                    : "border-[#e3ebe2] bg-white/70 hover:bg-white text-[#71867f]"
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider ${step === s.num ? "text-[#173a34]" : "text-[#8ea099]"}`}>
                  Passo {s.num}
                </span>
                <span className={`mt-0.5 text-xs font-bold truncate ${step === s.num ? "text-[#173a34]" : "text-[#556963]"}`}>
                  {s.title.replace(`${s.num}. `, "")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SEÇÃO 1: SIMULAÇÃO DAS 8 TELAS DO MENU DO APP                 */}
      {/* ============================================================== */}
      {section === "screens" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: EXPLICAÇÃO DIDÁTICA DA TELA DO APP */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-[24px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef5d2] text-[#6d840d]">
                  {React.createElement(appScreens.find((s) => s.id === activeScreen)?.icon || Sparkles, {
                    className: "h-4 w-4",
                  })}
                </span>
                <h3 className="font-bold text-base text-[#173a34]">
                  Tela: {appScreens.find((s) => s.id === activeScreen)?.title}
                </h3>
              </div>

              <p className="mt-2 text-xs text-[#71867f] leading-relaxed">
                {appScreens.find((s) => s.id === activeScreen)?.desc}
              </p>

              <div className="mt-4 pt-4 border-t border-[#f0f4ef] space-y-3">
                {activeScreen === "meu-dia" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        ☀️ O que o profissional faz aqui:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        É a tela inicial do dia. Ele abre pela manhã e vê seus compromissos ordenados por horário, com botão direto de abrir no Google Maps e chamar o cliente no WhatsApp.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#fbfdf7] p-3 border border-[#d9f56a]/50">
                      <span className="block text-[11px] font-bold text-[#44580b]">
                        🎯 No Modo {isSolo ? "Solo" : "Equipe"}:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        {isSolo
                          ? "O Marcos vê seus 2 atendimentos de hoje e a previsão de R$ 825,00 a receber."
                          : "A recepção/gestora vê a grade de atendimentos dividida entre Carla, Beatriz e Juliana."}
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "agenda" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        📅 Prevenção de conflito de agenda:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O sistema impede que dois clientes marquem no mesmo horário e protege automaticamente o horário de almoço e dias de folga.
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#e1effa] p-3 border border-[#b8ddf7]">
                      <span className="block text-[11px] font-bold text-[#1b537c]">
                        👥 Visão Multi-Profissional:
                      </span>
                      <p className="mt-1 text-[11px] text-[#2c658e] leading-relaxed">
                        No estúdio, a agenda mostra colunas separadas para cada parceira da equipe.
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "clientes" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        👥 Cadastro automático de clientes:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        Toda vez que alguém pede orçamento ou aprova uma proposta, o cliente entra automaticamente no catálogo com WhatsApp, endereço e histórico de pagamentos.
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "servicos" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        🛠️ Catálogo Inteligente:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O profissional cadastra seus serviços com preço base e tempo estimado. Ao criar um orçamento, ele só precisa marcar as caixinhas e o valor soma sozinho!
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "equipe" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        👑 Quem cadastra e quem dá o acesso?
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        A <strong>dona do negócio</strong> é quem manda: ela adiciona a profissional, define a porcentagem de comissão e gera um convite seguro pelo WhatsApp.
                      </p>
                    </div>

                    {!isSolo && (
                      <div className="rounded-xl bg-[#eef5d2] p-3 border border-[#d9f56a]">
                        <span className="block text-[11px] font-bold text-[#44580b]">
                          📱 Como a parceira acessa no celular?
                        </span>
                        <p className="mt-1 text-[11px] text-[#485c0a] leading-relaxed">
                          A parceira (ex: Carla) clica no link recebido no WhatsApp. Ela abre o <strong>Portal da Parceira</strong> e vê <strong>APENAS a agenda dela e o valor da sua comissão</strong>, sem ter acesso ao faturamento total da dona!
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeScreen === "solicitacoes" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        📥 Pedidos da Vitrine Online:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        Quando um cliente visita a página pública do profissional (colocada no Instagram ou Google), ele pode preencher o que precisa. O pedido cai direto aqui nesta tela!
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "financeiro" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        💰 Controle Sem Intermediação:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        Veja quanto já entrou no PIX, quanto ainda tem para receber de orçamentos aprovados e o lucro líquido real do mês.
                      </p>
                    </div>
                  </>
                )}

                {activeScreen === "relatorios" && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        📊 Decisões com dados reais:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        Descubra quais serviços dão mais lucro, quais clientes mais compram e a taxa de conversão das propostas enviadas pelo WhatsApp.
                      </p>
                    </div>

                    {!isSolo && (
                      <div className="rounded-xl bg-[#eef5d2] p-3 border border-[#d9f56a]">
                        <span className="block text-[11px] font-bold text-[#44580b]">
                          👥 Sim! Relatório por Profissional:
                        </span>
                        <p className="mt-1 text-[11px] text-[#485c0a] leading-relaxed">
                          No Modo Estúdio, você vê a produção de cada parceira (Carla, Beatriz e Juliana), quantos atendimentos cada uma fez e o valor exato da comissão que a casa deve repassar no fim do mês!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* COLUNA DIREITA: TELA SIMULADA DO APP REAL */}
          <div className="lg:col-span-8">
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_12px_40px_rgba(19,42,39,0.06)] overflow-hidden">
              {/* BARRA SUPERIOR SIMULANDO O APP */}
              <div className="flex items-center justify-between border-b border-[#edf2ec] bg-[#f8faf6] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 text-xs font-mono text-[#71867f]">
                    app.meuautonomo.com.br/{activeScreen}
                  </span>
                </div>

                <Badge variant="secondary" className="bg-[#eef5d2] text-[#556b10] text-[10px] font-bold uppercase">
                  {isSolo ? "👤 Painel Autônomo Solo" : "👥 Painel Estúdio / Equipe"}
                </Badge>
              </div>

              {/* CONTEÚDO DA TELA ATIVA */}
              <div className="p-4 sm:p-6 bg-[#fbfcf9] min-h-[480px]">
                {/* 1. MEU DIA */}
                {activeScreen === "meu-dia" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-[#173a34]">
                          {isSolo ? "Bom dia, Marcos Silva! ☀️" : "Bom dia, Studio Bella! ☀️"}
                        </h4>
                        <p className="text-xs text-[#71867f]">
                          {isSolo ? "Você tem 2 atendimentos agendados para hoje." : "A equipe tem 9 atendimentos distribuídos hoje."}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#8ea099] uppercase">Previsão Hoje</span>
                        <p className="text-base font-black text-[#173a34]">
                          {isSolo ? "R$ 825,00" : "R$ 2.450,00"}
                        </p>
                      </div>
                    </div>

                    {/* CARD COMPROMISSO 1 */}
                    <div className="rounded-2xl border-2 border-[#173a34]/20 bg-white p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#eef5d2] text-[#556b10] px-2 py-1 text-xs font-bold">
                            14:00 às 16:00
                          </span>
                          <span className="text-xs font-bold text-[#173a34]">
                            {isSolo ? "Dona Maria Fernandes" : "Camila Ribeiro (com Carla)"}
                          </span>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Confirmado
                        </Badge>
                      </div>

                      <div className="text-xs text-[#526d64] space-y-1">
                        <p className="font-semibold text-[#173a34]">
                          {isSolo ? "Troca do Quadro de Disjuntores + Instalação de Chuveiro" : "Mechas Morena Iluminada + Tratamento"}
                        </p>
                        <p className="flex items-center gap-1 text-[#8ea099]">
                          <MapPin className="h-3.5 w-3.5" /> {isSolo ? "Rua das Flores, 142 - Moema, SP" : "No salão - Cadeira 1"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#f0f4ef] text-xs gap-2.5">
                        <span className="font-mono font-bold text-[#173a34]">
                          Valor: {isSolo ? "R$ 545,00" : "R$ 420,00"} (PIX na conclusão)
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isSolo && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert("Abrindo rota no Google Maps...")}
                              className="h-8 rounded-xl text-xs text-blue-600 border-blue-200 hover:bg-blue-50 px-2.5 cursor-pointer"
                            >
                              <MapPin className="h-3.5 w-3.5 mr-1 text-blue-600" /> Maps
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("Chamando cliente no WhatsApp...")}
                            className="h-8 rounded-xl text-xs text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10 px-2.5 cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => alert("Atendimento concluído e recibo PIX gerado!")}
                            className="h-8 rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold px-3 cursor-pointer"
                          >
                            Concluir & Recibo
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* CARD COMPROMISSO 2 */}
                    <div className="rounded-2xl border border-[#e5ece4] bg-white p-4 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-slate-100 text-slate-800 px-2 py-1 text-xs font-bold">
                            16:30 às 18:00
                          </span>
                          <span className="text-xs font-bold text-[#173a34]">
                            {isSolo ? "Roberto Santos (Condomínio Solar)" : "Renata Souza (com Beatriz - Manicure)"}
                          </span>
                        </div>
                        <Badge className="bg-[#e1effa] text-[#23638e] text-[10px]">
                          Agendado
                        </Badge>
                      </div>
                      <p className="text-xs text-[#526d64]">
                        {isSolo ? "Revisão de fiação de ar-condicionado 12.000 BTUs" : "Esmaltação em Gel + Spa dos Pés"}
                      </p>
                      <div className="flex justify-between items-center text-xs pt-1 text-[#8ea099]">
                        <span>Valor: {isSolo ? "R$ 280,00" : "R$ 130,00"}</span>
                        <span className="text-[11px] text-[#25D366] font-semibold">Lembrete automático enviado</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AGENDA */}
                {activeScreen === "agenda" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-[#173a34]">Grade Semanal de Atendimentos</h4>
                        <span className="text-[11px] font-semibold text-[#6d840d]">
                          {simulatedWeekOffset === 0
                            ? "Semana Atual (Hoje)"
                            : simulatedWeekOffset === 1
                            ? "Próxima Semana (+1 semana)"
                            : `Semana Futura (+${simulatedWeekOffset} semanas)`}
                        </span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <Button
                          size="sm"
                          variant={simulatedWeekOffset === 0 ? "default" : "outline"}
                          onClick={() => setSimulatedWeekOffset(0)}
                          className={`h-8 rounded-xl text-xs cursor-pointer ${simulatedWeekOffset === 0 ? "bg-[#173a34] text-[#d9f56a]" : ""}`}
                        >
                          Hoje
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSimulatedWeekOffset((prev) => Math.max(0, prev - 1))}
                          className="h-8 rounded-xl text-xs cursor-pointer"
                          disabled={simulatedWeekOffset === 0}
                        >
                          &lt;
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSimulatedWeekOffset((prev) => prev + 1)}
                          className="h-8 rounded-xl text-xs cursor-pointer"
                        >
                          &gt;
                        </Button>
                      </div>
                    </div>

                    {/* GRADE DE HORÁRIOS */}
                    <div className="rounded-2xl border border-[#e5ece4] bg-white p-4 divide-y divide-[#f0f4ef] text-xs">
                      {simulatedWeekOffset === 0 ? (
                        <>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">09:00</span>
                            <div className="flex-1 bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 font-semibold">
                              {isSolo ? "Visita Técnica e Orçamento - Sr. Paulo" : "Beatriz: Manicure - Juliana Prado"}
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">12:00 - 13:00</span>
                            <div className="flex-1 bg-amber-50 text-amber-800 p-2 rounded-xl border border-amber-200 font-semibold flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Horário de Almoço Protegido (Bloqueio Automático)
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">14:00</span>
                            <div className="flex-1 bg-[#173a34] text-[#d9f56a] p-2.5 rounded-xl font-bold">
                              {isSolo ? "Dona Maria - Troca de Quadro + Chuveiro (R$ 545,00)" : "Carla: Mechas Morena Iluminada (R$ 420,00)"}
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">17:00</span>
                            <div className="flex-1 bg-slate-50 text-slate-500 p-2 rounded-xl border border-dashed border-slate-200">
                              Horário Livre para Encaixe
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">10:00</span>
                            <div className="flex-1 bg-blue-50 text-blue-900 p-2 rounded-xl border border-blue-200 font-semibold">
                              {isSolo ? "Pré-Agendamento: Instalação de Ar-Condicionado - Marina" : "Carla: Corte + Botox Capilar - Fernanda Alves"}
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">14:00</span>
                            <div className="flex-1 bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 font-semibold">
                              {isSolo ? "Revisão Elétrica Predial - Condomínio Solar" : "Beatriz: Alongamento de Unhas - Patrícia Lima"}
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between">
                            <span className="font-mono font-bold text-[#173a34] w-20">16:30</span>
                            <div className="flex-1 bg-slate-50 text-slate-500 p-2 rounded-xl border border-dashed border-slate-200">
                              3 Horários Livres Disponíveis nesta Semana
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. CLIENTES */}
                {activeScreen === "clientes" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-[#8ea099]" />
                        <input
                          type="text"
                          placeholder="Buscar cliente por nome ou WhatsApp..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#dce5dc] text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <Button size="sm" className="h-10 rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Novo Cliente
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-[#e5ece4] bg-white divide-y divide-[#f0f4ef] overflow-hidden text-xs">
                      {[
                        { name: "Maria Fernandes", phone: "(11) 99887-1122", totalSpent: "R$ 1.120,00", servicesCount: 3, lastDate: "Hoje" },
                        { name: "Roberto Santos", phone: "(11) 98776-5544", totalSpent: "R$ 680,00", servicesCount: 2, lastDate: "Há 2 semanas" },
                        { name: "Camila Ribeiro", phone: "(19) 98112-3344", totalSpent: "R$ 840,00", servicesCount: 4, lastDate: "Ontem" },
                        { name: "Lucas Andrade", phone: "(11) 97654-3210", totalSpent: "R$ 350,00", servicesCount: 1, lastDate: "Mês passado" },
                      ]
                        .filter((cli) => {
                          if (!clientSearchQuery.trim()) return true;
                          const q = clientSearchQuery.toLowerCase();
                          return cli.name.toLowerCase().includes(q) || cli.phone.includes(q);
                        })
                        .map((cli, i) => (
                        <div key={i} className="p-3.5 flex items-center justify-between hover:bg-[#fbfdfa] transition">
                          <div>
                            <span className="font-bold text-[#173a34] text-sm block">{cli.name}</span>
                            <span className="text-[11px] text-[#71867f] flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {cli.phone} • {cli.servicesCount} {cli.servicesCount === 1 ? "atendimento" : "atendimentos"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#173a34] block">{cli.totalSpent}</span>
                            <button
                              type="button"
                              onClick={() => alert(`Iniciando conversa no WhatsApp com ${cli.name}`)}
                              className="text-[11px] font-bold text-[#25D366] hover:underline"
                            >
                              Chamar no WhatsApp →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SERVIÇOS */}
                {activeScreen === "servicos" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#173a34]">Catálogo de Serviços Ativos</h4>
                      <Button size="sm" className="h-9 rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Serviço
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(isSolo
                        ? [
                            { title: "Instalação de Chuveiro 110V/220V", price: 120, time: "45 min", cat: "Instalação" },
                            { title: "Substituição de Quadro de Disjuntores", price: 280, time: "2 horas", cat: "Manutenção" },
                            { title: "Instalação de Ponto 220V para Ar-Condicionado", price: 190, time: "1h30", cat: "Infraestrutura" },
                            { title: "Troca de Tomadas e Interruptores (por ponto)", price: 35, time: "20 min", cat: "Reparo Rápido" },
                          ]
                        : [
                            { title: "Mechas Morena Iluminada + Tratamento", price: 420, time: "3 horas", cat: "Cabelo (Carla)" },
                            { title: "Esmaltação em Gel Mãos e Pés", price: 130, time: "1h20", cat: "Unhas (Beatriz)" },
                            { title: "Design de Sobrancelhas com Henna", price: 65, time: "40 min", cat: "Olhar (Juliana)" },
                            { title: "Corte Feminino + Escova Modelada", price: 110, time: "1 hora", cat: "Cabelo (Carla)" },
                          ]
                      ).map((s, idx) => (
                        <div key={idx} className="rounded-2xl border border-[#e5ece4] bg-white p-4 space-y-2 shadow-xs">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-[#556b10] bg-[#eef5d2] px-2 py-0.5 rounded-full">
                              {s.cat}
                            </span>
                            <span className="font-mono font-black text-sm text-[#173a34]">
                              R$ {s.price},00
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-[#173a34]">{s.title}</h5>
                          <span className="text-[11px] text-[#8ea099] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Duração média: {s.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. EQUIPE / PARCEIROS */}
                {activeScreen === "equipe" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {isSolo ? (
                      <div className="rounded-2xl border border-dashed border-[#dce5dc] bg-white p-6 text-center space-y-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef5d2] text-[#6d840d] mx-auto">
                          <Users className="h-6 w-6" />
                        </div>
                        <h4 className="text-base font-bold text-[#173a34]">Você está no Modo Autônomo Solo</h4>
                        <p className="text-xs text-[#71867f] max-w-md mx-auto leading-relaxed">
                          Neste modo você trabalha sozinho sem complicação. Se no futuro você contratar um ajudante ou abrir uma empresa com sócios, você pode ativar o <strong>Modo Estúdio / Equipe</strong> com 1 clique.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setMode("team")}
                          className="rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold"
                        >
                          Simular como Modo Equipe Agora ➡️
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* SELETOR INTERNO: VISÃO DA DONA VS VISÃO DA PARCEIRA */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2ec] pb-3">
                          <div>
                            <h4 className="text-base font-bold text-[#173a34]">Gestão de Equipe & Acessos</h4>
                            <p className="text-xs text-[#71867f]">
                              Veja como a dona controla as parceiras e como a profissional acessa no próprio celular.
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-[#f0f4ef] p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setTeamSubTab("owner")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                teamSubTab === "owner"
                                  ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                                  : "text-[#556963] hover:text-[#173a34]"
                              }`}
                            >
                              👑 Painel da Dona
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeamSubTab("member-view")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                teamSubTab === "member-view"
                                  ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                                  : "text-[#556963] hover:text-[#173a34]"
                              }`}
                            >
                              📱 Celular da Parceira (Carla)
                            </button>
                          </div>
                        </div>

                        {/* 1. VISÃO DA DONA DO ESTÚDIO */}
                        {teamSubTab === "owner" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#173a34]">
                                Profissionais Cadastradas (3 parceiras):
                              </span>
                              <Button size="sm" className="h-8 rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                                <Plus className="h-3.5 w-3.5 mr-1" /> Cadastrar Nova Parceira
                              </Button>
                            </div>

                            {teamData.members.map((m, idx) => (
                              <div
                                key={idx}
                                className="rounded-2xl border border-[#e5ece4] bg-white p-4 space-y-3 shadow-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-[#173a34]">{m.name}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.color}`}>
                                        {m.role}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-[#71867f] block mt-0.5">
                                      Divisão: <strong>{m.commission}% profissional</strong> / {100 - m.commission}% estúdio
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        alert(
                                          `Link de acesso gerado e copiado!\n\nLink enviado para o WhatsApp de ${m.name}:\n"Olá ${m.name}! Aqui está seu link exclusivo de acesso à sua agenda no Studio Bella: meuautonomo.com.br/equipe/acesso?token=${idx + 1}"`
                                        );
                                      }}
                                      className="h-8 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                                    >
                                      <Send className="h-3.5 w-3.5" /> Enviar Acesso no Zap
                                    </Button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-[#f0f4ef] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5d736b]">
                                  <span>Chave PIX para repasse: <strong>{idx === 0 ? "carla@pix.com" : idx === 1 ? "beatriz@pix.com" : "juliana@pix.com"}</strong></span>
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Acesso Ativo no Celular
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* 2. VISÃO NO CELULAR DA PARCEIRA (CARLA SOUZA) */
                          <div className="max-w-md mx-auto">
                            <div className="rounded-[32px] border-4 border-slate-800 bg-white p-4 shadow-xl space-y-3">
                              <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-2" />

                              <div className="text-center pb-2 border-b border-[#f0f4ef]">
                                <Badge className="bg-purple-100 text-purple-800 border-0 text-[10px] font-bold">
                                  Portal da Profissional Parceira
                                </Badge>
                                <h4 className="text-base font-black text-[#173a34] mt-1">
                                  Olá, Carla Souza! 👋
                                </h4>
                                <p className="text-[11px] text-[#71867f]">
                                  Studio Bella Beleza & Estética
                                </p>
                              </div>

                              {/* RESUMO DOS GANHOS DA CARLA */}
                              <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-3 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-purple-800">
                                    Sua Comissão a Receber (60%)
                                  </span>
                                  <p className="text-lg font-black text-purple-950 font-mono">
                                    R$ 5.544,00
                                  </p>
                                </div>
                                <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-1 rounded-lg font-bold">
                                  28 Atendimentos
                                </span>
                              </div>

                              {/* AGENDA PESSOAL DA CARLA HOJE */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-[#173a34]">
                                  <span>Sua Agenda de Hoje:</span>
                                  <span className="text-purple-700">2 Clientes Marcados Hoje</span>
                                </div>

                                <div className="rounded-xl border border-[#edf3ec] bg-[#fbfdfa] p-2.5 space-y-1 text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#173a34]">10:00 - Camila Ribeiro</span>
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">Confirmada</Badge>
                                  </div>
                                  <p className="text-[11px] text-[#556b64]">Mechas Morena Iluminada + Tratamento</p>
                                  <div className="flex justify-between items-center pt-1 text-[10px]">
                                    <span className="font-mono text-purple-900 font-bold">Sua parte: R$ 252,00</span>
                                    <button
                                      type="button"
                                      onClick={() => alert("Chamando cliente no WhatsApp...")}
                                      className="text-[#25D366] font-bold hover:underline"
                                    >
                                      Chamar no Zap →
                                    </button>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-[#edf3ec] bg-[#fbfdfa] p-2.5 space-y-1 text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#173a34]">14:30 - Renata Souza</span>
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">Confirmada</Badge>
                                  </div>
                                  <p className="text-[11px] text-[#556b64]">Corte Feminino + Escova Modelada</p>
                                  <div className="flex justify-between items-center pt-1 text-[10px]">
                                    <span className="font-mono text-purple-900 font-bold">Sua parte: R$ 66,00</span>
                                    <button
                                      type="button"
                                      onClick={() => alert("Chamando cliente no WhatsApp...")}
                                      className="text-[#25D366] font-bold hover:underline"
                                    >
                                      Chamar no Zap →
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* SELO DE PRIVACIDADE E SEGURANÇA */}
                              <div className="rounded-xl bg-[#f8faf6] p-2.5 border border-[#e8efe6] text-[10px] text-[#71867f] flex items-start gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Privacidade Ativa:</strong> Você tem acesso apenas à sua agenda e seus repasses. Os dados gerais e finanças da empresa são confidenciais da gestora.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. SOLICITAÇÕES */}
                {activeScreen === "solicitacoes" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#173a34]">Solicitações Recebidas pela Vitrine</h4>
                      <Badge className="bg-amber-100 text-amber-900 border-0 text-xs font-bold">
                        3 Pendentes
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {[
                        { client: "Juliana Rocha", phone: "(11) 97123-8899", desc: "Preciso trocar a fiação de 3 cômodos de uma casa antiga.", when: "Hoje às 09:30" },
                        { client: "Condomínio Edifício Itália", phone: "(11) 98844-2211", desc: "Troca de 12 lâmpadas de emergência da escada.", when: "Ontem às 18:40" },
                        { client: "Renato Silveira", phone: "(11) 99655-4433", desc: "Instalar chuveiro novo e verificar disjuntor desarmando.", when: "Ontem às 15:10" },
                      ].map((req, idx) => (
                        <div key={idx} className="rounded-2xl border border-[#e5ece4] bg-white p-4 space-y-2 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-xs text-[#173a34]">{req.client}</span>
                              <span className="text-[10px] text-[#8ea099] block">{req.when} • {req.phone}</span>
                            </div>
                            <Button size="sm" className="h-8 rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                              Gerar Orçamento Rápido →
                            </Button>
                          </div>
                          <p className="text-xs text-[#4c675f] bg-[#f8faf6] p-2.5 rounded-xl border border-[#edf3ec]">
                            "{req.desc}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. FINANCEIRO */}
                {activeScreen === "financeiro" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <h4 className="text-base font-bold text-[#173a34]">Controle Financeiro Direto</h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white border border-[#e5ece4] p-4 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-[#71867f]">Recebido no Mês</span>
                        <p className="text-xl font-black text-emerald-600 mt-1">
                          {isSolo ? "R$ 4.850,00" : "R$ 18.250,00"}
                        </p>
                        <span className="text-[10px] text-[#8ea099]">Via PIX direto</span>
                      </div>

                      <div className="rounded-2xl bg-white border border-[#e5ece4] p-4 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-[#71867f]">A Receber (Agendados)</span>
                        <p className="text-xl font-black text-[#173a34] mt-1">
                          {isSolo ? "R$ 825,00" : "R$ 3.420,00"}
                        </p>
                        <span className="text-[10px] text-[#8ea099]">Orçamentos aprovados</span>
                      </div>

                      <div className="rounded-2xl bg-white border border-[#e5ece4] p-4 shadow-xs col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-[#71867f]">Taxa da Plataforma</span>
                        <p className="text-xl font-black text-[#173a34] mt-1">
                          R$ 0,00
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold">100% fica com você</span>
                      </div>
                    </div>

                    {!isSolo && (
                      <div className="rounded-2xl bg-[#fbfdf7] border border-[#d9f56a]/60 p-4 space-y-2">
                        <span className="text-xs font-bold text-[#44580b] block">Divisão de Faturamento do Estúdio:</span>
                        <div className="flex justify-between text-xs text-[#3c5047] py-1 border-b border-[#e8efe0]">
                          <span>Repasse para profissionais da equipe:</span>
                          <strong className="font-mono">R$ 10.200,50 (55,9%)</strong>
                        </div>
                        <div className="flex justify-between text-xs text-[#173a34] pt-1 font-bold">
                          <span>Lucro Líquido da Casa:</span>
                          <strong className="font-mono text-emerald-700">R$ 8.049,50 (44,1%)</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. RELATÓRIOS */}
                {activeScreen === "relatorios" && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-[#173a34]">
                          {isSolo ? "Relatório de Desempenho (Solo)" : "Relatórios do Estúdio & Equipe"}
                        </h4>
                        <p className="text-xs text-[#71867f]">
                          {isSolo ? "Visão do seu trabalho individual e serviços mais rentáveis." : "Controle de produção da casa e repasses individuais da equipe."}
                        </p>
                      </div>

                      {/* SELETOR: GERAL OU POR PROFISSIONAL (APENAS MODO EQUIPE) */}
                      {!isSolo && (
                        <div className="flex items-center gap-1 bg-[#f0f4ef] p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setReportSubTab("by-member")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              reportSubTab === "by-member"
                                ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                                : "text-[#556963] hover:text-[#173a34]"
                            }`}
                          >
                            <Users className="h-3.5 w-3.5 inline mr-1" />
                            Por Profissional
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportSubTab("general")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              reportSubTab === "general"
                                ? "bg-[#173a34] text-[#d9f56a] shadow-xs"
                                : "text-[#556963] hover:text-[#173a34]"
                            }`}
                          >
                            <BarChart3 className="h-3.5 w-3.5 inline mr-1" />
                            Geral da Casa
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MODO EQUIPE: VISÃO POR PROFISSIONAL */}
                    {!isSolo && reportSubTab === "by-member" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#173a34] flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-[#8aa500]" />
                            Fechamento Individual por Profissional (Mês Atual):
                          </span>
                          <span className="text-[10px] text-[#556b10] bg-[#eef5d2] px-2 py-0.5 rounded-full font-bold">
                            3 Profissionais Ativas
                          </span>
                        </div>

                        {/* CARDS INDIVIDUAIS DE CADA PROFISSIONAL */}
                        {[
                          {
                            name: "Carla Souza",
                            role: "Cabeleireira Master & Colorista",
                            clients: "28 atendimentos",
                            gross: "R$ 9.240,00",
                            commissionPct: 60,
                            payout: "R$ 5.544,00",
                            studioProfit: "R$ 3.696,00",
                            ticket: "R$ 330,00",
                            color: "border-purple-200 bg-purple-50/20",
                            badge: "bg-purple-100 text-purple-800",
                          },
                          {
                            name: "Beatriz Lima",
                            role: "Manicure, Pedicure & Nail Designer",
                            clients: "46 atendimentos",
                            gross: "R$ 5.980,00",
                            commissionPct: 50,
                            payout: "R$ 2.990,00",
                            studioProfit: "R$ 2.990,00",
                            ticket: "R$ 130,00",
                            color: "border-pink-200 bg-pink-50/20",
                            badge: "bg-pink-100 text-pink-800",
                          },
                          {
                            name: "Juliana Mendes",
                            role: "Designer de Sobrancelhas & Micropigmentadora",
                            clients: "42 atendimentos",
                            gross: "R$ 3.030,00",
                            commissionPct: 55,
                            payout: "R$ 1.666,50",
                            studioProfit: "R$ 1.363,50",
                            ticket: "R$ 72,14",
                            color: "border-amber-200 bg-amber-50/20",
                            badge: "bg-amber-100 text-amber-800",
                          },
                        ].map((p, i) => (
                          <div
                            key={i}
                            className={`rounded-2xl border p-4 shadow-xs space-y-3 bg-white ${p.color}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-sm text-[#173a34]">{p.name}</h5>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badge}`}>
                                    {p.role}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#71867f]">
                                  {p.clients} • Ticket Médio: {p.ticket}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-[#8ea099] uppercase font-bold">Produção Bruta</span>
                                <p className="font-mono font-black text-sm text-[#173a34]">{p.gross}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f0f4ef]">
                              <div className="rounded-xl bg-[#f8faf6] p-2.5 border border-[#edf3ec]">
                                <span className="text-[10px] text-[#71867f] uppercase font-bold block">
                                  Repasse à Profissional ({p.commissionPct}%):
                                </span>
                                <span className="font-mono font-bold text-emerald-700 text-sm">
                                  {p.payout}
                                </span>
                              </div>

                              <div className="rounded-xl bg-[#f8faf6] p-2.5 border border-[#edf3ec]">
                                <span className="text-[10px] text-[#71867f] uppercase font-bold block">
                                  Lucro Retido para a Casa ({100 - p.commissionPct}%):
                                </span>
                                <span className="font-mono font-bold text-[#173a34] text-sm">
                                  {p.studioProfit}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* RESUMO TOTAL DE REPASSES */}
                        <div className="rounded-2xl border-2 border-[#173a34]/30 bg-[#173a34] p-4 text-white shadow-xs space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#d9f56a] font-bold uppercase tracking-wider text-[10px]">
                              Fechamento Consolidado do Mês
                            </span>
                            <span className="font-mono font-bold text-sm">116 Atendimentos no Total</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
                            <div>
                              <span className="text-[10px] text-white/70 block">Faturamento Bruto:</span>
                              <strong className="font-mono text-sm text-white">R$ 18.250,00</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/70 block">Total de Repasses:</span>
                              <strong className="font-mono text-sm text-[#d9f56a]">R$ 10.200,50</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/70 block">Lucro da Casa:</span>
                              <strong className="font-mono text-sm text-emerald-400">R$ 8.049,50</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* VISÃO GERAL (PADRÃO PARA SOLO OU QUANDO CLICADO EM GERAL) */
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-white border border-[#e5ece4] p-5 shadow-xs space-y-3">
                          <span className="text-xs font-bold text-[#173a34] block">Serviços Mais Vendidos no Período:</span>
                          
                          {(isSolo
                            ? [
                                { name: "Substituição de Quadro de Disjuntores", count: "14 realizados", val: "R$ 3.920,00", pct: 70 },
                                { name: "Instalação de Chuveiro 7500W", count: "18 realizados", val: "R$ 2.160,00", pct: 55 },
                                { name: "Ponto 220V para Ar-Condicionado", count: "8 realizados", val: "R$ 1.520,00", pct: 40 },
                              ]
                            : [
                                { name: "Mechas Morena Iluminada (Carla)", count: "22 realizadas", val: "R$ 9.240,00", pct: 85 },
                                { name: "Esmaltação em Gel (Beatriz)", count: "38 realizadas", val: "R$ 4.940,00", pct: 60 },
                                { name: "Design com Henna (Juliana)", count: "42 realizados", val: "R$ 2.730,00", pct: 45 },
                              ]
                          ).map((item, idx) => (
                            <div key={idx} className="space-y-1 text-xs">
                              <div className="flex justify-between font-medium">
                                <span className="text-[#173a34]">{item.name}</span>
                                <span className="font-mono font-bold text-[#173a34]">{item.val}</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#f0f4ef] overflow-hidden">
                                <div className="h-full bg-[#173a34] rounded-full" style={{ width: `${item.pct}%` }} />
                              </div>
                              <span className="text-[10px] text-[#8ea099] block">{item.count}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-2xl bg-white border border-[#e5ece4] p-4 text-center">
                            <span className="text-[10px] font-bold text-[#8ea099] uppercase">Taxa de Conversão</span>
                            <p className="text-2xl font-black text-emerald-600 mt-1">82%</p>
                            <span className="text-[10px] text-[#71867f]">Das propostas foram aprovadas</span>
                          </div>
                          <div className="rounded-2xl bg-white border border-[#e5ece4] p-4 text-center">
                            <span className="text-[10px] font-bold text-[#8ea099] uppercase">Ticket Médio</span>
                            <p className="text-2xl font-black text-[#173a34] mt-1">
                              {isSolo ? "R$ 380,00" : "R$ 215,00"}
                            </p>
                            <span className="text-[10px] text-[#71867f]">Por atendimento</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEÇÃO 2: TRILHA DE VENDA (6 PASSOS DO ORÇAMENTO AO ACEITE)     */}
      {/* ============================================================== */}
      {section === "funnel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: EXPLICAÇÃO DIDÁTICA E BENEFÍCIOS */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-[24px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef5d2] text-[#6d840d] font-black text-sm">
                  {step}
                </span>
                <h3 className="font-bold text-base text-[#173a34]">
                  {stepsInfo[step - 1].title}
                </h3>
              </div>

              <p className="mt-2 text-xs text-[#71867f] leading-relaxed">
                {stepsInfo[step - 1].desc}
              </p>

              <div className="mt-4 pt-4 border-t border-[#f0f4ef] space-y-3">
                {step === 1 && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        💡 Como funciona na vida real:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        {isSolo
                          ? "O profissional leva menos de 2 minutos para se cadastrar. Ele coloca seu nome, especialidade, cidade e sua chave PIX direta (sem intermediários)."
                          : "No modo Estúdio, o gestor cadastra o salão e convida suas parceiras/prestadores. Cada profissional tem sua especialidade e agenda individual."}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#fbfdf7] p-3 border border-[#d9f56a]/50">
                      <span className="block text-[11px] font-bold text-[#44580b]">
                        ✨ Diferencial do MeuAutônomo:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        Não cobra 20% de comissão como outros apps. O dinheiro do cliente vai direto para o PIX do profissional.
                      </p>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        💡 Como funciona na vida real:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O profissional não precisa ficar escrevendo texto feio no WhatsApp. Ele seleciona os serviços, ajusta o valor e o sistema gera uma proposta elegante e formal.
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#fbfdf7] p-3 border border-[#d9f56a]/50">
                      <span className="block text-[11px] font-bold text-[#44580b]">
                        ✨ Passa mais confiança:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O cliente vê a data reservada, prazo de validade de 7 dias e itens detalhados. Reduz pedidos de desconto abusivos.
                      </p>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        💡 Como o cliente recebe:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O cliente recebe uma mensagem amigável no WhatsApp com um link único. Ao clicar, ele não precisa baixar aplicativo nenhum — abre direto no celular!
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#e1effa] p-3 border border-[#b8ddf7]">
                      <span className="block text-[11px] font-bold text-[#1b537c]">
                        📱 Teste você mesmo:
                      </span>
                      <p className="mt-1 text-[11px] text-[#2c658e] leading-relaxed">
                        Clique nos botões no simulador de celular ao lado para ver o que acontece quando o cliente aceita ou pede alteração!
                      </p>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="rounded-xl bg-[#f0fbf4] p-3 border border-[#c3eed1]">
                      <span className="block text-[11px] font-bold text-[#126330]">
                        ✅ Aceite com 1 Toque:
                      </span>
                      <p className="mt-1 text-[11px] text-[#20723e] leading-relaxed">
                        O cliente clica em "Aprovar Orçamento". Automaticamente, o sistema confirma o horário na agenda e libera o QR Code PIX com chave Copia e Cola.
                      </p>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="rounded-xl bg-[#fff8ed] p-3 border border-[#fde1bd]">
                      <span className="block text-[11px] font-bold text-[#97520b]">
                        💬 Negociação Sem Constrangimento:
                      </span>
                      <p className="mt-1 text-[11px] text-[#814a13] leading-relaxed">
                        Se o cliente não puder naquele valor ou data, ele clica em "Pedir Ajuste". Ele escolhe o motivo (mudar data, tirar item, parcelar).
                      </p>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#e8efe6]">
                      <span className="block text-[11px] font-bold text-[#173a34]">
                        🔔 O que o profissional vê:
                      </span>
                      <p className="mt-1 text-[11px] text-[#637a73] leading-relaxed">
                        O sininho apita com a notificação. A data fica bloqueada na agenda dele e o valor vai para a Previsão Financeira.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* CONTROLES DE NAVEGAÇÃO DO FUNIL */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#f0f4ef]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="rounded-xl text-xs text-[#556b64]"
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Anterior
                </Button>

                <span className="text-[11px] font-bold text-[#8ba098]">
                  Passo {step} de 6
                </span>

                <Button
                  size="sm"
                  onClick={nextStep}
                  disabled={step === 6}
                  className="rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold hover:bg-[#204a43]"
                >
                  Próximo <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* COLUNA DIREITA: TELA SIMULADA DO PASSO DO FUNIL */}
          <div className="lg:col-span-8">
            <Card className="rounded-[28px] border-0 bg-white shadow-[0_12px_40px_rgba(19,42,39,0.06)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#edf2ec] bg-[#f8faf6] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 text-xs font-mono text-[#71867f]">
                    {step === 3 || step === 4 || step === 5
                      ? "visão-do-cliente.meuautonomo.com.br/orcamento/preview-123"
                      : isSolo
                      ? "app.meuautonomo.com.br/marcos-eletricista"
                      : "app.meuautonomo.com.br/studio-bella"}
                  </span>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    step === 3 || step === 4 || step === 5
                      ? "bg-[#e1effa] text-[#1b537c]"
                      : "bg-[#eef5d2] text-[#556b10]"
                  }`}
                >
                  {step === 3 || step === 4 || step === 5
                    ? "📱 Visão do Cliente no Celular"
                    : isSolo
                    ? "👤 Painel do Autônomo"
                    : "👥 Painel da Equipe"}
                </Badge>
              </div>

              <div className="p-4 sm:p-6 bg-[#fbfcf9] min-h-[480px]">
                {/* PASSO 1 */}
                {step === 1 && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="rounded-2xl bg-white border border-[#e5ece4] p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <img
                          src={isSolo ? soloData.avatar : teamData.avatar}
                          alt="Avatar"
                          className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#d9f56a] shadow-xs"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h4 className="text-lg font-black text-[#173a34]">
                              {isSolo ? soloData.name : teamData.studioName}
                            </h4>
                            <span className="rounded-full bg-[#d9f56a]/40 px-2 py-0.5 text-[10px] font-bold text-[#173a34]">
                              {isSolo ? "Autônomo Verificado" : "Estúdio / Equipe"}
                            </span>
                          </div>
                          <p className="text-xs text-[#71867f] mt-0.5">
                            {isSolo ? soloData.profession : teamData.category}
                          </p>
                          <p className="text-xs text-[#8ca097] flex items-center justify-center sm:justify-start gap-1 mt-1">
                            📍 {isSolo ? soloData.city : teamData.city} • 📞 {isSolo ? soloData.phone : "(19) 3234-5678"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#f0f4ef] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#edf3ec]">
                          <span className="text-[10px] text-[#71867f] uppercase font-bold">Chave PIX Cadastrada:</span>
                          <p className="font-mono font-bold text-[#173a34] mt-0.5">
                            {isSolo ? soloData.pixKey : teamData.pixKey}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                            <ShieldCheck className="h-3 w-3" /> Recebimento direto sem intermediários
                          </span>
                        </div>

                        <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#edf3ec]">
                          <span className="text-[10px] text-[#71867f] uppercase font-bold">Link da Vitrine Pública:</span>
                          <p className="font-mono text-[11px] text-[#2c658e] mt-0.5 truncate">
                            meuautonomo.com.br/p/{isSolo ? "marcos-silva" : "studio-bella"}
                          </p>
                          <span className="text-[10px] text-[#8ca097] mt-1 block">
                            Pronto para colocar na bio do Instagram
                          </span>
                        </div>
                      </div>

                      {!isSolo && (
                        <div className="mt-4 pt-4 border-t border-[#f0f4ef]">
                          <span className="text-xs font-bold text-[#173a34] flex items-center gap-1.5 mb-2">
                            <Users className="h-4 w-4 text-[#8aa500]" /> Membros da Equipe (3 profissionais):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {teamData.members.map((m, i) => (
                              <div key={i} className="rounded-xl border border-[#edf3ec] bg-[#fbfdfa] p-2.5 text-xs">
                                <span className="font-bold text-[#173a34] block">{m.name}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-1 inline-block ${m.color}`}>
                                  {m.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PASSO 2 */}
                {step === 2 && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="rounded-2xl bg-white border border-[#e5ece4] p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#71867f]">Novo Orçamento Criado</span>
                          <h4 className="text-base font-bold text-[#173a34]">
                            {isSolo ? soloData.serviceTitle : teamData.serviceTitle}
                          </h4>
                          <p className="text-xs text-[#71867f]">
                            Cliente: <strong>{isSolo ? soloData.clientName : teamData.clientName}</strong>
                          </p>
                        </div>
                        <Badge className="bg-[#eef5d2] text-[#556b10] border-0 text-xs font-bold">
                          Válido por 7 dias
                        </Badge>
                      </div>

                      <div className="rounded-xl border border-[#edf3ec] divide-y divide-[#edf3ec] bg-[#fbfcf9]">
                        {(isSolo ? soloData.serviceItems : teamData.serviceItems).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 text-xs">
                            <span className="text-[#334b44] font-medium">{item.desc}</span>
                            <span className="font-bold font-mono text-[#173a34]">
                              R$ {item.price.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-3.5 bg-[#f5f8f3] font-bold text-sm">
                          <span className="text-[#173a34]">Total da Proposta:</span>
                          <span className="text-lg text-[#173a34] font-mono">
                            R$ {currentTotal.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1fb355] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" /> Enviar Proposta pelo WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {/* PASSO 3 */}
                {step === 3 && (
                  <div className="max-w-md mx-auto">
                    <div className="rounded-[32px] border-4 border-slate-800 bg-white p-4 shadow-xl">
                      <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-3" />
                      <div className="text-center pb-3 border-b border-[#f0f4ef]">
                        <span className="text-[10px] font-bold text-[#8ea099] uppercase">Proposta Digital</span>
                        <h4 className="text-base font-black text-[#173a34] mt-0.5">
                          {isSolo ? soloData.name : teamData.studioName}
                        </h4>
                        <p className="text-[11px] text-[#71867f]">
                          Olá, {isSolo ? soloData.clientName : teamData.clientName}!
                        </p>
                      </div>

                      <div className="my-3 space-y-2 text-xs">
                        <div className="rounded-xl bg-[#f8faf6] p-3 border border-[#edf3ec]">
                          <p className="font-semibold text-[#173a34]">
                            {isSolo ? soloData.serviceTitle : teamData.serviceTitle}
                          </p>
                          <p className="text-[11px] text-[#8ea099] mt-1">
                            📅 Data prevista: <strong>{isSolo ? soloData.date : teamData.date}</strong>
                          </p>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-[#173a34] p-2 bg-[#f5f8f3] rounded-xl">
                          <span>Total:</span>
                          <span className="font-mono">R$ {currentTotal},00</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActionSimulated("approved");
                            setStep(4);
                          }}
                          className="w-full py-3 rounded-2xl bg-[#173a34] text-[#d9f56a] font-black text-xs hover:bg-[#204a43] transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Aprovar Orçamento com 1 Toque
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActionSimulated("adjusted");
                            setStep(5);
                          }}
                          className="w-full py-2.5 rounded-2xl border border-[#dce5dc] text-[#556b64] font-bold text-xs hover:bg-[#f8faf6] transition flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Pedir Alteração ou Negociar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASSO 4 */}
                {step === 4 && (
                  <div className="max-w-md mx-auto">
                    <div className="rounded-[32px] border-4 border-slate-800 bg-white p-5 shadow-xl text-center space-y-4">
                      <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-2" />
                      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8ed] text-emerald-600 mx-auto shadow-xs">
                        <CheckCircle2 className="h-9 w-9" />
                      </div>
                      <h4 className="text-lg font-black text-[#173a34]">Orçamento Aprovado com Sucesso! 🎉</h4>
                      <div className="rounded-2xl border border-[#d9f56a]/60 bg-[#fbfdf5] p-4 text-left space-y-2">
                        <span className="text-[10px] font-bold text-[#556b10] uppercase">Pagamento via PIX Direto</span>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#e8efe4]">
                          <div className="grid h-10 w-10 place-items-center rounded bg-slate-900 text-white font-mono text-[8px]">
                            [QR CODE]
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[10px] text-[#71867f] block">Chave PIX:</span>
                            <span className="font-mono text-xs font-bold text-[#173a34] truncate block">
                              {isSolo ? soloData.pixKey : teamData.pixKey}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setStep(6)} className="rounded-xl bg-[#173a34] text-[#d9f56a] text-xs font-bold w-full">
                        Ver o que acontece no Painel do Profissional ➡️
                      </Button>
                    </div>
                  </div>
                )}

                {/* PASSO 5 */}
                {step === 5 && (
                  <div className="max-w-md mx-auto">
                    <div className="rounded-[32px] border-4 border-slate-800 bg-white p-5 shadow-xl space-y-4">
                      <div className="mx-auto h-4 w-28 rounded-full bg-slate-800 mb-2" />
                      <h4 className="text-base font-black text-[#173a34]">Solicitar Alteração no Orçamento</h4>
                      <div className="space-y-2">
                        {[
                          "Gostaria de agendar para outro dia ou horário",
                          "Gostaria de remover um item para baratear o custo",
                          "Gostaria de parcelar o valor em 2x ou 3x",
                        ].map((reason, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setRejectReason(reason)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition ${
                              rejectReason === reason ? "border-[#173a34] bg-[#f4fadc] font-bold" : "border-[#e3ebe2] bg-[#fbfdfa]"
                            }`}
                          >
                            • {reason}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const chosen = rejectReason || "Gostaria de agendar para outro dia ou horário";
                          setRejectReason(chosen);
                          setActionSimulated("adjusted");
                          alert("Ajuste simulado enviado ao profissional!");
                          setStep(6);
                        }}
                        className="w-full py-3 rounded-2xl bg-[#173a34] text-[#d9f56a] font-bold text-xs cursor-pointer"
                      >
                        Enviar Solicitação de Ajuste
                      </button>
                    </div>
                  </div>
                )}

                {/* PASSO 6 */}
                {step === 6 && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {actionSimulated === "adjusted" || rejectReason ? (
                      <div className="rounded-2xl bg-white border border-amber-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-800">
                            <Bell className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#173a34]">Pedido de Alteração Recebido</h4>
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                                Em Negociação
                              </Badge>
                            </div>
                            <span className="text-[11px] text-[#71867f]">Há instantes no WhatsApp / Vitrine</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-50/40 p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-amber-700" />
                              Data inicial proposta: {isSolo ? soloData.date : teamData.date}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#173a34]">
                              R$ {currentTotal},00
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">
                              Motivo informado pelo cliente:
                            </span>
                            <p className="mt-1 text-xs font-bold text-amber-950 bg-white p-2.5 rounded-xl border border-amber-200">
                              "{rejectReason || "Gostaria de agendar para outro dia ou horário"}"
                            </p>
                          </div>

                          <div className="text-xs text-[#556b64] pt-1">
                            <p><strong>Cliente:</strong> {isSolo ? soloData.clientName : teamData.clientName}</p>
                            <p className="mt-0.5"><strong>Serviço:</strong> {isSolo ? soloData.serviceTitle : teamData.serviceTitle}</p>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => alert(`Iniciando negociação com ${isSolo ? soloData.clientName : teamData.clientName} no WhatsApp para combinar novo horário...`)}
                              className="h-8 rounded-xl bg-[#25D366] text-white hover:bg-[#1faa4a] text-xs font-bold cursor-pointer"
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Combinar Novo Horário no Zap
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActionSimulated("idle");
                                setRejectReason("");
                              }}
                              className="h-8 rounded-xl text-xs border-[#dce5dc] cursor-pointer"
                            >
                              Ver Proposta Aprovada Padrão
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white border border-[#e5ece4] p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                            <Bell className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[#173a34]">Notificação Recebida</h4>
                            <span className="text-[11px] text-[#71867f]">Há instantes</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-50/30 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              {isSolo ? soloData.date : teamData.date}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#173a34]">
                              R$ {currentTotal},00
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-[#173a34]">
                            Cliente: {isSolo ? soloData.clientName : teamData.clientName}
                          </h5>
                          <p className="text-xs text-[#556b64]">
                            Serviço: {isSolo ? soloData.serviceTitle : teamData.serviceTitle}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
