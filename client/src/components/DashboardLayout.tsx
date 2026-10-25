import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Archive,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
  Monitor,
  Moon,
  PanelLeft,
  Settings,
  Sparkles,
  UserRound,
  SunMedium,
  Users,
  UserCheck,
  Download,
  Smartphone,
  BookOpen,
  Gift,
  Ticket,
  Crown,
  Code2,
} from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { InstallAppModal } from "./InstallAppModal";
import { ContactDevModal } from "./ContactDevModal";
import { GuidedTutorialModal } from "./GuidedTutorialModal";
import { VoucherRedeemModal } from "./VoucherRedeemModal";
import { ReferralModal } from "./ReferralModal";

const menuItems = [
  { icon: LayoutDashboard, label: "Início", path: "/app" },
  { icon: SunMedium, label: "Meu Dia", path: "/meu-dia" },
  { icon: CalendarDays, label: "Agenda & Atendimentos", path: "/agenda" },
  { icon: CircleDollarSign, label: "Financeiro & Caixa", path: "/financeiro" },
  { icon: BriefcaseBusiness, label: "Serviços & Preços", path: "/servicos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: UserCheck, label: "Equipe & Parceiros", path: "/equipe" },
  { icon: BarChart3, label: "Resumo & Lucro", path: "/relatorios" },
  { icon: UserRound, label: "Meu Cartão", path: "/cartao" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

const SIDEBAR_WIDTH_KEY = "meu-autonomo-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MAX_WIDTH = 360;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return null;

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [contactDevOpen, setContactDevOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const profileQuery = trpc.profile.get.useQuery();
  const accountType = profileQuery.data?.accountType || "individual";
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => item.path !== "/equipe" || accountType === "equipe");
  }, [accountType]);
  const voucherStatusQuery = trpc.voucher.getStatus.useQuery();
  const voucherStatus = voucherStatusQuery.data;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isGenericAdminUser = Boolean(
    user?.name &&
    (user.name.toLowerCase().includes("admin") ||
     user.name.toLowerCase().includes("administrador") ||
     user.name.toLowerCase().includes("master"))
  );
  const rawDisplayName = profileQuery.data?.displayName?.trim();
  const professionalName = rawDisplayName || (!isGenericAdminUser && user?.name?.trim()) || "Profissional";
  const firstName = professionalName.split(" ")[0];

  const applyReferralMutation = trpc.referral.applyCode.useMutation({
    onSuccess: (res) => {
      toast.success(res.message || "🎁 Indicação ativada! Você ganhou 15 dias de PRO grátis!");
      localStorage.removeItem("meuautonomo_referral_code");
      voucherStatusQuery.refetch();
    },
    onError: () => {
      localStorage.removeItem("meuautonomo_referral_code");
    }
  });

  useEffect(() => {
    const savedRef = localStorage.getItem("meuautonomo_referral_code");
    if (savedRef && voucherStatus && !voucherStatus.isVip) {
      applyReferralMutation.mutate({ code: savedRef });
    }
  }, [voucherStatus?.isVip]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - left;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width);
    };
    const up = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0 bg-[#132a27] text-[#f4f7f1]" disableTransition={isResizing}>
          <SidebarHeader className="h-20 justify-center border-b border-white/10">
            <div className="flex w-full items-center gap-2.5 px-2">
              <button onClick={toggleSidebar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15" aria-label="Recolher menu">
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <Link href="/app" className="flex min-w-0 items-center py-1">
                  <img src="/logo-light.png" alt="MeuAutônomo Lite" className="h-10 w-auto max-w-[155px] object-contain" />
                  <span className="ml-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#d9f56a] text-[#132a27] tracking-wider shrink-0">LITE</span>
                </Link>
              ) : (
                <Link href="/app" className="flex items-center justify-center">
                  <img src="/logo-icon.png" alt="MeuAutônomo" className="h-8 w-8 object-contain" />
                </Link>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 px-2 py-4">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 group-data-[collapsible=icon]:hidden">Seu espaço</p>
            <SidebarMenu className="gap-1">
              {visibleMenuItems.map(item => {
                const active = location === item.path;
                const handleItemClick = () => {
                  if (item.path === "/indique") {
                    setReferralModalOpen(true);
                    return;
                  }
                  setLocation(item.path);
                };
                return <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton isActive={active} onClick={handleItemClick} tooltip={item.label} className={`h-11 rounded-xl font-medium transition ${active ? "bg-[#d9f56a] text-[#132a27] hover:bg-[#d9f56a] hover:text-[#132a27]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/10 p-3">
            <div className="mb-2 px-1 group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setTutorialOpen(true)}
                className="flex w-full items-center justify-between rounded-xl bg-[#d9f56a]/15 px-2.5 py-2 text-xs font-bold text-[#d9f56a] transition hover:bg-[#d9f56a]/25 cursor-pointer"
                title="Como usar o MeuAutônomo"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Como Usar (Guia)</span>
                </span>
                <span className="rounded-md bg-[#d9f56a] px-1.5 py-0.2 text-[9px] font-bold text-[#132a27]">Tutorial</span>
              </button>
            </div>
            <div className="mb-2 px-1 group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="flex w-full items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer"
                title="Instalar no smartphone ou computador"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-[#d9f56a]" />
                  <span>Instalar Aplicativo</span>
                </span>
                <span className="rounded-md bg-[#d9f56a]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#d9f56a]">PC / Celular</span>
              </button>
            </div>
            <div className="mb-2 px-1 group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setContactDevOpen(true)}
                className="flex w-full items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer"
                title="Falar diretamente com o desenvolvedor CreativeAM"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="h-3.5 w-3.5 text-[#d9f56a]" />
                  <span>Falar com o Desenvolvedor</span>
                </span>
                <span className="rounded-md bg-[#25d366]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#4ade80]">WhatsApp</span>
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9f56a] group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-9 w-9 border border-white/20 bg-white/10"><AvatarFallback className="bg-[#d9f56a] text-[#132a27]">{firstName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">{professionalName}</p><p className="mt-0.5 truncate text-xs text-white/50">{user?.email || "Minha conta"}</p></div>
                  <Menu className="h-4 w-4 text-white/50 group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem onClick={() => setTutorialOpen(true)} className="cursor-pointer font-medium text-[#173a34]">
                  <BookOpen className="mr-2 h-4 w-4 text-[#8aa500]" /> Guia Passo a Passo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInstallModalOpen(true)} className="cursor-pointer font-medium text-[#173a34]">
                  <Download className="mr-2 h-4 w-4 text-[#8aa500]" /> Instalar no Celular ou PC
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setContactDevOpen(true)} className="cursor-pointer font-medium text-[#173a34]">
                  <Code2 className="mr-2 h-4 w-4 text-[#8aa500]" /> Falar com o Desenvolvedor
                </DropdownMenuItem>
                <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aparência</p>
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer"><SunMedium className="mr-2 h-4 w-4" /> Claro {theme === "light" && <span className="ml-auto text-xs text-[#8aa500]">Ativo</span>}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer"><Moon className="mr-2 h-4 w-4" /> Escuro {theme === "dark" && <span className="ml-auto text-xs text-[#8aa500]">Ativo</span>}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer"><Monitor className="mr-2 h-4 w-4" /> Automático {theme === "system" && <span className="ml-auto text-xs text-[#8aa500]">Ativo</span>}</DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sair da conta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="pt-2 text-center group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setContactDevOpen(true)}
                className="text-[10px] text-white/40 hover:text-white/70 transition cursor-pointer"
                title="CreativeAM Soluções Digitais"
              >
                Criado por <span className="font-bold text-white/60">CreativeAM</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize transition hover:bg-[#d9f56a]/40 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} />
      </div>
      <SidebarInset className="bg-[#f5f8f2] min-w-0 max-w-full overflow-x-hidden">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#dce5dc] bg-[#f5f7f2]/90 px-3 sm:px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <SidebarTrigger className="h-9 w-9 shrink-0 rounded-xl bg-white md:hidden" />
            <span className="text-sm font-semibold text-[#58716b] truncate">{activeMenuItem?.label || "Visão geral"}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setTutorialOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#cbe4d1] bg-[#eef7f0] hover:bg-[#e2f0e6] text-xs font-bold text-[#173a34] transition shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              title="Abrir o Guia Passo a Passo do MeuAutônomo"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#2d7d54]" />
              <span className="hidden sm:inline">Guia Passo a Passo</span>
              <span className="sm:hidden">Guia</span>
            </button>
            <button
              type="button"
              onClick={() => setInstallModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#ebf3ea] text-xs font-semibold text-[#173a34] transition shadow-2xs hover:shadow-xs cursor-pointer"
              title="Instalar no smartphone ou computador"
            >
              <Download className="h-3.5 w-3.5 text-[#8aa500]" />
              <span>Instalar App</span>
            </button>
            <button
              type="button"
              onClick={() => setInstallModalOpen(true)}
              className="sm:hidden grid h-9 w-9 place-items-center rounded-xl text-[#58716b] transition hover:bg-white cursor-pointer"
              aria-label="Instalar aplicativo"
              title="Instalar no smartphone ou computador"
            >
              <Download className="h-4 w-4 text-[#8aa500]" />
            </button>
            <button
              type="button"
              onClick={() => setReferralModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d2e4b8] bg-[#f7fbe8] hover:bg-[#edf7d7] text-xs font-bold text-[#173a34] transition shadow-2xs hover:shadow-xs cursor-pointer"
              title="Indique colegas e ganhe 15 dias de PRO grátis"
            >
              <Gift className="h-3.5 w-3.5 text-[#8aa500]" />
              <span>Indique & Ganhe</span>
            </button>
            <button
              type="button"
              onClick={() => setVoucherModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f0f4ef] text-xs font-semibold text-[#173a34] transition shadow-2xs cursor-pointer"
              title="Resgatar cupom de teste ou voucher"
            >
              <Ticket className="h-3.5 w-3.5 text-[#8aa500]" />
              <span>Cupom / Voucher</span>
            </button>
            <span className="hidden text-right text-xs text-[#58716b] sm:block">
              {new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite"},{" "}
              <strong className="text-[#173a34]">{firstName}</strong>
            </span>
            <div className="shrink-0">
              <NotificationsBell />
            </div>
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-[#d9f56a] text-xs sm:text-sm font-bold text-[#173a34] shadow-2xs mr-0.5 sm:mr-0">{firstName.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        {voucherStatus?.isVip ? (
          <div className="bg-gradient-to-r from-[#173a34] via-[#1e4b43] to-[#173a34] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2d685c] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="bg-[#d9f56a] text-[#132a27] font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Crown className="h-3 w-3" /> VIP TOTAL
              </span>
              <span className="font-medium">Parabéns! Sua conta tem acesso vitalício com todos os recursos liberados.</span>
            </div>
            <button
              onClick={() => setReferralModalOpen(true)}
              className="text-[#d9f56a] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Gift className="h-3.5 w-3.5" /> Presentear um Colega
            </button>
          </div>
        ) : voucherStatus?.isPro && voucherStatus.daysRemaining !== null ? (
          voucherStatus.daysRemaining <= 3 ? (
            <div className="bg-[#fef3e2] text-[#8a4b08] border-b border-[#fed7aa] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="bg-[#ea580c] text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                  ⏳ DEGUSTAÇÃO EXPIRANDO
                </span>
                <span>
                  Seu teste PRO encerra em <strong>{voucherStatus.daysRemaining} dia(s)</strong>. Mantenha orçamentos e agendamentos ilimitados!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReferralModalOpen(true)}
                  className="text-[#8a4b08] underline font-semibold cursor-pointer"
                >
                  Ganhar +15 dias indicando
                </button>
                <button
                  onClick={() => setLocation("/planos")}
                  className="bg-[#ea580c] text-white px-3 py-1 rounded-lg font-bold hover:bg-[#c2410c] cursor-pointer"
                >
                  Assinar Plano
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#eef7e6] text-[#173a34] border-b border-[#cde5bf] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="bg-[#173a34] text-[#d9f56a] font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> PRO DEGUSTAÇÃO
                </span>
                <span>
                  Você tem <strong>{voucherStatus.daysRemaining} dias restantes</strong> de Plano PRO gratuito. Aproveite!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVoucherModalOpen(true)}
                  className="text-[#58716b] hover:text-[#173a34] underline cursor-pointer font-medium"
                >
                  Inserir outro voucher
                </button>
                <button
                  onClick={() => setReferralModalOpen(true)}
                  className="bg-[#173a34] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#28564d] cursor-pointer flex items-center gap-1"
                >
                  <Gift className="h-3 w-3 text-[#d9f56a]" /> Ganhar +15 dias
                </button>
              </div>
            </div>
          )
        ) : null}

        <main className="min-h-[calc(100vh-4rem)] flex-1 pb-24 w-full min-w-0 max-w-full overflow-x-hidden">{children}</main>
        {isMobile && <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t border-[#dce5dc] bg-white/95 px-2 shadow-[0_-6px_20px_rgba(19,42,39,0.06)] backdrop-blur">
          {menuItems.slice(0, 5).map(item => { const active = location === item.path; return <button key={item.path} onClick={() => setLocation(item.path)} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold ${active ? "text-[#173a34]" : "text-[#8a9b95]"}`}><item.icon className={`h-5 w-5 ${active ? "text-[#8aa500]" : ""}`} /><span className="truncate">{item.label}</span></button>; })}
        </nav>}
        <InstallAppModal open={installModalOpen} onOpenChange={setInstallModalOpen} />
        <ContactDevModal open={contactDevOpen} onOpenChange={setContactDevOpen} />
        <GuidedTutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} />
        <VoucherRedeemModal open={voucherModalOpen} onOpenChange={setVoucherModalOpen} />
        <ReferralModal open={referralModalOpen} onOpenChange={setReferralModalOpen} />
      </SidebarInset>
    </>
  );
}

