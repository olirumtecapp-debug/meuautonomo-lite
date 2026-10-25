// test-fase2.ts — Testes Automatizados para o Módulo de Equipe & Parceiros (Salão-Parceiro)
import { appRouter } from "./server/routers";
import { getDb, createCleanStore, mockDb } from "./server/mockDb";

async function runPhase2Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO TESTES DO MÓDULO EQUIPE & PARCEIROS (FASE 2)");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Setup do contexto de teste simulando a proprietária do estúdio de estética
  const uniqueId = Math.floor(Date.now() / 1000);
  const testUser = {
    id: uniqueId,
    email: `estudio.${uniqueId}@exemplo.com`,
    name: "Juliana Silva - Studio de Beleza",
    role: "user"
  };

  const caller = appRouter.createCaller({
    user: testUser as any,
    req: {} as any,
    res: {} as any
  });

  // Criar / atualizar perfil do estúdio
  await caller.profile.upsert({
    displayName: "Studio Juliana Beleza & Estética",
    slug: "studio-juliana",
    professionCategory: "beleza_estetica",
    professionName: "Estúdio de Beleza & Salão",
    phone: "11988887777",
    whatsapp: "11988887777",
    city: "São Paulo - SP",
    pixKey: "11988887777",
    pixKeyType: "telefone"
  });

  // Criar serviços do estúdio
  const service1 = await caller.service.create({
    name: "Alongamento em Fibra de Vidro",
    description: "Alongamento completo com acabamento fino e esmaltação",
    durationMinutes: 120,
    priceCents: 18000, // R$ 180,00
    modality: "presencial"
  });

  const service2 = await caller.service.create({
    name: "Design de Sobrancelhas com Henna",
    description: "Mapeamento facial e aplicação de henna de alta fixação",
    durationMinutes: 45,
    priceCents: 8000, // R$ 80,00
    modality: "presencial"
  });

  // Criar clientes
  const client1 = await caller.customer.create({
    name: "Fernanda Costa",
    phone: "11977776666",
    whatsapp: "11977776666"
  });

  const client2 = await caller.customer.create({
    name: "Mariana Alcantara",
    phone: "11966665555",
    whatsapp: "11966665555"
  });

  console.log("--- 1. Cadastro de Profissionais Parceiros ---");
  // Cadastrar Parceira 1: Camila (Nail Designer, 50% de comissão)
  const partner1 = await caller.team.create({
    name: "Camila Rocha",
    role: "Manicure & Nail Designer",
    phone: "11911112222",
    email: "camila.nails@exemplo.com",
    commissionPercent: 50,
    pixKey: "11911112222",
    pixKeyType: "telefone",
    color: "#e11d48",
    notes: "Atende terças, quintas e sábados."
  });

  assert(partner1.success && partner1.id > 0, "Profissional parceira 1 (Camila) cadastrada com ID válido.");

  // Cadastrar Parceira 2: Letícia (Designer de Sobrancelhas, 60% de comissão)
  const partner2 = await caller.team.create({
    name: "Letícia Miranda",
    role: "Designer de Sobrancelhas & Micropigmentadora",
    phone: "11933334444",
    email: "leticia.brows@exemplo.com",
    commissionPercent: 60,
    pixKey: "leticia.brows@exemplo.com",
    pixKeyType: "email",
    color: "#8b5cf6",
    notes: "Atende segundas, quartas e sextas."
  });

  assert(partner2.success && partner2.id > 0, "Profissional parceira 2 (Letícia) cadastrada com ID válido.");

  // Listar parceiros
  const teamList = await caller.team.list();
  assert(teamList.length >= 2, `Lista de parceiros retornou ${teamList.length} membros.`);
  assert(teamList.some(m => m.name === "Camila Rocha" && m.commissionPercent === 50), "Dados da parceira Camila conferem (50%).");
  assert(teamList.some(m => m.name === "Letícia Miranda" && m.commissionPercent === 60), "Dados da parceira Letícia conferem (60%).");

  console.log("\n--- 2. Agendamentos Concorrentes / Simultâneos (Multi-Profissionais) ---");
  const appointmentTime = new Date();
  appointmentTime.setDate(appointmentTime.getDate() + 1);
  appointmentTime.setHours(14, 0, 0, 0); // Amanhã às 14:00

  // Atendimento 1 com Camila às 14h
  const appt1 = await caller.appointment.create({
    clientId: client1.id,
    serviceId: service1.id,
    teamMemberId: partner1.id,
    startsAt: appointmentTime.toISOString(),
    durationMinutes: 60,
    amountCents: 18000,
    status: "agendado",
    paymentStatus: "pendente"
  });
  assert(appt1.success && appt1.id > 0, "Agendamento da Camila criado com sucesso para amanhã às 14h.");

  // Atendimento 2 com Letícia NO MESMO HORÁRIO (14h) — deve ser permitido no mesmo salão!
  let concurrentAllowed = false;
  try {
    const appt2 = await caller.appointment.create({
      clientId: client2.id,
      serviceId: service2.id,
      teamMemberId: partner2.id,
      startsAt: appointmentTime.toISOString(), // MESMO HORÁRIO!
      durationMinutes: 45,
      amountCents: 8000,
      status: "agendado",
      paymentStatus: "pendente"
    });
    concurrentAllowed = appt2.success;
  } catch (err: any) {
    console.error("Erro inesperado no agendamento simultâneo:", err.message);
  }
  assert(concurrentAllowed, "Agendamento simultâneo no mesmo horário para profissional diferente foi PERMITIDO com sucesso.");

  // Tentativa de agendar Camila NOVAMENTE às 14h (deve dar conflito pois é a mesma pessoa)
  let sameMemberConflictDetected = false;
  try {
    await caller.appointment.create({
      clientId: client2.id,
      serviceId: service1.id,
      teamMemberId: partner1.id, // Camila novamente às 14h!
      startsAt: appointmentTime.toISOString(),
      durationMinutes: 60,
      amountCents: 18000,
      status: "agendado",
      paymentStatus: "pendente"
    });
  } catch (err: any) {
    if (err.message && err.message.includes("ocupado")) {
      sameMemberConflictDetected = true;
    }
  }
  assert(sameMemberConflictDetected, "Conflito de horário detectado corretamente para a mesma profissional parceira.");

  console.log("\n--- 3. Registro de Pagamentos & Divisão de Comissões ---");
  // Pagamento 1: Camila realizou Alongamento Fibra por R$ 180,00 (50% = R$ 90,00 Camila / R$ 90,00 Salão)
  const pay1 = await caller.payment.create({
    clientId: client1.id,
    serviceId: service1.id,
    teamMemberId: partner1.id,
    amountCents: 18000, // R$ 180,00
    method: "pix",
    status: "pago",
    note: "Alongamento em Fibra de Vidro - Camila"
  });
  assert(pay1.success, "Pagamento do atendimento da Camila registrado.");

  // Pagamento 2: Camila realizou Manutenção por R$ 120,00 (50% = R$ 60,00 Camila / R$ 60,00 Salão)
  const pay2 = await caller.payment.create({
    clientId: client2.id,
    serviceId: service1.id,
    teamMemberId: partner1.id,
    amountCents: 12000, // R$ 120,00
    method: "cartao",
    status: "pago",
    note: "Manutenção Fibra - Camila"
  });
  assert(pay2.success, "Segundo pagamento da Camila registrado.");

  // Pagamento 3: Letícia realizou Sobrancelhas por R$ 80,00 (60% = R$ 48,00 Letícia / R$ 32,00 Salão)
  const pay3 = await caller.payment.create({
    clientId: client1.id,
    serviceId: service2.id,
    teamMemberId: partner2.id,
    amountCents: 8000, // R$ 80,00
    method: "dinheiro",
    status: "pago",
    note: "Sobrancelhas Henna - Letícia"
  });
  assert(pay3.success, "Pagamento do atendimento da Letícia registrado.");

  // Pagamento 4: Receita própria do estúdio (sem parceiro) por R$ 50,00
  const pay4 = await caller.payment.create({
    clientId: client2.id,
    amountCents: 5000, // R$ 50,00
    method: "pix",
    status: "pago",
    note: "Venda de produto home-care direto pelo salão"
  });
  assert(pay4.success, "Receita própria direta do estúdio registrada.");

  // Despesa do estúdio: R$ 40,00 (materiais descartáveis)
  await caller.expense.create({
    description: "Luvas, algodão e descartáveis do salão",
    category: "Materiais",
    amountCents: 4000 // R$ 40,00
  });

  console.log("\n--- 4. Apuração Financeira & Relatórios da Equipe ---");
  const report = await caller.team.report();

  // Faturamento bruto total registrado: 180 + 120 + 80 + 50 = R$ 430,00 (43000 cents)
  assert(report.totalGrossCents === 43000, `Faturamento Bruto total calculado: R$ ${(report.totalGrossCents / 100).toFixed(2)} (esperado: R$ 430,00)`);

  // Comissões dos parceiros:
  // Camila: 50% de (180 + 120) = R$ 150,00 (15000 cents)
  // Letícia: 60% de 80 = R$ 48,00 (4800 cents)
  // Total Comissões = 150 + 48 = R$ 198,00 (19800 cents)
  assert(report.totalCommissionCents === 19800, `Comissões apuradas a repassar: R$ ${(report.totalCommissionCents / 100).toFixed(2)} (esperado: R$ 198,00)`);

  // Retenção do estúdio:
  // Camila: R$ 150,00
  // Letícia: R$ 32,00
  // Receita direta: R$ 50,00
  // Total Retido = 150 + 32 + 50 = R$ 232,00 (23200 cents)
  assert(report.totalStudioNetCents === 23200, `Lucro Bruto retido pelo estúdio: R$ ${(report.totalStudioNetCents / 100).toFixed(2)} (esperado: R$ 232,00)`);

  // Lucro final após despesas do estúdio (232 - 40 = R$ 192,00):
  assert(report.finalProfitCents === 19200, `Lucro Líquido final do estúdio após despesas: R$ ${(report.finalProfitCents / 100).toFixed(2)} (esperado: R$ 192,00)`);

  // Validar breakdown individual da Camila
  const camilaStats = report.breakdown.find(b => b.member.id === partner1.id);
  assert(Boolean(camilaStats), "Breakdown individual da Camila retornado.");
  assert(camilaStats?.count === 2, `Camila realizou ${camilaStats?.count} atendimentos (esperado: 2).`);
  assert(camilaStats?.grossCents === 30000, `Camila faturou R$ ${(camilaStats!.grossCents / 100).toFixed(2)} (esperado: R$ 300,00).`);
  assert(camilaStats?.commissionCents === 15000, `Comissão da Camila a pagar: R$ ${(camilaStats!.commissionCents / 100).toFixed(2)} (esperado: R$ 150,00).`);
  assert(camilaStats?.studioCents === 15000, `Retenção do estúdio sobre Camila: R$ ${(camilaStats!.studioCents / 100).toFixed(2)} (esperado: R$ 150,00).`);

  // Validar breakdown individual da Letícia
  const leticiaStats = report.breakdown.find(b => b.member.id === partner2.id);
  assert(Boolean(leticiaStats), "Breakdown individual da Letícia retornado.");
  assert(leticiaStats?.count === 1, `Letícia realizou ${leticiaStats?.count} atendimento (esperado: 1).`);
  assert(leticiaStats?.grossCents === 8000, `Letícia faturou R$ ${(leticiaStats!.grossCents / 100).toFixed(2)} (esperado: R$ 80,00).`);
  assert(leticiaStats?.commissionCents === 4800, `Comissão da Letícia a pagar: R$ ${(leticiaStats!.commissionCents / 100).toFixed(2)} (esperado: R$ 48,00).`);
  assert(leticiaStats?.studioCents === 3200, `Retenção do estúdio sobre Letícia: R$ ${(leticiaStats!.studioCents / 100).toFixed(2)} (esperado: R$ 32,00).`);

  console.log("\n--- 5. Formatação do Extrato de Acerto no WhatsApp ---");
  const whatsappTextCamila = `*FECHAMENTO DE REPASSES - STUDIO JULIANA BELEZA & ESTÉTICA*\n\n` +
    `Olá *Camila Rocha*! Segue o extrato de atendimentos e comissões referente a *Este Mês*:\n\n` +
    `💅 *Atendimentos realizados:* ${camilaStats?.count}\n` +
    `💰 *Faturamento Total Gerado:* R$ ${(camilaStats!.grossCents / 100).toFixed(2)}\n` +
    `✂️ *Sua Comissão (50%):* R$ ${(camilaStats!.commissionCents / 100).toFixed(2)}\n` +
    `🏢 *Retenção Estúdio/Espaço:* R$ ${(camilaStats!.studioCents / 100).toFixed(2)}\n\n` +
    `🔑 *Dados PIX para Acerto:*\nTELEFONE: 11911112222\n\n` +
    `_Extrato emitido com base na Lei do Salão-Parceiro (Lei 13.352). Qualquer dúvida estou à disposição!_`;

  assert(whatsappTextCamila.includes("R$ 150.00"), "Texto do WhatsApp contém o valor exato da comissão da Camila (R$ 150.00).");
  assert(whatsappTextCamila.includes("11911112222"), "Texto do WhatsApp inclui a chave PIX correta da parceira.");
  assert(whatsappTextCamila.includes("Lei do Salão-Parceiro"), "Texto cita o embasamento legal da Lei do Salão-Parceiro.");

  console.log("\n--- 6. Gerenciamento e Ciclo de Vida do Parceiro ---");
  // Desativar parceira temporariamente
  const toggleRes = await caller.team.toggleActive({ id: partner2.id, active: false });
  assert(toggleRes.success, "Letícia desativada temporariamente.");

  const listAfterToggle = await caller.team.list();
  const leticiaUpdated = listAfterToggle.find(m => m.id === partner2.id);
  assert(leticiaUpdated?.active === false, "Status da parceira Letícia refletiu active = false.");

  // Reativar parceira
  const reactivateRes = await caller.team.toggleActive({ id: partner2.id, active: true });
  assert(reactivateRes.success, "Letícia reativada com sucesso.");

  console.log("\n=================================================");
  console.log(`🎯 RESULTADO DOS TESTES DA FASE 2:`);
  console.log(`   Total de asserções: ${passed + failed}`);
  console.log(`   ✅ Passaram: ${passed}`);
  console.log(`   ❌ Falharam: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error("Erro fatal durante a execução dos testes da Fase 2:", err);
  process.exit(1);
});
