import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "@/components/AuthModal";
import { InstallAppModal } from "@/components/InstallAppModal";
import { ContactDevModal } from "@/components/ContactDevModal";
import { ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList, Code2, Download, LogIn, LogOut, Menu, Sparkles, UserPlus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

const features = [
  { icon: CalendarDays, title: "Agenda que acompanha seu ritmo", text: "Organize atendimentos, horários e mudanças sem planilhas espalhadas." },
  { icon: Users, title: "Clientes em um só lugar", text: "Tenha contatos, histórico e próximos passos acessíveis quando precisar." },
  { icon: ClipboardList, title: "Pedidos que viram trabalho", text: "Receba solicitações pela sua página e responda com mais agilidade." },
  { icon: CircleDollarSign, title: "Dinheiro sem complicação", text: "Registre pagamentos e saiba o que entrou e o que ainda está pendente." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"register" | "login" | "forgot">("register");
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [contactDevOpen, setContactDevOpen] = useState(false);
  const [showInstallPill, setShowInstallPill] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const openAuth = (tab: "register" | "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleDismissPill = () => {
    setShowInstallPill(false);
    try {
      localStorage.setItem("meuautonomo_install_pill_dismissed", "true");
    } catch (e) {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detecta se a aplicação já está instalada ou rodando em modo standalone (PWA no celular ou desktop)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    const alreadyInstalled = localStorage.getItem("meuautonomo_app_installed") === "true";
    const dismissed = localStorage.getItem("meuautonomo_install_pill_dismissed") === "true";

    if (isStandalone) {
      try {
        localStorage.setItem("meuautonomo_app_installed", "true");
      } catch (e) {}
      setShowInstallPill(false);
    } else if (!alreadyInstalled && !dismissed) {
      setShowInstallPill(true);
    }

    const handleInstalled = () => {
      setShowInstallPill(false);
      try {
        localStorage.setItem("meuautonomo_app_installed", "true");
      } catch (e) {}
    };

    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("meuautonomo_app_installed_event", handleInstalled);

    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "true") {
      openAuth("login");
    } else if (params.get("register") === "true") {
      openAuth("register");
    }

    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("meuautonomo_app_installed_event", handleInstalled);
    };
  }, []);

  return <div className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#173a34]">
    <header className="sticky top-0 z-40 border-b border-[#dce5dc]/90 bg-[#f5f7f2]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 flex h-18 sm:h-20 items-center justify-between gap-4">
        {/* Lado Esquerdo: Logo Oficial e Links Principais com Espaçamento Generoso */}
        <div className="flex items-center gap-8 lg:gap-10 shrink-0">
          <a href="#top" className="flex items-center py-1 shrink-0" aria-label="MeuAutônomo Home">
            <img src="/logo.png" alt="MeuAutônomo Lite" className="h-9 sm:h-11 w-auto object-contain" />
            <span className="ml-1 text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#173a34] text-[#86efac] border border-[#22c55e]/30 tracking-widest shadow-2xs">LITE</span>
          </a>
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#5c756d]">
            <a href="#como-funciona" className="whitespace-nowrap transition hover:text-[#173a34]">Como funciona</a>
            <a href="#recursos" className="whitespace-nowrap transition hover:text-[#173a34]">Recursos</a>
          </nav>
        </div>

        {/* Lado Direito: Ações Principais e CTA de Entrada / Cadastro */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Botão Instalar App (desktop e tablet) */}
          <button
            type="button"
            onClick={() => setInstallModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[#cbd8cc] bg-white/80 hover:bg-white hover:border-[#8aa500] px-3 py-1.5 text-xs font-bold text-[#173a34] transition shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap"
            title="Instalar aplicativo no smartphone ou computador"
          >
            <Download className="h-3.5 w-3.5 text-[#8aa500]" />
            <span>Instalar App</span>
          </button>

          {/* Seletor Compacto de Tema */}
          <div className="hidden lg:flex items-center">
            <label className="sr-only" htmlFor="theme-select">Tema</label>
            <select
              id="theme-select"
              value={theme}
              onChange={event => setTheme(event.target.value as "light" | "dark" | "system")}
              className="h-8 rounded-xl border border-[#dce5dc] bg-white/70 px-2 text-xs font-semibold text-[#58716b] outline-none transition hover:border-[#cbd8cc] focus:ring-2 focus:ring-[#d9f56a]"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Auto</option>
            </select>
          </div>

          <div className="hidden sm:block h-4 w-px bg-[#dce5dc] mx-0.5" />

          {/* Autenticação e Entrada */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => window.location.href = "/app"}
                className="h-9 rounded-xl bg-[#173a34] px-4 text-xs font-bold text-white hover:bg-[#28564d] shadow-sm whitespace-nowrap"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#d9f56a]" /> Meu Espaço ({user.name?.split(" ")[0] || "Autônomo"})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 rounded-xl px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                title="Sair desta conta para criar ou entrar com outra"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" /> Sair
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuth("login")}
                className="h-9 rounded-xl px-3 text-xs sm:text-sm font-semibold text-[#173a34] hover:bg-[#e4ece4] whitespace-nowrap"
              >
                <LogIn className="mr-1.5 h-4 w-4" /> Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => openAuth("register")}
                className="h-9 rounded-xl bg-[#173a34] px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#28564d] whitespace-nowrap"
              >
                <UserPlus className="mr-1.5 h-4 w-4" /> Criar Conta
              </Button>
            </div>
          )}

          {/* Botão de Menu Mobile e Tablet */}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce5dc] bg-white/70 text-[#173a34] hover:bg-white lg:hidden transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Gaveta de Navegação Mobile & Tablet */}
      {menuOpen && (
        <div className="border-t border-[#dce5dc] bg-white p-5 lg:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid gap-3">
            <a
              href="#como-funciona"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#173a34] hover:bg-[#f5f7f2] transition"
            >
              Como funciona
            </a>
            <a
              href="#recursos"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#173a34] hover:bg-[#f5f7f2] transition"
            >
              Recursos
            </a>

            <div className="h-px bg-[#eef2ee] my-1" />

            <Button
              variant="outline"
              onClick={() => { setMenuOpen(false); setInstallModalOpen(true); }}
              className="w-full justify-start rounded-xl border-[#cbd8cc] text-[#173a34] font-bold h-11"
            >
              <Download className="mr-2 h-4 w-4 text-[#8aa500]" /> Instalar no Celular ou PC
            </Button>

            <Button
              variant="ghost"
              onClick={() => { setMenuOpen(false); setContactDevOpen(true); }}
              className="w-full justify-start rounded-xl text-[#5c756d] hover:text-[#173a34] h-11"
            >
              <Code2 className="mr-2 h-4 w-4 text-[#8aa500]" /> Falar com o Desenvolvedor (CreativeAM)
            </Button>

            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#f5f7f2]">
              <span className="text-xs font-semibold text-[#5c756d]">Tema visual:</span>
              <select
                id="mobile-theme-select"
                value={theme}
                onChange={event => setTheme(event.target.value as "light" | "dark" | "system")}
                className="h-9 rounded-lg border border-[#dce5dc] bg-white px-2.5 text-xs font-semibold text-[#173a34]"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="system">Automático</option>
              </select>
            </div>

            <div className="h-px bg-[#eef2ee] my-1" />

            {user ? (
              <div className="grid gap-2 pt-1">
                <Button onClick={() => window.location.href = "/app"} className="w-full h-11 rounded-xl bg-[#173a34] text-white font-bold">
                  <Sparkles className="mr-1.5 h-4 w-4 text-[#d9f56a]" /> Acessar Meu Espaço ({user.name?.split(" ")[0] || "Autônomo"})
                </Button>
                <Button variant="outline" onClick={logout} className="w-full h-10 rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <LogOut className="mr-1.5 h-4 w-4" /> Sair desta conta
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" onClick={() => { setMenuOpen(false); openAuth("login"); }} className="h-11 rounded-xl border-[#cbd8cc] text-[#173a34] font-semibold">
                  <LogIn className="mr-1.5 h-4 w-4" /> Entrar
                </Button>
                <Button onClick={() => { setMenuOpen(false); openAuth("register"); }} className="h-11 rounded-xl bg-[#173a34] text-white font-bold">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Criar Conta
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
    <main id="top">
      <section className="relative">
        <div className="absolute -right-36 -top-28 h-[480px] w-[480px] rounded-full bg-[#d9f56a]/40 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative grid items-center gap-14 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24 lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ccdc9b] bg-[#f1f7dd] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#6e8313]">
              <span className="h-2 w-2 rounded-full bg-[#9ab41d]" /> Edição Lite · Rápida & Direta ao Ponto
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.055em] text-[#173a34] sm:text-6xl lg:text-7xl">
              Seu trabalho. <span className="text-[#819815]">Mais leve e rápido.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#627b72]">
              O MeuAutônomo Lite reúne agenda, atendimentos, serviços, clientes e controle financeiro em um espaço ágil, leve e direto ao ponto para o profissional autônomo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
                  <Button onClick={() => window.location.href = "/app"} className="h-13 rounded-2xl bg-[#173a34] px-6 text-base text-white shadow-[0_12px_24px_rgba(19,42,39,0.16)] hover:bg-[#28564d]">
                    Ir para meu espaço <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="h-13 rounded-2xl border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair para criar outra conta
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={() => openAuth("register")} className="h-13 rounded-2xl bg-[#173a34] px-6 text-base text-white shadow-[0_12px_24px_rgba(19,42,39,0.16)] hover:bg-[#28564d]">
                    Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" onClick={() => openAuth("login")} className="h-13 rounded-2xl border-[#cbd8cc] bg-transparent px-6 text-base text-[#416158] hover:bg-white/60">
                    Já tenho conta (Entrar)
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#cbd8cc] bg-white/70 px-3.5 py-2 text-xs font-bold text-[#173a34] transition hover:bg-white hover:border-[#8aa500] cursor-pointer shadow-2xs"
              >
                <Download className="h-4 w-4 text-[#8aa500]" />
                <span>Instalar no Celular ou Computador (App PWA)</span>
                <span className="rounded-md bg-[#d9f56a] px-1.5 py-0.5 text-[10px] font-extrabold text-[#173a34]">1 Clique</span>
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#708880]">
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Sem planilhas</span>
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Sem burocracia</span>
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Do seu jeito</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -left-6 top-12 h-28 w-28 rounded-[32px] bg-[#173a34] opacity-10 blur-xl" />
            <div className="relative rotate-1 rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_25px_70px_rgba(19,42,39,0.13)] sm:p-5">
              <div className="rounded-[23px] bg-[#f5f7f2] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8aa500]">Seu espaço</p>
                    <h3 className="mt-1 text-xl font-bold text-[#173a34]">Tudo começa aqui.</h3>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9f56a] text-sm font-bold text-[#173a34]">+</div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#173a34] p-4 text-white">
                    <CalendarDays className="h-4 w-4 text-[#d9f56a]" />
                    <p className="mt-4 text-2xl font-bold">—</p>
                    <p className="mt-1 text-[11px] text-white/60">atendimentos cadastrados</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <CircleDollarSign className="h-4 w-4 text-[#8aa500]" />
                    <p className="mt-4 text-2xl font-bold text-[#173a34]">—</p>
                    <p className="mt-1 text-[11px] text-[#879b93]">receitas registradas</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#34574d]">Próximo atendimento</p>
                    <span className="rounded-full bg-[#f5f8f2] px-2 py-1 text-[10px] font-bold text-[#819815]">Ainda não há</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e]">+</div>
                    <div>
                      <p className="text-sm font-semibold text-[#284b42]">Sua agenda está livre</p>
                      <p className="text-xs text-[#82948e]">Cadastre seu primeiro atendimento</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f1f7dd] p-4 cursor-pointer hover:bg-[#eaf3d1] transition" onClick={() => openAuth("register")}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9f56a]"><Users className="h-4 w-4" /></div>
                    <p className="text-xs font-semibold text-[#526b4d]">Comece cadastrando seus dados</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#829a14]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl bg-[#173a34] px-4 py-3 text-white shadow-xl sm:block">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#d9f56a]">Tudo em um só lugar</p>
              <p className="mt-1 text-sm font-semibold">Você no controle</p>
            </div>
          </div>
        </div>
      </section>
      <section id="como-funciona" className="border-y border-[#dce5dc] bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">Menos burocracia, mais utilidade</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">Um espaço que entende o seu dia.</h2>
            <p className="mt-4 text-lg leading-8 text-[#6d837b]">Você não precisa aprender um sistema complicado. Abra, veja o que importa e continue fazendo o seu trabalho.</p>
          </div>
          <div id="recursos" className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[22px] bg-[#f5f7f2] p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(19,42,39,0.06)]">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d9f56a] text-[#173a34]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold text-[#284b42]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#71867f]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="rounded-[30px] bg-[#173a34] p-7 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9f56a]">Pronto para simplificar?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Organize seu trabalho para cuidar do que realmente importa.</h2>
            <p className="mt-4 leading-7 text-white/65">Crie seu espaço, compartilhe seu cartão profissional e comece a atender com mais clareza.</p>
          </div>
          <Button onClick={() => openAuth("register")} className="mt-8 h-13 shrink-0 rounded-2xl bg-[#d9f56a] px-6 text-base font-bold text-[#173a34] hover:bg-[#e8ff8e] lg:mt-0">
            Criar meu espaço agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>

    {/* Floating bottom install pill (dismissible) */}
    {showInstallPill && (
      <aside aria-label="Instalação do Aplicativo" className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 px-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#dce5dc] bg-[#173a34] px-4 py-2.5 text-white shadow-[0_12px_30px_rgba(19,42,39,0.25)] backdrop-blur">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d9f56a] text-[#173a34]">
              <Download className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">Instalar o MeuAutônomo</p>
              <p className="truncate text-[10px] text-white/70">Acesse direto da sua tela inicial ou PC</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={() => setInstallModalOpen(true)}
              className="rounded-xl bg-[#d9f56a] px-3 py-1 text-xs font-bold text-[#173a34] hover:bg-[#cbe65c]"
            >
              Instalar
            </Button>
            <button
              type="button"
              onClick={handleDismissPill}
              className="grid h-7 w-7 place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Dispensar aviso"
              aria-label="Dispensar aviso de instalação"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    )}

    <footer className="border-t border-[#dce5dc] py-8 bg-[#f5f7f2]">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#82948e]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MeuAutônomo" className="h-8 w-auto object-contain" />
          <span>Feito para profissionais que fazem acontecer.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setInstallModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-[#58716b] hover:text-[#173a34] transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#8aa500]" /> Instalar App
          </button>
          <span className="text-[#cbd8cc]">|</span>
          <button
            type="button"
            onClick={() => setContactDevOpen(true)}
            className="inline-flex items-center gap-1.5 text-[#58716b] hover:text-[#173a34] transition cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-[#8aa500]" /> Falar com o Desenvolvedor
          </button>
          <span className="text-[#cbd8cc]">|</span>
          <span className="text-[#58716b]">
            Criado por <strong className="text-[#173a34] font-bold">CreativeAM</strong>
          </span>
        </div>
      </div>
    </footer>

    <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    <InstallAppModal open={installModalOpen} onOpenChange={setInstallModalOpen} />
    <ContactDevModal open={contactDevOpen} onOpenChange={setContactDevOpen} />
  </div>;
}

