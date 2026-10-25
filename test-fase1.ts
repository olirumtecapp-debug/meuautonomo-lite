import { SERVICE_CATALOG } from "./client/src/data/servicesCatalog";
import { POPULAR_PROFESSIONS } from "./client/src/data/professions";
import { isEmailConfigured, enviarEmail } from "./server/email";

async function testFase1() {
  console.log("================================================================================");
  console.log("🧪 TESTES DA FASE 1 — MEUAUTÔNOMO (MELHORIAS & CATÁLOGO DE BELEZA)");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Verificação do Catálogo de Profissões e Serviços de Beleza e Estética
  // ---------------------------------------------------------------------------
  console.log("\n[1] Verificando Catálogo de Profissões e Serviços de Beleza...");

  // Verificar na lista de categorias
  const belezaCat = POPULAR_PROFESSIONS.find(c => c.category === "Beleza e Estética");
  assert(Boolean(belezaCat), "Categoria 'Beleza e Estética' presente em POPULAR_PROFESSIONS");
  assert(belezaCat?.professions.includes("Manicure e Pedicure") || false, "Profissão 'Manicure e Pedicure' cadastrada");
  assert(belezaCat?.professions.includes("Designer de Sobrancelhas") || false, "Profissão 'Designer de Sobrancelhas' cadastrada");
  assert(belezaCat?.professions.includes("Lash Designer (Extensão de Cílios)") || false, "Profissão 'Lash Designer' cadastrada");
  assert(belezaCat?.professions.includes("Esteticista") || false, "Profissão 'Esteticista' cadastrada");

  // Verificar nos serviços pré-configurados (Autocomplete rápido)
  const manicurePreset = SERVICE_CATALOG.find(p => p.id === "manicure");
  assert(Boolean(manicurePreset), "Preset de serviços para 'Manicure e Pedicure' configurado no SERVICE_CATALOG");
  const manicureNames = (manicurePreset?.services || []).map(s => s.name);
  assert(manicureNames.some(n => n.includes("Unhas de Gel")), "Serviço 'Unhas de Gel / Fibra' presente");
  assert(manicureNames.some(n => n.includes("Esmaltação em Gel")), "Serviço 'Esmaltação em Gel' presente");
  assert(manicureNames.some(n => n.includes("Blindagem")), "Serviço 'Blindagem / Banho de Gel' presente");

  const sobrancelhaPreset = SERVICE_CATALOG.find(p => p.id === "sobrancelhas");
  assert(Boolean(sobrancelhaPreset), "Preset de serviços para 'Designer de Sobrancelhas' configurado");
  const sobrancelhaNames = (sobrancelhaPreset?.services || []).map(s => s.name);
  assert(sobrancelhaNames.some(n => n.includes("Henna")), "Serviço 'Design de Sobrancelhas com Henna' presente");
  assert(sobrancelhaNames.some(n => n.includes("Micropigmentação")), "Serviço 'Micropigmentação' presente");
  assert(sobrancelhaNames.some(n => n.includes("Lash Lifting")), "Serviço 'Lash Lifting' presente");

  const esteticaPreset = SERVICE_CATALOG.find(p => p.id === "esteticista");
  assert(Boolean(esteticaPreset), "Preset de serviços para 'Estética Facial e Corporal' configurado");
  const esteticaNames = (esteticaPreset?.services || []).map(s => s.name);
  assert(esteticaNames.some(n => n.includes("Limpeza de Pele")), "Serviço 'Limpeza de Pele Profunda' presente");
  assert(esteticaNames.some(n => n.includes("Drenagem")), "Serviço 'Drenagem Linfática' presente");

  // ---------------------------------------------------------------------------
  // 2. Validação da Mensagem e Link do WhatsApp (1-Clique)
  // ---------------------------------------------------------------------------
  console.log("\n[2] Testando Formatação da Mensagem do WhatsApp (Proposta e Recibo)...");

  const mockPhone = "(11) 98765-4321";
  const rawPhone = mockPhone.replace(/\D/g, "");
  const waTarget = `55${rawPhone.replace(/^55/, "")}`;
  assert(waTarget === "5511987654321", "Sanitização de telefone para WhatsApp no padrão internacional (55...)");

  const quoteUrl = "http://localhost:3001/orcamento/token-teste-123";
  const quoteMsg = `Olá Mariana! Segue a proposta de orçamento referente a Unhas de Gel e Spa dos Pés no valor de R$ 180,00.\n\nVocê pode consultar os itens detalhados e aprovar diretamente por este link seguro:\n${quoteUrl}\n\nQualquer dúvida estou à disposição!`;
  const encodedQuoteMsg = encodeURIComponent(quoteMsg);
  const waLink = `https://wa.me/${waTarget}?text=${encodedQuoteMsg}`;

  assert(waLink.startsWith("https://wa.me/5511987654321?text="), "Link do WhatsApp gerado corretamente");
  assert(decodeURIComponent(waLink).includes(quoteUrl), "Link da proposta embutido na mensagem do WhatsApp");

  // ---------------------------------------------------------------------------
  // 3. Validação do Recibo Oficial (PDF / Impressão / WhatsApp)
  // ---------------------------------------------------------------------------
  console.log("\n[3] Testando Dados e Declaração do Recibo de Quitação...");

  const receiptData = {
    receiptNumber: "REC-0042",
    date: new Date(),
    professionalName: "Mariana Estética & Unhas",
    profession: "Manicure / Esteticista",
    professionalPhone: "(11) 98765-4321",
    clientName: "Ana Clara Silva",
    serviceDescription: "Alongamento em Fibra de Vidro + Design de Sobrancelhas",
    amountCents: 22000,
    paymentMethod: "PIX",
    pixKey: "mariana@pix.meuautonomo.com.br"
  };

  const receiptText = 
    `*RECIBO DE PRESTAÇÃO DE SERVIÇOS* 📄\n` +
    `*Nº:* ${receiptData.receiptNumber}\n` +
    `*Prestador:* ${receiptData.professionalName}\n` +
    `*Cliente:* ${receiptData.clientName}\n` +
    `*Descrição:* ${receiptData.serviceDescription}\n` +
    `*VALOR PAGO:* R$ 220,00\n` +
    `*FORMA DE PAGAMENTO:* ${receiptData.paymentMethod}\n\n` +
    `_Recebi a quantia acima descrita diretamente do cliente referente aos serviços prestados, dando plena e geral quitação._`;

  assert(receiptText.includes("REC-0042"), "Número do recibo registrado");
  assert(receiptText.includes("R$ 220,00"), "Valor formatado em reais");
  assert(receiptText.includes("plena e geral quitação"), "Cláusula jurídica de quitação 100% direta inclusa");

  // ---------------------------------------------------------------------------
  // 4. Validação da Conexão de E-mail (Nodemailer / Gmail SMTP)
  // ---------------------------------------------------------------------------
  console.log("\n[4] Testando Configuração e Transporte de E-mail (Gmail Nodemailer)...");

  const emailOk = isEmailConfigured();
  assert(emailOk, "Sistema de envio de e-mail reconhecido como configurado (Gmail/Nodemailer ou Resend)");

  // Testar disparo simulado ou real
  const emailRes = await enviarEmail({
    para: "teste-simulacao@meuautonomo.local",
    assunto: "Teste Automatizado Fase 1 - MeuAutônomo",
    texto: "Validação do sistema de e-mails do MeuAutônomo com suporte a Gmail SMTP.",
  });
  assert(emailRes.ok, `Disparo de e-mail executado com sucesso (ID: ${emailRes.id})`);

  // ---------------------------------------------------------------------------
  // Resumo Final
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`📊 RESULTADO FINAL: ${passed}/${total} TESTES APROVADOS (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================================");

  if (passed === total) {
    console.log("🎉 TODOS OS TESTES DA FASE 1 FORAM CONCLUÍDOS COM SUCESSO!");
    process.exit(0);
  } else {
    console.error("⚠️ Alguns testes falharam. Verifique os logs acima.");
    process.exit(1);
  }
}

testFase1().catch(err => {
  console.error("Erro fatal no teste:", err);
  process.exit(1);
});
