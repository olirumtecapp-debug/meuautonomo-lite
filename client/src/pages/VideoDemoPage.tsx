import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Award,
  Play,
  Pause,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  MessageSquare,
  QrCode,
  Clock,
  Check,
  Flame,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SlideData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  painText: string;
  solutionTitle: string;
  solutionText: string;
  buttonText: string;
  screenComponent: React.ReactNode;
}

export default function VideoDemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6500; // 6.5 segundos por slide no auto-play

  const slides: SlideData[] = [
    {
      id: 1,
      badge: "A DOR DO DIA A DIA",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      title: "Perdendo cliente por demora no orçamento?",
      painText: "Passar valor no papel de pão ou demorar horas para responder faz o cliente esfriar e fechar com o concorrente.",
      solutionTitle: "⚡ VANTAGEM 1: Orçamento Pronto em 30 Segundos",
      solutionText: "Preencha os itens no celular e envie direto no WhatsApp do cliente enquanto conversa com ele.",
      buttonText: "Ver como o cliente recebe",
      screenComponent: (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between border-b pb-2.5 mb-3">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Novo Orçamento #1042
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Pronto em 30s
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Cliente</div>
              <div className="font-bold text-slate-800 text-sm">Dra. Camila Ferreira</div>
              <div className="text-[11px] text-slate-500">WhatsApp: (11) 98844-2211</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Serviço Escolhido</div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="font-bold text-slate-800">Troca de Fiação + Quadro</span>
                <span className="font-black text-emerald-600 text-sm">R$ 480,00</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Materiais inclusos • 90 dias de garantia</div>
            </div>
          </div>

          <div className="mt-3 bg-[#25D366] text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-md">
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Enviar pelo WhatsApp</span>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          </div>

          <div className="absolute bottom-4 right-8 pointer-events-none text-2xl animate-bounce">
            👆
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: "AUTORIDADE IMEDIATA",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      title: "Passa a imagem de uma grande empresa",
      painText: "Texto feio no WhatsApp não passa confiança. O cliente desconfia e fica pedindo desconto absurdo.",
      solutionTitle: "💎 VANTAGEM 2: O Cliente Não Chora Preço",
      solutionText: "Uma página linda com sua foto, logotipo, termos e garantia formal gera respeito e valorização imediata.",
      buttonText: "Ver tela de aprovação do cliente",
      screenComponent: (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-100 relative">
          <div className="bg-gradient-to-r from-[#173a34] to-[#23534b] text-white p-3.5 rounded-2xl mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d9f56a] text-[#173a34] font-black flex items-center justify-center text-lg">
              ME
            </div>
            <div>
              <h4 className="font-black text-sm text-white">Marcos Elétrica & Manutenção</h4>
              <p className="text-[10px] text-[#d9f56a] font-semibold">Técnico Certificado • 4.9 ★ (128 avaliações)</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-3">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
              O que o cliente vê no WhatsApp:
            </div>
            <p className="text-xs text-emerald-950 font-medium mt-1">
              "Olá Camila! Preparei sua proposta formal com condições especiais e garantia por escrito."
            </p>
          </div>

          <div className="space-y-1.5 text-xs border-t pt-2 text-slate-600">
            <div className="flex justify-between">
              <span>Mão de Obra Técnica:</span> <strong className="text-slate-800">R$ 380,00</strong>
            </div>
            <div className="flex justify-between">
              <span>Disjuntores e Cabos:</span> <strong className="text-slate-800">R$ 100,00</strong>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-1 mt-1">
              <span>Total Fechado:</span>
              <span className="text-emerald-600">R$ 480,00</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: "FECHAMENTO INSTANTÂNEO",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      title: "Aprovação em 1 toque sem enrolação",
      painText: "O cliente diz 'vou ver e te aviso' e você nunca mais recebe resposta.",
      solutionTitle: "✅ VANTAGEM 3: O Cliente Não Precisa Baixar App",
      solutionText: "Ele abre no próprio navegador do WhatsApp, lê os termos e aprova com 1 toque no botão verde.",
      buttonText: "Ver dinheiro caindo no PIX",
      screenComponent: (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-100 text-center relative">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 font-black">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-black text-base text-slate-900">Proposta Aprovada pelo Cliente!</h4>
          <p className="text-xs text-slate-500 mt-1">Camila Ferreira confirmou o serviço para Terça-feira às 14:00.</p>

          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-left">
            <div className="text-[10px] font-bold uppercase text-slate-400">Notificação no seu Celular</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">🔔 "Seu cliente acabou de aceitar o orçamento!"</div>
            <div className="text-[10px] text-slate-500">A agenda foi bloqueada automaticamente.</div>
          </div>

          <div className="mt-3 bg-emerald-600 text-white p-3 rounded-2xl font-black text-xs shadow flex items-center justify-center gap-2">
            <span>Pagar Entrada via PIX</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      ),
    },
    {
      id: 4,
      badge: "O DINHEIRO 100% SEU",
      badgeColor: "bg-[#d9f56a]/20 text-[#d9f56a] border-[#d9f56a]/30",
      title: "Zero Taxas de Intermediação (0%)",
      painText: "Outros aplicativos e maquininhas mordem de 3% a 10% do dinheiro do seu trabalho.",
      solutionTitle: "💰 VANTAGEM 4: O PIX Cai Direto na sua Conta",
      solutionText: "O QR Code PIX abre na tela do cliente. Você recebe o sinal antes mesmo de sair de casa para atender.",
      buttonText: "E se eu tiver ajudantes ou salão?",
      screenComponent: (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-100 relative">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <span className="text-xs font-black text-slate-800">Pagamento Instantâneo</span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              0% DE TAXA
            </span>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl text-center mb-3">
            <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow">
              <QrCode className="w-20 h-20 text-slate-950" />
            </div>
            <div className="text-[11px] font-bold text-[#d9f56a] mt-2">PIX Copia e Cola Gerado</div>
            <div className="text-[10px] text-white/70">Chave: 11988442211 (Marcos Eletricista)</div>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl text-center">
            <div className="text-xs font-bold text-emerald-800">Entrada Recebida: R$ 240,00</div>
            <div className="text-[10px] text-emerald-600">Saldo disponível imediatamente no seu banco</div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      badge: "MODO ESTÚDIO & EQUIPE",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      title: "Tem Salão, Barbearia ou Oficina com Parceiros?",
      painText: "Brigas no final do mês para calcular comissões e receio de que a funcionária veja o faturamento do dono.",
      solutionTitle: "👥 VANTAGEM 5: Cada um Acessa o seu no Celular",
      solutionText: "A dona gerencia tudo, as parceiras só veem a agenda própria delas e a comissão é calculada sem erro.",
      buttonText: "Ver como começar agora",
      screenComponent: (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-100 relative">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <span className="text-xs font-black text-slate-800">Equipe & Parceiros</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Painel Seguro
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  C
                </div>
                <div>
                  <div className="font-bold text-slate-800">Carla (Manicure)</div>
                  <div className="text-[10px] text-slate-500">Acesso via celular próprio</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600">R$ 1.840</div>
                <div className="text-[9px] text-slate-400">Comissão 60%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                  B
                </div>
                <div>
                  <div className="font-bold text-slate-800">Beatriz (Cabeleireira)</div>
                  <div className="text-[10px] text-slate-500">Acesso via celular próprio</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-600">R$ 3.200</div>
                <div className="text-[9px] text-slate-400">Comissão 50%</div>
              </div>
            </div>
          </div>

          <div className="mt-2.5 p-2 bg-purple-50 rounded-xl text-[10px] text-purple-900 font-semibold text-center">
            🔒 Privacidade total: suas funcionárias não veem seu lucro geral!
          </div>
        </div>
      ),
    },
    {
      id: 6,
      badge: "GARANTIA INCONDICIONAL",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      title: "Comece Grátis com Risco Zero (Art. 49 CDC)",
      painText: "Medo de pagar por sistemas caros e complicados que você acaba não usando.",
      solutionTitle: "🛡️ VANTAGEM 6: 7 Dias de Teste com Devolução Total",
      solutionText: "Se você adquirir e por qualquer motivo desistir em até 7 dias, devolvemos 100% do seu dinheiro via PIX na hora.",
      buttonText: "Acessar o MeuAutônomo Agora",
      screenComponent: (
        <div className="bg-gradient-to-b from-[#173a34] to-[#0e2420] text-white rounded-3xl p-5 shadow-2xl text-center relative border border-white/10">
          <div className="w-12 h-12 bg-[#d9f56a] text-[#173a34] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 font-black shadow-lg">
            <Sparkles className="w-7 h-7 fill-[#173a34]" />
          </div>
          <h4 className="font-black text-lg text-white">Pronto para transformar sua rotina?</h4>
          <p className="text-xs text-white/70 mt-1">Organize seus clientes, feche orçamentos mais rápido e receba no PIX sem taxas.</p>

          <div className="my-4 p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur text-left space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#d9f56a]">
              <Check className="w-4 h-4 text-[#d9f56a]" /> Comece Grátis hoje mesmo
            </div>
            <div className="flex items-center gap-2 font-bold text-[#d9f56a]">
              <Check className="w-4 h-4 text-[#d9f56a]" /> Sem burocracia de cartão de crédito
            </div>
            <div className="flex items-center gap-2 font-bold text-[#d9f56a]">
              <Check className="w-4 h-4 text-[#d9f56a]" /> Garantia incondicional de 7 dias (CDC)
            </div>
          </div>

          <div className="text-[11px] text-[#d9f56a] font-bold">
            Clique no botão abaixo para usar agora!
          </div>
        </div>
      ),
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || isInteractive) return;

    const intervalMs = 50;
    const stepPct = (intervalMs / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + stepPct;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isInteractive, currentSlide]);

  const nextSlide = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const goToSlide = (idx: number) => {
    setProgress(0);
    setCurrentSlide(idx);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleInteractive = () => {
    if (!isInteractive) {
      setIsInteractive(true);
      setIsPlaying(false);
    } else {
      setIsInteractive(false);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      {/* FRAME PRINCIPAL ESTILO CELULAR / REELS */}
      <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[840px] bg-[#122b27] sm:rounded-[40px] overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10">

        {/* BARRINHAS DE PROGRESSO NO TOPO */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 sm:pt-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex gap-1.5 w-full">
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => goToSlide(i)}
                className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden relative cursor-pointer"
              >
                <div
                  className="h-full bg-[#d9f56a] transition-all duration-75"
                  style={{
                    width:
                      i < currentSlide
                        ? "100%"
                        : i === currentSlide
                        ? `${Math.min(100, progress)}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* CABEÇALHO */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#d9f56a] text-[#173a34] font-black flex items-center justify-center text-base shadow">
                M
              </div>
              <div>
                <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  MeuAutônomo
                  <span className="bg-[#d9f56a]/20 text-[#d9f56a] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#d9f56a]/30">
                    DEMO
                  </span>
                </div>
                <div className="text-[11px] text-white/70">
                  Vantagem {currentSlide + 1} de {slides.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-sm backdrop-blur active:scale-95 transition"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />}
              </button>

              <button
                onClick={toggleInteractive}
                className={`px-2.5 py-1 rounded-full font-black text-xs shadow active:scale-95 transition flex items-center gap-1 ${
                  isInteractive
                    ? "bg-white text-slate-900"
                    : "bg-[#d9f56a] text-[#173a34]"
                }`}
              >
                {isInteractive ? "▶️ Modo Vídeo" : "🎮 Testar com Dedo"}
              </button>
            </div>
          </div>
        </div>

        {/* ZONAS DE TOQUE (ESQUERDA VOLTA, DIREITA AVANÇA) */}
        <div
          onClick={prevSlide}
          className="absolute left-0 top-20 bottom-32 w-1/4 z-20 cursor-pointer"
          title="Toque para voltar"
        />
        <div
          onClick={nextSlide}
          className="absolute right-0 top-20 bottom-32 w-1/4 z-20 cursor-pointer"
          title="Toque para avançar"
        />

        {/* CONTEÚDO DO SLIDE */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 pt-20 pb-4">
          <div className="mb-3 text-center">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${slide.badgeColor}`}
            >
              {slide.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto">
              {slide.painText}
            </p>
          </div>

          <div className="my-auto">{slide.screenComponent}</div>
        </div>

        {/* RODAPÉ COM A VANTAGEM EM DESTAQUE E BOTÃO DE AÇÃO */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent border-t border-white/10">
          <div className="mb-3 p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <div className="text-xs font-black text-[#d9f56a] uppercase tracking-wide flex items-center gap-1.5">
              {slide.solutionTitle}
            </div>
            <div className="text-xs text-white/90 font-medium mt-0.5">
              {slide.solutionText}
            </div>
          </div>

          <div className="flex gap-2">
            {currentSlide === slides.length - 1 ? (
              <Link href="/app" className="flex-1">
                <Button className="w-full py-3 px-4 rounded-xl bg-[#d9f56a] hover:bg-[#cbf04a] text-[#173a34] font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition">
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={nextSlide}
                className="flex-1 py-3 px-4 rounded-xl bg-[#d9f56a] hover:bg-[#cbf04a] text-[#173a34] font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
              >
                <span>{slide.buttonText}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="text-center mt-2">
            <span className="text-[10px] text-white/50">
              Toque na direita para avançar • Toque na esquerda para voltar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
