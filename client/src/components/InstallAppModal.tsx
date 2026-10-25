import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Laptop,
  Download,
  CheckCircle2,
  Share2,
  MoreVertical,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

// Captura o evento de instalação globalmente assim que o script carrega
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

interface InstallAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppModal({ open, onOpenChange }: InstallAppModalProps) {
  const [canPrompt, setCanPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detecta se já está rodando como app instalado
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      try {
        localStorage.setItem("meuautonomo_app_installed", "true");
      } catch (e) {}
    }

    if (globalDeferredPrompt) {
      setCanPrompt(true);
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setCanPrompt(true);
    };

    const handleInstalled = () => {
      setInstallSuccess(true);
      setCanPrompt(false);
      globalDeferredPrompt = null;
      try {
        localStorage.setItem("meuautonomo_app_installed", "true");
        window.dispatchEvent(new Event("meuautonomo_app_installed_event"));
      } catch (e) {}
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!globalDeferredPrompt) return;
    try {
      await globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallSuccess(true);
        setCanPrompt(false);
        try {
          localStorage.setItem("meuautonomo_app_installed", "true");
          window.dispatchEvent(new Event("meuautonomo_app_installed_event"));
        } catch (e) {}
      }
      globalDeferredPrompt = null;
    } catch (err) {
      console.warn("Erro ao acionar instalação nativa:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto max-w-lg rounded-3xl p-6 sm:p-8 bg-white border border-[#dce5dc] shadow-2xl">
        <DialogHeader className="text-left space-y-3">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto object-contain" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f7dd] border border-[#dce5dc] text-[#52694e] text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-[#8aa500]" />
              <span>Instalação PWA</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-[#173a34]">
            Instale no Smartphone ou Computador
          </DialogTitle>
          <DialogDescription className="text-sm text-[#58716b]">
            Acesse seus orçamentos, agenda e financeiro diretamente da tela inicial do seu celular ou da área de trabalho do computador.
          </DialogDescription>
        </DialogHeader>

        {isStandalone || installSuccess ? (
          <div className="my-4 rounded-2xl bg-[#f1f7dd] border border-[#d5e7a9] p-5 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#8aa500] text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-[#173a34]">Aplicativo já instalado!</h4>
            <p className="mt-1 text-xs text-[#52694e]">
              Você já está utilizando o MeuAutônomo como aplicativo nativo. Todos os recursos rápidos estão ativados.
            </p>
          </div>
        ) : (
          <>
            {/* Botão de instalação com 1 clique se suportado pelo navegador */}
            {canPrompt && (
              <div className="my-2 p-4 rounded-2xl bg-[#173a34] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-semibold text-[#d9f56a] uppercase tracking-wider">
                    Compatibilidade direta detectada
                  </p>
                  <p className="text-sm font-medium text-white/90">
                    Instalar automaticamente agora
                  </p>
                </div>
                <Button
                  onClick={handleNativeInstall}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl bg-[#d9f56a] hover:bg-[#cbf050] text-[#173a34] font-bold text-xs shrink-0 shadow-sm"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Instalar com 1 Clique
                </Button>
              </div>
            )}

            {/* Abas com passos ilustrados */}
            <Tabs defaultValue="smartphone" className="mt-4 w-full">
              <TabsList className="grid grid-cols-2 h-11 p-1 bg-[#f5f8f2] rounded-2xl border border-[#dce5dc]">
                <TabsTrigger
                  value="smartphone"
                  className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4 text-[#8aa500]" />
                  No Smartphone
                </TabsTrigger>
                <TabsTrigger
                  value="desktop"
                  className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs flex items-center gap-2"
                >
                  <Laptop className="h-4 w-4 text-[#8aa500]" />
                  No Computador
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo Smartphone */}
              <TabsContent value="smartphone" className="mt-4 space-y-3.5 focus-visible:outline-none">
                <div className="rounded-2xl border border-[#e2eae1] bg-[#fbfcf9] p-4 text-xs text-[#38584f] space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
                      1
                    </span>
                    <div>
                      <strong className="block text-sm text-[#173a34]">Android (Google Chrome)</strong>
                      <p className="mt-0.5 text-[#58716b]">
                        Toque nos <strong>três pontinhos (<MoreVertical className="inline h-3.5 w-3.5" />)</strong> no topo do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-[#e2eae1]" />

                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
                      2
                    </span>
                    <div>
                      <strong className="block text-sm text-[#173a34]">iPhone / iPad (Safari)</strong>
                      <p className="mt-0.5 text-[#58716b]">
                        Toque no botão <strong>Compartilhar (<Share2 className="inline h-3.5 w-3.5" />)</strong> na barra inferior do Safari, role as opções e toque em <strong>"Adicionar à Tela de Início"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Conteúdo Computador */}
              <TabsContent value="desktop" className="mt-4 space-y-3.5 focus-visible:outline-none">
                <div className="rounded-2xl border border-[#e2eae1] bg-[#fbfcf9] p-4 text-xs text-[#38584f] space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
                      1
                    </span>
                    <div>
                      <strong className="block text-sm text-[#173a34]">Google Chrome, Edge ou Brave</strong>
                      <p className="mt-0.5 text-[#58716b]">
                        No topo do navegador, olhe na barra de endereço (onde fica o link). Clique no ícone de <strong>instalação (<Download className="inline h-3.5 w-3.5 text-[#8aa500]" />)</strong> ou computador.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-[#e2eae1]" />

                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
                      2
                    </span>
                    <div>
                      <strong className="block text-sm text-[#173a34]">Ou pelo menu do navegador</strong>
                      <p className="mt-0.5 text-[#58716b]">
                        Clique no menu <strong>(⋮)</strong> no canto superior direito do navegador e selecione <strong>"Instalar MeuAutônomo"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Vantagens */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#e2eae1]">
              <div className="flex items-center gap-2 text-[11px] text-[#58716b]">
                <Zap className="h-3.5 w-3.5 text-[#8aa500] shrink-0" />
                <span>Abre instantâneo sem abas</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#58716b]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8aa500] shrink-0" />
                <span>Seguro e não ocupa memória</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-xl border-[#dce5dc] px-5 text-xs font-semibold text-[#58716b] hover:bg-[#f5f8f2]"
          >
            Entendido, fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