function NotificationsBell() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const notifications = trpc.notification.list.useQuery(undefined, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const unread = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      notifications.refetch();
      unread.refetch();
    },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      notifications.refetch();
      unread.refetch();
    },
  });

  const unreadCount = typeof unread.data === "number" ? unread.data : 0;

  const prevCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevCountRef.current !== null && unreadCount > prevCountRef.current) {
      const latest = notifications.data?.[0];
      if (latest && !latest.read) {
        toast.info(latest.title || "Nova notificação", {
          description: latest.body || "Você recebeu uma nova atualização no seu espaço.",
          duration: 6000,
          action: {
            label: "Ver",
            onClick: () => handleNotificationClick(latest),
          },
        });
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, notifications.data]);

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      utils.notification.unreadCount.setData(undefined, 0);
      markAllRead.mutate();
    }
  };

  const handleNotificationClick = (item: {
    id: number;
    read?: boolean;
    type?: string | null;
    title?: string | null;
    body?: string | null;
  }) => {
    if (!item.read) {
      markRead.mutate({ id: item.id });
    }
    const type = item.type || "";
    const title = (item.title || "").toLowerCase();
    const body = (item.body || "").toLowerCase();

    if (
      type === "request" ||
      title.includes("solicitaç") ||
      title.includes("pedido") ||
      body.includes("solicitaç")
    ) {
      setLocation("/solicitacoes");
    } else if (
      type.startsWith("quote") ||
      title.includes("orçamento") ||
      title.includes("proposta") ||
      body.includes("orçamento") ||
      body.includes("proposta")
    ) {
      setLocation("/orcamentos");
    } else if (
      type === "appointment" ||
      title.includes("agendamento") ||
      title.includes("visita") ||
      title.includes("agenda") ||
      body.includes("agendado")
    ) {
      setLocation("/agenda");
    } else if (
      type === "payment" ||
      title.includes("pagamento") ||
      title.includes("fatura") ||
      title.includes("recebimento") ||
      body.includes("pagamento")
    ) {
      setLocation("/financeiro");
    } else if (type === "client" || title.includes("cliente")) {
      setLocation("/clientes");
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notificações"
          className="relative grid h-9 w-9 place-items-center rounded-xl text-[#58716b] transition hover:bg-white cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#9c4d43]" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b border-[#edf1eb] px-3 py-2">
          <p className="text-sm font-bold text-[#173a34]">Notificações</p>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                utils.notification.unreadCount.setData(undefined, 0);
                markAllRead.mutate();
              }}
              className="text-[11px] font-semibold text-[#8aa500] hover:underline"
            >
              Marcar como lidas
            </button>
          )}
        </div>
        {notifications.data?.length ? (
          notifications.data.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className="cursor-pointer items-start gap-2 py-3 hover:bg-[#f4f7f4]"
            >
              <span
                className={
                  item.read
                    ? "mt-1 h-2 w-2 shrink-0 rounded-full bg-[#dce5dc]"
                    : "mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d9f56a]"
                }
              />
              <span className="min-w-0 flex-1">
                <strong className="block text-xs text-[#284b42]">{item.title}</strong>
                <span className="mt-1 block text-xs text-[#82948e]">{item.body}</span>
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="px-2 py-4 text-xs text-[#82948e]">Nenhuma notificação por enquanto.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
