import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatBrl } from "@/utils/currency";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Pencil,
  Printer,
  RefreshCcw,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ConfirmModal";

const money = (cents = 0) => formatBrl(cents);

const statusLabel: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  faltou: "Não compareceu",
  nova: "Nova",
  em_analise: "Em análise",
  orcamento_enviado: "Orçamento enviado",
  agendada: "Agendada",
  arquivada: "Arquivada",
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceito: "Aceito",
  recusado: "Recusado",
  alteracao_solicitada: "Alteração solicitada",
};

const statusClass: Record<string, string> = {
  concluido: "bg-[#e3f5e3] text-[#2c7a45]",
  confirmado: "bg-[#e1effa] text-[#23638e]",
  agendado: "bg-[#fff4d7] text-[#906815]",
  nova: "bg-[#eef5c8] text-[#667700]",
  enviado: "bg-[#e8eef8] text-[#496b98]",
  aceito: "bg-[#e3f5e3] text-[#2c7a45]",
  pendente: "bg-[#fff4d7] text-[#906815]",
  pago: "bg-[#e3f5e3] text-[#2c7a45]",
  parcial: "bg-[#e8eef8] text-[#496b98]",
  cancelado: "bg-[#f9e5e3] text-[#9c4d43]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "border-0 font-semibold",
        statusClass[status] || "bg-[#edf2ec] text-[#5d746d]"
      )}
    >
      {statusLabel[status] || status}
    </Badge>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f7f2]">
      <div className="flex items-center gap-3 text-[#58716b]">
        <RefreshCcw className="h-5 w-5 animate-spin" /> Carregando seu espaço.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function PublicQuote({ token }: { token: string }) {
  const query = trpc.quote.getPublic.useQuery({ token });
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [refuseConfirmOpen, setRefuseConfirmOpen] = useState(false);
  const [changeText, setChangeText] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const respond = trpc.quote.respondPublic.useMutation({
    onSuccess: () => {
      query.refetch();
    },
  });

  if (query.isLoading) return <LoadingScreen />;
  if (!query.data)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7f2] text-[#58716b]">
        Orçamento não encontrado.
      </div>
    );

  const { quote, profile, items } = query.data;

  const handleSendChangeRequest = () => {
    if (!changeText.trim())
      return toast.error("Por favor, descreva o que deseja alterar.");
    respond.mutate(
      {
        token,
        action: "alteracao_solicitada",
        changeRequestText: changeText.trim(),
      },
      {
        onSuccess: () => {
          setChangeModalOpen(false);
          setChangeText("");
          toast.success("Solicitação de alteração enviada ao profissional.");
        },
      }
    );
  };

  const handleAcceptQuote = () => {
    if (!clientName.trim()) return toast.error("Informe seu nome completo.");
    if (!clientEmail.trim() || !clientEmail.includes("@"))
      return toast.error("Informe um e-mail válido.");
    respond.mutate(
      {
        token,
        action: "aceito",
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
      },
      {
        onSuccess: () => {
          setAcceptModalOpen(false);
          toast.success("Orçamento aceito com sucesso!");
        },
      }
    );
  };

  const handleRefuseQuote = () => {
    setRefuseConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
          <img
            src="/logo.png"
            alt="MeuAutônomo"
            className="h-12 sm:h-14 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl border-[#dce5dc] bg-white text-xs font-semibold text-[#284b42] hover:bg-[#f0f7f2] shadow-xs"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-[#173a34]" /> Imprimir /
              Salvar PDF
            </Button>
            {typeof navigator !== "undefined" &&
              typeof navigator.share === "function" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator
                      .share({
                        title: `Orçamento #${quote.id} - ${profile?.displayName || "MeuAutônomo"}`,
                        text: `Olá! Aqui está a proposta de orçamento no valor de ${money(quote.totalCents)}:`,
                        url: window.location.href,
                      })
                      .catch(() => {});
                  }}
                  className="rounded-xl border-[#dce5dc] bg-white text-xs font-medium text-[#284b42]"
                >
                  <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> Compartilhar
                </Button>
              )}
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#526d64] border border-[#dce5dc]">
              Proposta Digital
            </span>
          </div>
        </div>

        <Card
          id="printable-quote"
          className="printable-document rounded-[28px] border-0 bg-white shadow-[0_18px_55px_rgba(19,42,39,0.08)]"
        >
          <CardContent className="p-6 sm:p-10">
            {/* Cabeçalho impresso oficial visível apenas na impressão/PDF */}
            <div className="hidden print:flex items-center justify-between pb-6 mb-6 border-b border-[#edf1eb]">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto" />
                <div>
                  <h2 className="text-base font-bold text-[#173a34]">MeuAutônomo</h2>
                  <p className="text-[11px] text-[#71867f]">
                    Plataforma de Gestão Profissional
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8aa500] block">
                  Proposta Oficial
                </span>
                <span className="text-base font-black text-[#173a34]">
                  Orçamento #{quote.id}
                </span>
                <p className="text-[11px] text-[#71867f]">
                  {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-[#edf1eb] pb-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">
                  Proposta de Serviço
                </p>
                <h1 className="mt-2 text-2xl font-bold text-[#173a34]">
                  {profile?.displayName}
                </h1>
                <p className="mt-1 text-sm text-[#82948e]">
                  {profile?.professionName}
                  {profile?.city ? ` · ${profile.city}` : ""}
                </p>
              </div>
              <StatusBadge status={quote.status} />
            </div>

            {quote.description && (
              <div className="mt-6 rounded-2xl bg-[#f5f8f2] p-4 text-sm leading-6 text-[#526d64]">
                <strong className="text-[#284b42] block mb-1">
                  Descrição dos serviços:
                </strong>
                {quote.description}
              </div>
            )}

            <div className="mt-7 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#82948e]">
                Itens orçados
              </p>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f8f2] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#284b42]">{item.description}</p>
                    <p className="mt-1 text-xs text-[#82948e]">
                      {item.quantity} × {money(item.unitPriceCents)}
                    </p>
                  </div>
                  <strong className="text-[#173a34]">
                    {money(item.totalCents)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-[#edf1eb] pt-5 text-sm text-[#71867f]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(quote.subtotalCents)}</span>
              </div>
              {quote.discountCents > 0 && (
                <div className="flex justify-between text-[#8aa500]">
                  <span>Desconto aplicado</span>
                  <span>- {money(quote.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 text-xl font-bold text-[#173a34]">
                <span>Total da proposta</span>
                <span>{money(quote.totalCents)}</span>
              </div>
            </div>

            {/* Condições e Forma de Pagamento */}
            <div className="mt-6 rounded-2xl border border-[#dce5dc] bg-[#f8faf7] p-5">
              <div className="flex items-center gap-2 font-bold text-[#173a34]">
                <CreditCard className="h-5 w-5 text-[#8aa500]" />
                <span>Condições e Forma de Pagamento</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#4c6960] whitespace-pre-wrap font-medium">
                {quote.paymentTerms ||
                  "A combinar diretamente com o profissional (presencialmente na conclusão, máquina de cartão do prestador, dinheiro ou transferência)."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#627a6f]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#8aa500]"></span>
                <span>
                  Pagamento direto ao prestador no local ou conforme acordado. Sem taxas online pela plataforma.
                </span>
              </div>
            </div>

            {quote.notes && (
              <div className="mt-6 rounded-2xl bg-[#fff8e7] p-4 text-sm leading-6 text-[#78673d]">
                <strong>Observações e Garantias</strong>
                <p className="mt-1">{quote.notes}</p>
              </div>
            )}

            {quote.validUntil && (
              <p className="mt-5 text-xs text-[#9aa9a3]">
                Esta proposta é válida até{" "}
                {new Date(quote.validUntil).toLocaleDateString("pt-BR")}.
              </p>
            )}

            {/* Aviso Jurídico de Transparência e Pagamento Direto */}
            <div className="mt-6 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-xs leading-5 text-[#64748b]">
              <div className="flex items-center gap-1.5 font-semibold text-[#334155] mb-1">
                <ShieldCheck className="h-4 w-4 text-[#3b82f6]" />
                <span>
                  Transparência MeuAutônomo: Pagamento 100% Direto ao Profissional
                </span>
              </div>
              <p>
                A plataforma MeuAutônomo é uma ferramenta de tecnologia e gestão para profissionais autônomos.{" "}
                <strong>
                  Nós NÃO cobramos taxas ou comissões sobre os serviços, NÃO intermediamos transações financeiras e NÃO retemos o dinheiro contratado.
                </strong>
              </p>
              <p className="mt-1 text-[#64748b]">
                O valor total ({money(quote.totalCents)}) é pago diretamente ao prestador ({profile?.displayName}), seja presencialmente através da{" "}
                <strong>maquininha de cartão do próprio profissional</strong>, em dinheiro ou transferência bancária/PIX acordada entre as partes.
              </p>
            </div>

            {/* Status e Ações */}
            {quote.status === "aceito" ? (
              <div className="mt-8 rounded-2xl bg-[#e3f3e8] p-6 text-center text-[#284b42]">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#3e885c]" />
                <h3 className="text-xl font-bold text-[#173a34]">
                  Orçamento Aceito com Sucesso!
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#526d64]">
                  {quote.clientName ? `Obrigado, ${quote.clientName}! ` : ""}O
                  profissional {profile?.displayName} já foi notificado da sua
                  aprovação e entrará em contato para combinar a execução e o
                  pagamento direto.
                </p>

                {quote.clientEmail && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-xs text-[#2b5543] border border-[#b8dfc4] shadow-sm">
                    <span className="text-base">📧</span>
                    <span>
                      Cópia da confirmação e resumo da proposta registrados para{" "}
                      <strong>{quote.clientEmail}</strong>.
                    </span>
                  </div>
                )}

                {/* Resumo da Forma de Pagamento Acordada */}
                <div className="mt-6 rounded-2xl border border-[#b8dfc4] bg-white/90 p-4 text-left text-xs leading-5 text-[#2b5543]">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#173a34] mb-1">
                    <CreditCard className="h-4 w-4 text-[#2e6e4a]" />
                    <span>Como será feito o pagamento:</span>
                  </div>
                  <p className="font-medium text-[#173a34]">
                    {quote.paymentTerms ||
                      "A combinar diretamente com o profissional na entrega/conclusão."}
                  </p>
                  <p className="mt-1 text-[#526d64]">
                    Caso o acerto seja via cartão, o profissional levará sua própria máquina. Se for em dinheiro ou transferência, o pagamento é direto ao prestador no momento combinado.
                  </p>
                </div>

                {profile?.pixKey && (
                  <div className="mt-4 rounded-2xl border border-[#b8dfc4] bg-[#f0f9f3] p-5 text-left shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2e6e4a] text-white font-bold text-xs">
                          PIX
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#173a34]">
                            Opção Direta via PIX (Se Combinado)
                          </h4>
                          <p className="text-xs text-[#526d64] break-all">
                            Chave{" "}
                            {profile.pixKeyType
                              ? profile.pixKeyType.toUpperCase()
                              : "PIX"}
                            :{" "}
                            <strong className="font-mono text-xs text-[#173a34] bg-white px-2 py-0.5 rounded border border-[#c5e2ce] break-all">
                              {profile.pixKey}
                            </strong>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(profile.pixKey || "");
                          toast.success(
                            "Chave PIX copiada! Abra o app do seu banco para pagar."
                          );
                        }}
                        className="rounded-xl border-[#2e6e4a] bg-white font-semibold text-xs text-[#2e6e4a] hover:bg-[#e3f3e8]"
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar Chave PIX
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-white/80 px-3.5 py-2 text-xs text-[#38584f]">
                      <span>
                        Valor desta proposta (pago 100% ao profissional):
                      </span>
                      <strong className="text-sm font-bold text-[#173a34]">
                        {money(quote.totalCents)}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-[#c5e2ce] bg-white/70 p-4 text-left no-print">
                  <p className="text-xs font-semibold text-[#284b42]">
                    Precisa do comprovante ou precisa alterar algum item?
                  </p>
                  <p className="mt-1 text-xs text-[#627a6f]">
                    Você pode salvar uma via em PDF, solicitar ajustes ou falar diretamente com {profile?.displayName}.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="rounded-xl border-[#b3d7bf] bg-white text-xs font-semibold text-[#284b42] hover:bg-[#f0f7f2]"
                    >
                      <Printer className="mr-1.5 h-3.5 w-3.5 text-[#173a34]" /> Salvar
                      / Imprimir Comprovante PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeModalOpen(true)}
                      className="rounded-xl border-[#b3d7bf] bg-white text-xs text-[#284b42] hover:bg-[#f0f7f2]"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Solicitar alteração na
                      proposta
                    </Button>
                    {profile?.whatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const phone = profile.whatsapp?.replace(/\D/g, "");
                          const msg = encodeURIComponent(
                            `Olá ${profile.displayName}, sobre o orçamento #${quote.id} que foi aceito: gostaria de tirar uma dúvida/solicitar um ajuste.`
                          );
                          window.open(
                            `https://wa.me/${phone}?text=${msg}`,
                            "_blank"
                          );
                        }}
                        className="rounded-xl border-[#b3d7bf] bg-white text-xs text-[#284b42] hover:bg-[#f0f7f2]"
                      >
                        <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> Falar no
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : quote.status === "alteracao_solicitada" ? (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-950 no-print">
                <Clock3 className="mx-auto mb-3 h-9 w-9 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-900">
                  Alteração Solicitada
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Sua solicitação de ajuste:{" "}
                  <span className="font-semibold italic">
                    "{quote.changeRequest}"
                  </span>
                </p>
                <p className="mt-2 text-xs text-amber-700">
                  O profissional ({profile?.displayName}) está revisando os detalhes e atualizará a proposta em breve aqui neste mesmo link.
                </p>
              </div>
            ) : quote.status === "recusado" ? (
              <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-950 no-print">
                <X className="mx-auto mb-2 h-8 w-8 text-rose-600" />
                <h3 className="text-lg font-bold text-rose-900">
                  Orçamento Recusado
                </h3>
                <p className="mt-1 text-sm text-rose-700">
                  Esta proposta foi marcada como recusada.
                </p>
              </div>
            ) : ["enviado", "rascunho"].includes(quote.status) ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 no-print">
                <Button
                  onClick={() => setAcceptModalOpen(true)}
                  className="h-12 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
                >
                  <Check className="mr-2 h-4 w-4" /> Aceitar orçamento
                </Button>
                <Button
                  onClick={() => setChangeModalOpen(true)}
                  variant="outline"
                  className="h-12 rounded-xl border-[#dce5dc] bg-white text-[#4c6960] hover:bg-[#f5f8f2]"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Solicitar alteração
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-11 rounded-xl border-[#dce5dc] bg-white text-xs font-semibold text-[#284b42] hover:bg-[#f5f8f2] sm:col-span-2"
                >
                  <Printer className="mr-1.5 h-4 w-4 text-[#173a34]" /> Imprimir /
                  Salvar Proposta em PDF
                </Button>
                <Button
                  onClick={handleRefuseQuote}
                  variant="ghost"
                  className="h-10 text-xs text-[#9c4d43] sm:col-span-2"
                >
                  Recusar proposta
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Modal: Solicitar alteração */}
        <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg text-[#173a34]">
                Solicitar alteração no orçamento
              </DialogTitle>
              <DialogDescription>
                Informe a {profile?.displayName} o que você precisa ajustar (itens, valores, formas de pagamento ou data).
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <Label className="mb-2 block font-semibold text-[#284b42]">
                O que você gostaria de alterar?
              </Label>
              <Textarea
                rows={4}
                value={changeText}
                onChange={(e) => setChangeText(e.target.value)}
                placeholder="Ex.: Gostaria de parcelar em 3x sem juros, retirar o item 2 ou agendar para a próxima semana..."
                className="rounded-xl border-[#dce5dc]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setChangeModalOpen(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendChangeRequest}
                disabled={respond.isPending}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
              >
                Enviar solicitação ao profissional
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Aceitar orçamento com Nome e E-mail */}
        <Dialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg text-[#173a34]">
                Confirmar aceite da proposta
              </DialogTitle>
              <DialogDescription>
                Informe seus dados para formalizar a aceitação e registrar o comprovante da proposta junto a {profile?.displayName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <Field
                label="Seu nome completo"
                value={clientName}
                onChange={setClientName}
                placeholder="Ex.: Maria Souza"
              />
              <Field
                label="Seu e-mail (para receber o comprovante)"
                value={clientEmail}
                onChange={setClientEmail}
                placeholder="exemplo@email.com"
              />
              <div className="rounded-xl bg-[#f5f8f2] p-3.5 text-xs leading-5 text-[#526d64] border border-[#dce5dc]">
                <ShieldCheck className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />
                Ao confirmar o aceite, você aprova os itens e valores desta proposta. Uma via do comprovante será registrada para o seu e-mail ({clientEmail || "seu e-mail"}). O pagamento deste serviço será realizado diretamente com o profissional de acordo com as condições combinadas.
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setAcceptModalOpen(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAcceptQuote}
                disabled={respond.isPending}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
              >
                <Check className="mr-2 h-4 w-4" /> Confirmar e Aceitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Recusar orçamento */}
        <ConfirmModal
          open={refuseConfirmOpen}
          onOpenChange={setRefuseConfirmOpen}
          title="Recusar proposta de orçamento?"
          description={`Ao recusar, o profissional (${profile?.displayName}) será notificado. Se preferir fazer um ajuste em vez de recusar totalmente, você pode usar a opção 'Solicitar alteração'.`}
          confirmLabel="Sim, recusar proposta"
          variant="danger"
          onConfirm={() => {
            setRefuseConfirmOpen(false);
            respond.mutate(
              { token, action: "recusado" },
              {
                onSuccess: () => toast.info("Orçamento marcado como recusado."),
              }
            );
          }}
        />

        <p className="mt-6 text-center text-xs text-[#9aa9a3]">
          Enviado por {profile?.displayName} através da plataforma MeuAutônomo.
        </p>
      </div>
    </div>
  );
}
export default PublicQuote;
