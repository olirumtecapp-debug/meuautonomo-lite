import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, ShieldAlert, Search, Printer, ArrowLeft, CheckCircle2, User, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ValidateReceiptPage({ codeFromRoute }: { codeFromRoute?: string }) {
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  const getUrlCode = () => {
    if (codeFromRoute) return codeFromRoute.trim().toUpperCase().replace(/\s+/g, "");
    const searchToUse = typeof window !== "undefined" ? window.location.search : searchString;
    const params = new URLSearchParams(searchToUse.replace(/^\?/, ""));
    return (params.get("codigo") || params.get("code") || "").trim().toUpperCase().replace(/\s+/g, "");
  };

  const initialCode = getUrlCode();
  const [inputCode, setInputCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);

  useEffect(() => {
    const code = getUrlCode();
    if (code && code !== activeCode) {
      setInputCode(code);
      setActiveCode(code);
    }
  }, [searchString, codeFromRoute]);

  const query = trpc.receipt.validate.useQuery(
    { code: activeCode },
    {
      enabled: Boolean(activeCode.trim().length >= 1),
      retry: false,
    }
  );

  // Auto-print se ?print=true estiver na URL
  useEffect(() => {
    if (query.data?.valid && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "true") {
        const timer = setTimeout(() => {
          window.print();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [query.data]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim().toUpperCase().replace(/\s+/g, "");
    if (!clean) {
      toast.error("Por favor, digite o código do recibo para consultar.");
      return;
    }
    setActiveCode(clean);
    query.refetch().then(res => {
      if (res.data?.valid) {
        toast.success("Recibo localizado e autenticado com sucesso!");
      } else {
        toast.error(res.data?.error || "Código de recibo não localizado.");
      }
    });
  };

  const money = (cents = 0) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isInvalid = !query.isFetching && Boolean(activeCode) && (query.isError || query.data?.valid === false);
  const errorMessage = query.error?.message || (query.data && !query.data.valid ? query.data.error : null) || "Código não reconhecido ou divergente.";

  return (
    <div className="min-h-screen bg-[#f5f8f3] text-[#173a34]">
      {/* Topo / Navbar (oculto no print) */}
      <header className="border-b border-[#e2ece0] bg-white no-print">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] font-black text-lg">
              M
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-[#173a34] text-lg">MeuAutônomo</span>
              <p className="text-[10px] text-[#71867f] uppercase font-bold tracking-wider">Validador Oficial</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-xs text-[#526d64] hover:text-[#173a34]"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Página Inicial
          </Button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="text-center mb-8 no-print">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Certificação Pública de Autenticidade
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#173a34]">
            Consulta Pública de Recibos
          </h1>
          <p className="mt-2 text-sm text-[#668076] max-w-lg mx-auto">
            Verifique a autenticidade e validade jurídica de comprovantes de quitação emitidos pela plataforma MeuAutônomo.
          </p>
        </div>

        {/* Campo de Busca do Código (oculto no print) */}
        <Card className="rounded-[24px] border border-[#dce5dc] bg-white shadow-sm mb-6 no-print">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8ca097]" />
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Ex.: MA-REC-A30001-A79B ou REC-30001"
                  className="h-12 pl-10 rounded-xl border-[#dce5dc] font-mono text-sm tracking-wider uppercase"
                />
              </div>
              <Button
                type="submit"
                disabled={query.isFetching || !inputCode.trim()}
                className="h-12 rounded-xl bg-[#173a34] px-6 text-sm font-semibold text-white hover:bg-[#28564d]"
              >
                {query.isFetching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Consultando...
                  </span>
                ) : (
                  "Verificar Recibo"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading Spinner */}
        {query.isFetching && (
          <div className="rounded-[24px] border border-[#dce5dc] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#173a34] border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-[#173a34]">Validando chave de autenticidade no banco oficial...</p>
          </div>
        )}

        {/* Resultado: VÁLIDO */}
        {!query.isFetching && activeCode && query.data?.valid && (
          <Card id="printable-receipt" className="rounded-[24px] border-2 border-emerald-500 bg-white shadow-lg overflow-hidden">
            {/* Header de Validação Positiva */}
            <div className="bg-emerald-600 px-6 py-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-white">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Recibo Autêntico e Válido</h2>
                    <p className="text-xs text-white/85 font-medium">
                      Chave verificada com sucesso na base de dados oficial MeuAutônomo
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/20 px-3.5 py-1.5 text-right font-mono text-xs font-bold self-start sm:self-auto border border-white/30">
                  {query.data.code}
                </div>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Resumo do Documento */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#668076] uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-[#173a34]" /> Prestador / Emissor
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#173a34]">{query.data.professionalName}</h3>
                  <p className="text-xs text-[#668076] font-medium">{query.data.profession}</p>
                  {query.data.professionalCity && (
                    <p className="mt-1 text-xs text-[#82948e]">{query.data.professionalCity}</p>
                  )}
                  {query.data.professionalPhone && (
                    <p className="text-xs text-[#82948e]">Tel: {query.data.professionalPhone}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#668076] uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-[#173a34]" /> Cliente / Tomador
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#173a34]">{query.data.clientName}</h3>
                  <p className="text-xs text-[#82948e] mt-1">Beneficiário e pagador dos serviços descritos</p>
                </div>
              </div>

              {/* Detalhes do Serviço e Pagamento */}
              <div className="rounded-2xl border border-[#dce5dc] bg-[#f7faf5] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2ece0] pb-3">
                  <span className="text-xs font-semibold text-[#668076]">Número do Documento:</span>
                  <strong className="font-mono text-sm text-[#173a34]">{query.data.receiptNumber}</strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2ece0] pb-3">
                  <span className="text-xs font-semibold text-[#668076]">Serviço Realizado:</span>
                  <strong className="text-sm text-[#173a34]">{query.data.serviceDescription}</strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2ece0] pb-3">
                  <span className="text-xs font-semibold text-[#668076]">Valor Total Quitado:</span>
                  <strong className="text-2xl font-black text-emerald-800">{money(query.data.amountCents)}</strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2ece0] pb-3">
                  <span className="text-xs font-semibold text-[#668076]">Forma de Pagamento:</span>
                  <span className="text-xs font-bold text-[#28564d] bg-white px-2.5 py-1 rounded-lg border border-[#dce5dc]">
                    {query.data.paymentMethod}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2ece0] pb-3">
                  <span className="text-xs font-semibold text-[#668076]">Situação Financeira:</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                    <Check className="h-3.5 w-3.5" /> {query.data.paymentStatus}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs font-semibold text-[#668076]">Data da Prestação / Emissão:</span>
                  <strong className="text-xs text-[#173a34]">{formatDate(query.data.date)}</strong>
                </div>
              </div>

              {/* Respaldo Legal */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-[#28564d] leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Eficácia Jurídica e Quitação
                </div>
                <p>
                  Este recibo foi emitido eletronicamente pela plataforma MeuAutônomo pelo prestador devidamente autenticado.
                  Possui plena validade jurídica como prova legal de quitação financeira nos termos da <strong>Lei Federal nº 14.063/2020</strong> (Marco Legal das Assinaturas Eletrônicas) e do <strong>Artigo 320 do Código Civil Brasileiro</strong>.
                </p>
              </div>

              {/* Botões de Ação (ocultos no print) */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 no-print">
                <Button
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#173a34] px-5 text-xs font-semibold text-white hover:bg-[#28564d]"
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimir / Salvar em PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado: INVÁLIDO */}
        {isInvalid && (
          <Card className="rounded-[24px] border-2 border-red-300 bg-white shadow-sm p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-red-950">Código Não Localizado ou Divergente</h2>
            <p className="mt-2 text-sm text-[#7f4a43] max-w-md mx-auto leading-relaxed">
              {errorMessage}
            </p>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 max-w-md mx-auto text-left leading-relaxed">
              <p className="font-semibold mb-1">Orientações para consulta:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Você pode digitar tanto o código completo (ex: <code>MA-REC-A30001-XXXXXX</code>) quanto o número do recibo (ex: <code>REC-30001</code> ou apenas <code>30001</code>).</li>
                <li>Verifique se não houve digitação incorreta de letras ou números.</li>
                <li>Se o documento impresso foi adulterado em valor ou data, o código de autenticidade será recusado.</li>
              </ul>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
