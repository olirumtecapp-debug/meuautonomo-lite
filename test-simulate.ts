import axios from "axios";
import superjson from "superjson";

const BASE_URL = "http://localhost:3001";

function wrapInput(obj: any) {
  return { json: obj };
}

function queryInput(obj: any) {
  return encodeURIComponent(JSON.stringify({ json: obj }));
}

function unwrap(res: any) {
  const d = res.data?.result?.data;
  return d?.json !== undefined ? d.json : d;
}

async function runSimulation() {
  console.log("================================================================================");
  console.log("🚀 SIMULAÇÃO DO FLUXO COMPLETO DO MEUAUTÔNOMO");
  console.log("================================================================================");

  const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  // 1. Testar se o servidor e a página inicial estão online
  console.log("\n[Passo 1] Testando conectividade do servidor HTTP...");
  const homeRes = await client.get("/");
  console.log(`✅ Servidor online! Status HTTP: ${homeRes.status} (Length: ${homeRes.data.length} bytes)`);

  // 2. Login de teste no MeuAutônomo (quickLogin)
  console.log("\n[Passo 2] Autenticando profissional no sistema via quickLogin...");
  const loginRes = await client.post("/api/trpc/auth.quickLogin", wrapInput({ openId: "dev-user-local" }));
  const loginData = unwrap(loginRes);
  console.log(`✅ Login bem-sucedido! Usuário: "${loginData?.user?.name}" (Role: ${loginData?.user?.role})`);

  // Extrair cookie de sessão
  const setCookie = loginRes.headers["set-cookie"];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(";")[0]).join("; ") : "";
  console.log(`🔑 Cookie de Sessão capturado: ${cookieHeader ? "OK" : "Vazio"}`);

  const authHeaders = {
    Cookie: cookieHeader,
  };

  // 3. Obter Perfil do Profissional
  console.log("\n[Passo 3] Consultando perfil do profissional autenticado...");
  const profileRes = await client.get("/api/trpc/profile.get", { headers: authHeaders });
  const profile = unwrap(profileRes);
  console.log(`✅ Perfil: ID ${profile?.id} | Nome: "${profile?.displayName}" | Slug: "${profile?.slug}" | Cidade: "${profile?.city}"`);

  // 4. Listar ou cadastrar serviços do profissional
  console.log("\n[Passo 4] Verificando catálogo de serviços...");
  const servicesRes = await client.get("/api/trpc/service.list", { headers: authHeaders });
  let services = unwrap(servicesRes) || [];
  console.log(`📦 Serviços cadastrados: ${services.length}`);

  let testService = services[0];
  if (!testService) {
    console.log("➕ Cadastrando serviço de teste...");
    const createServiceRes = await client.post("/api/trpc/service.create", wrapInput({
      name: "Instalação Elétrica Completa",
      description: "Instalação de tomadas, interruptores, fiação e quadro de distribuição.",
      durationMinutes: 120,
      priceCents: 45000, // R$ 450,00
      modality: "endereco",
      isActive: true,
    }), { headers: authHeaders });
    testService = unwrap(createServiceRes);
    console.log("✅ Serviço criado com sucesso:", testService);
  } else {
    console.log(`✅ Usando serviço existente: "${testService.name}" (R$ ${(testService.priceCents / 100).toFixed(2)})`);
  }

  // 5. Simular Cliente Acessando Perfil Público e Solicitando Orçamento
  console.log(`\n[Passo 5] Simulação: Cliente acessa link público do profissional (/p/${profile.slug})...`);
  const publicProfileRes = await client.get(`/api/trpc/publicProfile.bySlug?input=${queryInput({ slug: profile.slug })}`);
  const pubProfile = unwrap(publicProfileRes);
  console.log(`✅ Perfil público visualizado: "${pubProfile?.profile?.displayName}" - "${pubProfile?.profile?.bio}"`);

  console.log("📝 Cliente envia solicitação de orçamento...");
  const publicReqRes = await client.post("/api/trpc/request.createPublic", wrapInput({
    slug: profile.slug,
    requesterName: "Mariana Souza Teste",
    requesterPhone: "11987654321",
    requesterEmail: "contatocreativeam@gmail.com",
    serviceId: testService.id,
    description: "Preciso trocar o cabeamento do chuveiro e instalar 4 tomadas adicionais no escritório.",
    address: "Rua das Flores, 123 - Apto 42",
    attachments: [],
  }));
  const createdRequest = unwrap(publicReqRes);
  console.log("✅ Solicitação pública enviada com sucesso! Resposta:", createdRequest);

  // 6. Profissional visualiza a solicitação e cria o Orçamento formal
  console.log("\n[Passo 6] Profissional analisa solicitação e gera Proposta/Orçamento...");
  const quoteRes = await client.post("/api/trpc/quote.create", wrapInput({
    serviceId: testService.id,
    description: "Proposta técnica para reforma elétrica do chuveiro e instalação de tomadas.",
    notes: "Materiais elétricos certificados com 90 dias de garantia na mão de obra.",
    paymentTerms: "50% de entrada na aprovação e 50% após conclusão e teste dos circuitos.",
    discountCents: 5000, // R$ 50,00 de desconto
    sendNow: true,
    items: [
      {
        description: "Mão de obra: Substituição de fiação chuveiro 10mm² + disjuntor bipolar",
        quantity: 1,
        unitPriceCents: 25000, // R$ 250,00
      },
      {
        description: "Instalação e fixação de 4 tomadas 20A no escritório",
        quantity: 4,
        unitPriceCents: 5000, // R$ 50,00 cada = R$ 200,00
      },
    ],
  }), { headers: authHeaders });

  const quoteData = unwrap(quoteRes);
  console.log(`✅ Orçamento criado! ID: ${quoteData?.quoteId} | Token Seguro: ${quoteData?.token}`);
  const publicQuoteUrl = `${BASE_URL}/orcamento/${quoteData?.token}`;
  console.log(`🔗 Link que o autônomo envia no WhatsApp do cliente: ${publicQuoteUrl}`);

  // 7. Simular o Cliente Abrindo a Proposta e Clicando em APROVAR
  console.log("\n[Passo 7] Cliente abre o link do orçamento e avalia a proposta...");
  const publicQuoteRes = await client.get(`/api/trpc/quote.getPublic?input=${queryInput({ token: quoteData.token })}`);
  const publicQuote = unwrap(publicQuoteRes);
  console.log(`📄 Proposta carregada pelo cliente:`);
  console.log(`   - Profissional: ${publicQuote.profile.displayName}`);
  console.log(`   - Subtotal: R$ ${(publicQuote.quote.subtotalCents / 100).toFixed(2)}`);
  console.log(`   - Desconto: R$ ${(publicQuote.quote.discountCents / 100).toFixed(2)}`);
  console.log(`   - Total Final: R$ ${(publicQuote.quote.totalCents / 100).toFixed(2)}`);
  console.log(`   - Condições: ${publicQuote.quote.paymentTerms}`);

  console.log("\n👍 Cliente clica em 'Aceitar Proposta' e confirma...");
  const approveRes = await client.post("/api/trpc/quote.respondPublic", wrapInput({
    token: quoteData.token,
    action: "aceito",
    clientName: "Mariana Souza Teste",
    clientEmail: "contatocreativeam@gmail.com",
  }));
  console.log("✅ Proposta aceita pelo cliente! Resposta da API:", unwrap(approveRes));

  // 8. Verificar se o status atualizou e se o profissional recebeu a notificação
  console.log("\n[Passo 8] Verificando notificações do profissional e status do orçamento...");
  const notifRes = await client.get("/api/trpc/notification.list", { headers: authHeaders });
  const notifs = unwrap(notifRes) || [];
  console.log(`🔔 Total de notificações: ${notifs.length}`);
  if (notifs.length > 0) {
    console.log(`   Última notificação: "${notifs[0].title}" - ${notifs[0].content}`);
  }

  // 9. Agendamento do Serviço no "Meu Dia" / Agenda
  console.log("\n[Passo 9] Agendando o atendimento aprovado na agenda (próxima segunda-feira às 10h)...");
  // Buscar agendamentos existentes para escolher um dia/horário 100% livre
  const apptsRes = await client.get("/api/trpc/appointment.list", { headers: authHeaders });
  const existingAppts = unwrap(apptsRes) || [];

  let candidateDate = new Date();
  candidateDate.setDate(candidateDate.getDate() + 3);
  // Garantir que caia em dia útil (segunda a sexta) às 10h
  while ([0, 6].includes(candidateDate.getDay())) {
    candidateDate.setDate(candidateDate.getDate() + 1);
  }
  candidateDate.setHours(10, 0, 0, 0);

  // Se já tiver agendamento nesse dia/horário, avançar dias
  while (existingAppts.some((a: any) => Math.abs(new Date(a.startsAt).getTime() - candidateDate.getTime()) < 3600000)) {
    candidateDate.setDate(candidateDate.getDate() + 1);
    while ([0, 6].includes(candidateDate.getDay())) {
      candidateDate.setDate(candidateDate.getDate() + 1);
    }
  }

  const appointmentRes = await client.post("/api/trpc/appointment.create", wrapInput({
    startsAt: candidateDate.toISOString(),
    durationMinutes: 60,
    amountCents: publicQuote.quote.totalCents,
    location: "Rua das Flores, 123 - Apto 42",
    notes: "Levar escada e fita passa-fio",
  }), { headers: authHeaders });
  console.log("✅ Atendimento agendado com sucesso:", unwrap(appointmentRes));

  // 10. Lançamento Financeiro (Recebimento de pagamento e despesa com materiais)
  console.log("\n[Passo 10] Registrando pagamento do cliente e despesa operacional de materiais...");
  const paymentRes = await client.post("/api/trpc/payment.create", wrapInput({
    amountCents: 40000, // R$ 400,00
    method: "pix",
    status: "pago",
    notes: "Pagamento de 100% recebido via PIX pelo cliente Mariana",
  }), { headers: authHeaders });
  console.log("✅ Pagamento registrado no financeiro:", unwrap(paymentRes));

  const expenseRes = await client.post("/api/trpc/expense.create", wrapInput({
    description: "Compra de cabos 10mm² e módulos de tomada na loja elétrica",
    amountCents: 12500, // R$ 125,00
    category: "Materiais",
    date: new Date().toISOString(),
  }), { headers: authHeaders });
  console.log("✅ Despesa operacional registrada:", unwrap(expenseRes));

  // 11. Relatório Financeiro e Painel Consolidado
  console.log("\n[Passo 11] Consultando Painel do Dashboard e Resumo Financeiro...");
  const futureQuery = new Date(Date.now() + 60000).toISOString();
  const dashRes = await client.get(`/api/trpc/dashboard.summary?input=${queryInput({ to: futureQuery })}`, { headers: authHeaders });
  const dashData = unwrap(dashRes);
  console.log("📊 Resumo do Dashboard Financeiro:");
  console.log(`   - Recebido este mês: R$ ${((dashData?.received || 0) / 100).toFixed(2)}`);
  console.log(`   - A receber (pendente): R$ ${((dashData?.pending || 0) / 100).toFixed(2)}`);
  console.log(`   - Despesas operacionais: R$ ${((dashData?.expensesCents || 0) / 100).toFixed(2)}`);
  console.log(`   - Saldo Líquido do mês: R$ ${(((dashData?.received || 0) - (dashData?.expensesCents || 0)) / 100).toFixed(2)}`);
  console.log(`   - Pedidos pendentes: ${dashData?.recentRequests?.length || 0}`);
  console.log(`   - Propostas pendentes: ${dashData?.pendingQuotes?.length || 0}`);

  console.log("\n================================================================================");
  console.log("🎉 SIMULAÇÃO CONCLUÍDA COM 100% DE SUCESSO!");
  console.log("================================================================================");
}

runSimulation().catch(err => {
  console.error("❌ Erro na simulação:", err.response?.data || err.message);
});
