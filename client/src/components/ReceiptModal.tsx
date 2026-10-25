import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Check, FileCheck, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface ReceiptData {
  receiptNumber: string;
  date: Date | string;
  professionalName: string;
  profession: string;
  professionalPhone?: string;
  professionalCity?: string;
  pixKey?: string;
  paymentMethod?: string;
  clientName: string;
  clientPhone?: string;
  serviceDescription: string;
  amountCents: number;
  authCode?: string;
}

export function ReceiptModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
}) {
  if (!data) return null;

  const money = (cents = 0) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const dateFormatted = new Date(data.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const validationUrl = data.authCode
    ? `${window.location.origin}/validar-recibo?codigo=${data.authCode}`
    : `${window.location.origin}/validar-recibo`;

  const generateWhatsappText = () => {
    return (
      `*RECIBO DE PRESTAÇÃO DE SERVIÇOS* 📄\n` +
      `*Nº:* ${data.receiptNumber}\n` +
      `*Data:* ${dateFormatted}\n\n` +
      `*Prestador:* ${data.professionalName} (${data.profession})\n` +
      (data.professionalPhone ? `*Contato:* ${data.professionalPhone}\n` : "") +
      `*Cliente:* ${data.clientName}\n\n` +
      `*Descrição:* ${data.serviceDescription}\n` +
      `*VALOR PAGO:* ${money(data.amountCents)}\n` +
      `*FORMA DE PAGAMENTO:* ${data.paymentMethod || "Acerto direto com o prestador"}\n\n` +
      (data.authCode ? `🛡️ *Assinatura Eletrônica:* ${data.authCode}\n` : "") +
      `🔗 *Validar autenticidade oficial:* ${validationUrl}\n\n` +
      `_Recebi a quantia acima descrita diretamente do cliente referente aos serviços prestados, dando plena e geral quitação nos termos da Lei Federal nº 14.063/2020 e Art. 320 do Código Civil._`
    );
  };

  const copyReceiptText = () => {
    navigator.clipboard?.writeText(generateWhatsappText());
    toast.success("Texto do recibo copiado para colar no WhatsApp!");
  };

  const sendWhatsappReceipt = () => {
    const text = generateWhatsappText();
    const rawPhone = (data.clientPhone || "").replace(/\D/g, "");
    if (rawPhone) {
      window.open(`https://wa.me/55${rawPhone.replace(/^55/, "")}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("Texto do recibo copiado! Cole no WhatsApp do cliente.");
    }
  };

  const handlePrint = () => {
    const code = data.authCode || data.receiptNumber;
    window.open(`/validar-recibo?codigo=${encodeURIComponent(code)}&print=true`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-[24px] p-6 sm:p-8">
        <DialogHeader className="border-b border-[#edf1eb] pb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8aa500]">
              <FileCheck className="h-4 w-4" /> Comprovante Oficial
            </span>
            <span className="rounded-full bg-[#f4f7ed] px-3 py-0.5 text-xs font-semibold text-[#5a7114]">
              {data.receiptNumber}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-[#173a34] mt-1">
            Recibo de Prestação de Serviços
          </DialogTitle>
        </DialogHeader>

        {/* ÁREA DO RECIBO IMPRIMÍVEL */}
        <div id="printable-receipt" className="space-y-5 py-4 text-sm text-[#38584f]">
          <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#173a34]">{data.professionalName}</h3>
                <p className="text-xs text-[#71867f] font-medium">{data.profession}</p>
                {data.professionalCity && (
                  <p className="text-xs text-[#71867f]">{data.professionalCity}</p>
                )}
                {data.professionalPhone && (
                  <p className="text-xs text-[#71867f]">Tel: {data.professionalPhone}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-[#82948e] block">VALOR PAGO</span>
                <span className="text-2xl font-black text-[#173a34]">
                  {money(data.amountCents)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-[#f5f8f2] p-5 text-xs sm:text-sm leading-relaxed">
            <p>
              Recebi(emos) de <strong className="text-[#173a34]">{data.clientName}</strong> a quantia supra de{" "}
              <strong className="text-[#173a34]">{money(data.amountCents)}</strong>, referente aos serviços prestados descritos abaixo:
            </p>
            <div className="rounded-xl border border-[#dce5dc] bg-white p-3.5 font-medium text-[#284b42]">
              {data.serviceDescription}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs border border-[#e2ece4]">
              <span>Forma de Pagamento: <strong className="text-[#173a34]">{data.paymentMethod || "Acerto direto com o prestador"}</strong></span>
              {data.pixKey && <span>Chave PIX: <code className="bg-[#eef5d2] px-1.5 py-0.5 rounded text-[#576d0f]">{data.pixKey}</code></span>}
            </div>
            <p className="text-[11px] text-[#6e857e]">
              Para clareza e fins de direito, firmo(amos) o presente recibo dando plena, rasa e geral quitação do valor recebido diretamente entre as partes. (A plataforma MeuAutônomo não intermedeia nem retém valores financeiros).
            </p>
          </div>

          <div className="rounded-2xl border border-[#b8dfc7] bg-[#f0f9f3] p-4 text-xs text-[#28564d]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-[#173a34] text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Documento Assinado Eletronicamente
                </div>
                {data.authCode && (
                  <p className="font-mono text-xs font-semibold text-emerald-900">
                    Chave de Autenticação: <span className="bg-white px-2 py-0.5 rounded border border-emerald-300 select-all">{data.authCode}</span>
                  </p>
                )}
                <p className="text-[11px] text-[#527766]">
                  Assinado eletronicamente por <strong>{data.professionalName}</strong> em {dateFormatted}.
                </p>
                <p className="text-[10px] text-[#6b8c7c]">
                  Em conformidade com a Lei Federal nº 14.063/2020 e Art. 320 do Código Civil Brasileiro.
                </p>
                {data.authCode && (
                  <p className="pt-1 text-[11px] text-[#173a34]">
                    Consultar autenticidade:{" "}
                    <a
                      href={validationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-700 underline hover:text-emerald-900"
                    >
                      meuautonomo.creativeam.com.br/validar-recibo
                    </a>
                  </p>
                )}
              </div>

              {data.authCode && (
                <div className="flex flex-col items-center shrink-0 self-center sm:self-auto bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&margin=0&data=${encodeURIComponent(validationUrl)}`}
                    alt="QR Code de Validação"
                    className="h-18 w-18"
                    crossOrigin="anonymous"
                  />
                  <span className="mt-1 text-[9px] font-semibold text-[#527766] uppercase tracking-wider text-center">
                    Escanear p/ validar
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-[#edf1eb] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={copyReceiptText}
            className="rounded-xl border-[#dce5dc] text-xs text-[#38584f]"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5 text-[#71867f]" />
            Copiar Texto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={sendWhatsappReceipt}
            className="rounded-xl border-[#dce5dc] text-xs text-[#28564d] hover:bg-[#f0fdf4]"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" />
            Enviar no WhatsApp
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-[#173a34] text-xs font-semibold text-white hover:bg-[#28564d]"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Imprimir / Salvar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
