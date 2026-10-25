import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Mail,
  ExternalLink,
  Code2,
  Sparkles,
  Headphones,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface ContactDevModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDevModal({ open, onOpenChange }: ContactDevModalProps) {
  const whatsappNumber = "5511999999999"; // Suporte CreativeAM
  const supportEmail = "contatocreativeam@gmail.com";
  const whatsappText = encodeURIComponent(
    "Olá! Sou usuário do MeuAutônomo e gostaria de falar com a equipe de desenvolvimento da CreativeAM."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Suporte e Contato — MeuAutônomo"
  )}&body=${encodeURIComponent(
    "Olá equipe de desenvolvimento CreativeAM,\n\nPreciso de suporte com a plataforma MeuAutônomo:\n\n[Descreva sua dúvida, sugestão ou necessidade aqui]\n\nAtenciosamente,"
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-lg overflow-y-auto rounded-[28px] border-0 bg-white p-6 sm:p-8 shadow-[0_25px_70px_rgba(19,42,39,0.18)]">
        <DialogHeader className="text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-sm">
                <Code2 className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#8aa500]">
                  Equipe de Tecnologia
                </span>
                <span className="text-sm font-extrabold text-[#173a34]">
                  CreativeAM
                </span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f7dd] border border-[#dce5dc] px-3 py-1 text-[11px] font-bold text-[#556b10]">
              <Sparkles className="h-3 w-3 text-[#8aa500]" />
              <span>Suporte Direto</span>
            </div>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#173a34]">
            Falar com o Desenvolvedor
          </DialogTitle>
          <DialogDescription className="text-sm text-[#58716b] leading-relaxed">
            Dúvidas sobre o sistema, sugestões de novos recursos ou suporte técnico com a plataforma MeuAutônomo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3.5">
          {/* Card WhatsApp Oficial */}
          <div className="rounded-2xl border-2 border-[#b8df9c] bg-[#f8fcf5] p-5 shadow-xs transition hover:border-[#8aa500]">
            <div className="flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25d366] text-white shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-[#173a34]">WhatsApp do Desenvolvedor</strong>
                  <span className="rounded-full bg-[#e3f4d6] text-[#2c5b1c] px-2 py-0.2 text-[10px] font-bold">
                    Mais Rápido
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#527065] leading-relaxed">
                  Converse diretamente com o desenvolvedor responsável pela plataforma para tirar dúvidas, relatar problemas ou solicitar ajustes.
                </p>
                <div className="mt-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#173a34] hover:bg-[#28564d] px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25d366]" />
                    <span>Iniciar Conversa no WhatsApp</span>
                    <ExternalLink className="h-3 w-3 text-white/70" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card E-mail Oficial */}
          <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#173a34] text-[#d9f56a]">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <strong className="text-sm font-bold text-[#173a34]">E-mail de Suporte Técnico</strong>
                <p className="mt-1 text-xs text-[#527065] leading-relaxed">
                  Envie sugestões detalhadas, dúvidas ou comprovantes para a equipe de engenharia:
                </p>
                <p className="mt-1.5 font-mono text-xs font-bold text-[#173a34] select-all bg-white px-2.5 py-1 rounded-lg border border-[#dce5dc] inline-block">
                  {supportEmail}
                </p>
                <div className="mt-3">
                  <a
                    href={mailtoUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dce5dc] bg-white hover:bg-[#f2f7ef] px-4 py-2 text-xs font-bold text-[#173a34] transition shadow-2xs"
                  >
                    <Mail className="h-4 w-4 text-[#8aa500]" />
                    <span>Enviar E-mail</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Selo Criado por CreativeAM */}
          <div className="rounded-2xl border border-[#e2ece0] bg-[#f4f8ed] p-4 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#173a34]">
              <ShieldCheck className="h-4 w-4 text-[#8aa500]" />
              <span>Criado com excelência por CreativeAM</span>
            </div>
            <p className="text-[11px] text-[#58716b]">
              Tecnologia brasileira moderna, desenhada sob medida para empoderar autônomos e pequenos prestadores de serviços.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-xl border-[#dce5dc] px-5 text-xs font-semibold text-[#58716b] hover:bg-[#f5f8f2]"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
