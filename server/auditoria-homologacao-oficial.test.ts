import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { resetMockDb } from "./mockDb";
import { generateReceiptAuthCode } from "./receiptAuth";
import { formatBrl } from "../client/src/utils/currency";

let sentEmails: any[] = [];

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ url: "https://test.storage/file" })),
}));

vi.mock("./email", () => ({
  enviarEmail: vi.fn(async (payload: any) => {
    sentEmails.push(payload);
    return true;
  }),
  modeloOrcamentoAprovado: vi.fn((dados: any) => {
    return {
      assunto: `Orçamento Aprovado #${dados.orcamentoId} - ${dados.clienteNome}`,
      texto: `Olá ${dados.clienteNome}, sua proposta no valor de R$ ${(dados.totalCents / 100).toFixed(2)} foi confirmada.`,
      html: `<p>Olá ${dados.clienteNome}, sua proposta no valor de R$ ${(dados.totalCents / 100).toFixed(2)} foi confirmada.</p>`,
    };
  }),
}));

import { appRouter } from "./routers";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

function createMockContext(user: TrpcContext["user"] = null): {
  ctx: TrpcContext;
  cookiesSet: CookieCall[];
  cookiesCleared: CookieCall[];
} {
  const cookiesSet: CookieCall[] = [];
  const cookiesCleared: CookieCall[] = [];

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-proto": "https",
      },
    } as unknown as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookiesSet.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookiesCleared.push({ name, options });
      },
    } as unknown as TrpcContext["res"],
  };

  return { ctx, cookiesSet, cookiesCleared };
}

describe("Auditoria e Homologação de Produção - MeuAutônomo", () => {
  beforeEach(() => {
    resetMockDb();
    sentEmails = [];
  });

  describe("CENÁRIO A: MODO SOLO (Autônomo Individual)", () => {
    it("Valida o ciclo de vida completo do profissional autônomo individual", async () => {
      // 1. Simulação / criação de novo usuário autônomo: Carlos Eletricista
      const { ctx: anonCtx } = createMockContext(null);
      const callerPublic = appRouter.createCaller(anonCtx);

      const regResult = await callerPublic.auth.register({
        name: "Carlos Eletricista",
        email: "carlos.eletrica@gmail.com",
        password: "SenhaSegura123!",
      });

      expect(regResult.success).toBe(true);
      expect(regResult.user).toBeDefined();
      expect(regResult.user.id).toBeGreaterThan(0);

      const { ctx: carlosCtx } = createMockContext(regResult.user as any);
      const callerCarlos = appRouter.createCaller(carlosCtx);

      // Cria/configura perfil do autônomo: Carlos Eletricista, slug: carlos-eletrica, WhatsApp, PIX
      await callerCarlos.profile.upsert({
        displayName: "Carlos Eletricista",
        slug: "carlos-eletrica",
        professionName: "Eletricista Residencial e Predial",
        professionCategory: "reparos",
        accountType: "individual",
        phone: "11988887777",
        whatsapp: "11988887777",
        pixKey: "11988887777",
        pixKeyType: "telefone",
        city: "São Paulo",
        serviceRegion: "Zona Sul",
        showPrices: true,
        bookingEnabled: true,
      });

      const carlosProfile = await callerCarlos.profile.get();
      expect(carlosProfile).toBeDefined();
      expect(carlosProfile?.slug).toBe("carlos-eletrica");
      expect(carlosProfile?.accountType).toBe("individual");
      expect(carlosProfile?.pixKey).toBe("11988887777");

      // 2. Cadastra cliente e serviço (ex: Troca de Disjuntor R$ 180,00)
      const clientRes = await callerCarlos.customer.create({
        name: "Roberto Cliente",
        phone: "11977776666",
        whatsapp: "11977776666",
        email: "roberto@cliente.com",
        address: "Rua das Flores, 123 - Apto 42",
      });
      expect(clientRes.success).toBe(true);

      const clientList = await callerCarlos.customer.list();
      expect(clientList.length).toBeGreaterThan(0);
      const roberto = clientList.find((c) => c.name === "Roberto Cliente")!;
      expect(roberto).toBeDefined();

      const serviceRes = await callerCarlos.service.create({
        name: "Troca de Disjuntor",
        priceCents: 18000, // R$ 180,00
        durationMinutes: 60,
        modality: "presencial",
      });
      expect(serviceRes.success).toBe(true);

      const serviceList = await callerCarlos.service.list();
      const disjuntorService = serviceList.find((s) => s.name === "Troca de Disjuntor")!;
      expect(disjuntorService).toBeDefined();
      expect(disjuntorService.priceCents).toBe(18000);

      // 3. Cria proposta/orçamento formal com itens e desconto de R$ 20,00
      // Itens: Troca de Disjuntor (R$ 180,00) + Revisão de Barramento (R$ 90,00) = Subtotal R$ 270,00
      // Desconto: R$ 20,00 (2000 cents) => Total da proposta: R$ 250,00 (25000 cents)
      const quoteRes = await callerCarlos.quote.create({
        clientId: roberto.id,
        serviceId: disjuntorService.id,
        description: "Substituição de disjuntor geral com revisão de fiação",
        discountCents: 2000, // Desconto de R$ 20,00
        sendNow: true,
        items: [
          { description: "Troca de Disjuntor DIN 50A", quantity: 1, unitPriceCents: 18000 },
          { description: "Revisão e Reaperto de Barramento", quantity: 1, unitPriceCents: 9000 },
        ],
      });

      expect(quoteRes.success).toBe(true);
      expect(quoteRes.quoteId).toBeDefined();
      expect(quoteRes.token).toBeDefined();

      const quoteId = quoteRes.quoteId!;
      const secureToken = quoteRes.token!;

      const quoteList = await callerCarlos.quote.list();
      const createdQuote = quoteList.find((q) => q.id === quoteId)!;
      expect(createdQuote).toBeDefined();
      expect(createdQuote.subtotalCents).toBe(27000);
      expect(createdQuote.discountCents).toBe(2000);
      expect(createdQuote.totalCents).toBe(25000); // R$ 250,00
      expect(createdQuote.status).toBe("enviado");

      // 4. Simula o link e texto de compartilhamento via WhatsApp
      const rawPhone = roberto.phone ? roberto.phone.replace(/\D/g, "") : "";
      const quoteUrl = `https://meuautonomo.com.br/orcamento/${secureToken}`;
      const desc = createdQuote.description || "serviços elétricos";
      const val = formatBrl(createdQuote.totalCents);
      const whatsappText = `Olá ${roberto.name}! Segue a proposta de orçamento referente a ${desc} no valor de ${val}.\n\nVocê pode consultar os itens detalhados e aprovar diretamente por este link seguro:\n${quoteUrl}\n\nQualquer dúvida estou à disposição!`;
      const whatsappShareUrl = `https://wa.me/55${rawPhone}?text=${encodeURIComponent(whatsappText)}`;

      expect(whatsappShareUrl).toContain("11977776666");
      expect(whatsappShareUrl).toContain(encodeURIComponent("R$ 250,00"));
      expect(whatsappText).toContain("Roberto Cliente");
      expect(whatsappText).toContain(quoteUrl);

      // 5. Simula o cliente acessando o link público sem login e aprovando a proposta
      const publicQuoteData = await callerPublic.quote.getPublic({ token: secureToken });
      expect(publicQuoteData).toBeDefined();
      expect(publicQuoteData.quote.id).toBe(quoteId);
      expect(publicQuoteData.quote.totalCents).toBe(25000);
      expect(publicQuoteData.quote.status).toBe("enviado");
      expect(publicQuoteData.profile.displayName).toBe("Carlos Eletricista");

      const approveRes = await callerPublic.quote.respondPublic({
        token: secureToken,
        action: "aceito",
        clientName: "Roberto Cliente",
        clientEmail: "roberto@cliente.com",
      });
      expect(approveRes.success).toBe(true);

      const refreshedQuotes = await callerCarlos.quote.list();
      const approvedQuote = refreshedQuotes.find((q) => q.id === quoteId)!;
      expect(approvedQuote.status).toBe("aceito");

      // 6. Valide o disparo do e-mail de notificação de proposta aprovada
      expect(sentEmails.length).toBeGreaterThan(0);
      const sentEmail = sentEmails[0];
      expect(sentEmail.para).toBe("roberto@cliente.com");
      expect(sentEmail.assunto).toContain("Orçamento Aprovado");

      // 7. Converta em atendimento na Agenda, conclua e registre pagamento PIX
      const appointmentRes = await callerCarlos.appointment.create({
        clientId: roberto.id,
        serviceId: disjuntorService.id,
        startsAt: "2026-10-15T09:00:00.000Z",
        durationMinutes: 60,
        amountCents: 25000, // R$ 250,00 (valor aprovado da proposta)
        status: "concluido",
        paymentStatus: "pago",
        paymentMethod: "pix",
        notes: "Atendimento formalizado a partir do orçamento aprovado",
      });
      expect(appointmentRes.success).toBe(true);

      const appList = await callerCarlos.appointment.list();
      const app = appList.find((a) => a.clientId === roberto.id)!;
      expect(app).toBeDefined();
      expect(app.status).toBe("concluido");
      expect(app.amountCents).toBe(25000);

      // Registra o pagamento formal via PIX
      const paymentRes = await callerCarlos.payment.create({
        appointmentId: app.id,
        clientId: roberto.id,
        serviceId: disjuntorService.id,
        amountCents: 25000, // R$ 250,00
        method: "pix",
        status: "pago",
        note: "Recebimento integral via PIX",
      });
      expect(paymentRes.success).toBe(true);

      // 8. Valide o Dashboard Financeiro (Faturamento R$ 250,00, Recebido R$ 250,00, Pendente R$ 0,00)
      const reportSummary = await callerCarlos.reports.summary();
      expect(reportSummary.revenueCents).toBe(25000); // R$ 250,00
      expect(reportSummary.receivedCents).toBe(25000); // R$ 250,00
      expect(reportSummary.pendingCents).toBe(0); // R$ 0,00
      expect(reportSummary.appointmentCount).toBe(1);

      const dashSummary = await callerCarlos.dashboard.summary();
      expect(dashSummary.metrics.monthRevenueCents).toBe(25000);
      expect(dashSummary.metrics.receivedCents).toBe(25000);
      expect(dashSummary.metrics.pendingCents).toBe(0);
      expect(dashSummary.metrics.balanceCents).toBe(25000);

      // 9. Geração e validação de recibo com dados fiscais
      const officialReceiptCode = generateReceiptAuthCode("A", app.id, carlosProfile!.id, 25000);
      expect(officialReceiptCode).toBeDefined();

      const receiptValidation = await callerPublic.receipt.validate({ code: officialReceiptCode });
      expect(receiptValidation.valid).toBe(true);
      expect(receiptValidation.code).toBe(officialReceiptCode);
      expect(receiptValidation.receiptNumber).toBe(`REC-${String(app.id).padStart(4, "0")}`);
      expect(receiptValidation.professionalName).toBe("Carlos Eletricista");
      expect(receiptValidation.clientName).toBe("Roberto Cliente");
      expect(receiptValidation.amountCents).toBe(25000);
      expect(receiptValidation.type).toBe("Comprovante de Atendimento Concluído");
      expect(receiptValidation.paymentMethod).toBe("PIX");
      expect(receiptValidation.paymentStatus).toBe("Quitado / Recebido");
      expect(receiptValidation.professionalPhone).toBe("11988887777");
      expect(carlosProfile?.pixKey).toBe("11988887777");
      expect(receiptValidation.legalBasis).toContain("Lei Federal nº 14.063/2020");
    });
  });

  describe("CENÁRIO B: MODO EQUIPE / ESTÚDIO (Múltiplos Parceiros & Pró-Labore)", () => {
    it("Valida o gerenciamento de múltiplos parceiros, agenda concorrente e fechamento contábil", async () => {
      // 1. Simulação / criação de usuário de Estúdio: Mariana Studio & Estética
      const { ctx: anonCtx } = createMockContext(null);
      const callerPublic = appRouter.createCaller(anonCtx);

      const regResult = await callerPublic.auth.register({
        name: "Mariana Gestora",
        email: "mariana@marianastudio.com.br",
        password: "StudioPassword123!",
      });

      expect(regResult.success).toBe(true);

      const { ctx: marianaCtx } = createMockContext(regResult.user as any);
      const callerMariana = appRouter.createCaller(marianaCtx);

      await callerMariana.profile.upsert({
        displayName: "Mariana Studio & Estética",
        slug: "mariana-studio",
        professionName: "Estúdio de Beleza & Bem-Estar",
        professionCategory: "beleza",
        accountType: "equipe",
        phone: "11999990000",
        whatsapp: "11999990000",
        pixKey: "mariana@marianastudio.com.br",
        pixKeyType: "email",
        city: "São Paulo",
        serviceRegion: "Moema",
        showPrices: true,
        bookingEnabled: true,
      });

      const marianaProfile = await callerMariana.profile.get();
      expect(marianaProfile).toBeDefined();
      expect(marianaProfile?.accountType).toBe("equipe");

      // 2. Cadastre 3 parceiros com comissões distintas:
      // Amanda (60% comissão, chave PIX celular)
      const amandaRes = await callerMariana.team.create({
        name: "Amanda Estética",
        role: "Designer de Sobrancelhas",
        phone: "11988881111",
        commissionPercent: 60,
        pixKeyType: "telefone",
        pixKey: "11988881111",
        color: "#f43f5e",
      });
      expect(amandaRes.success).toBe(true);

      // Beatriz (70% comissão, chave PIX e-mail)
      const beatrizRes = await callerMariana.team.create({
        name: "Beatriz Cabelos",
        role: "Cabeleireira Especialista",
        phone: "11988882222",
        commissionPercent: 70,
        pixKeyType: "email",
        pixKey: "beatriz@estudio.com",
        color: "#8b5cf6",
      });
      expect(beatrizRes.success).toBe(true);

      // Carlos (50% comissão, chave PIX CPF)
      const carlosRes = await callerMariana.team.create({
        name: "Carlos Massoterapia",
        role: "Massoterapeuta Corporal",
        phone: "11988883333",
        commissionPercent: 50,
        pixKeyType: "cpf",
        pixKey: "123.456.789-00",
        color: "#06b6d4",
      });
      expect(carlosRes.success).toBe(true);

      const teamList = await callerMariana.team.list();
      expect(teamList).toHaveLength(3);
      const amanda = teamList.find((m) => m.name === "Amanda Estética")!;
      const beatriz = teamList.find((m) => m.name === "Beatriz Cabelos")!;
      const carlos = teamList.find((m) => m.name === "Carlos Massoterapia")!;

      expect(amanda.commissionPercent).toBe(60);
      expect(beatriz.commissionPercent).toBe(70);
      expect(carlos.commissionPercent).toBe(50);

      // Cadastra clientes para os atendimentos
      await callerMariana.customer.create({ name: "Juliana Rocha", phone: "11911110001" });
      await callerMariana.customer.create({ name: "Fernanda Lima", phone: "11911110002" });
      await callerMariana.customer.create({ name: "Camila Santos", phone: "11911110003" });

      const clients = await callerMariana.customer.list();
      const juliana = clients.find((c) => c.name === "Juliana Rocha")!;
      const fernanda = clients.find((c) => c.name === "Fernanda Lima")!;
      const camila = clients.find((c) => c.name === "Camila Santos")!;

      // 3. Teste a Agenda Concorrente: Amanda e Beatriz atendendo no mesmo horário com clientes diferentes
      const slotSameTime = "2026-10-15T14:00:00.000Z";

      const appAmanda = await callerMariana.appointment.create({
        clientId: juliana.id,
        teamMemberId: amanda.id,
        startsAt: slotSameTime,
        durationMinutes: 60,
        amountCents: 35000, // R$ 350,00
        status: "concluido",
        paymentStatus: "pago",
      });
      expect(appAmanda.success).toBe(true);

      const appBeatriz = await callerMariana.appointment.create({
        clientId: fernanda.id,
        teamMemberId: beatriz.id,
        startsAt: slotSameTime, // Mesmo horário simultâneo!
        durationMinutes: 60,
        amountCents: 15000, // R$ 150,00
        status: "concluido",
        paymentStatus: "pago",
      });
      expect(appBeatriz.success).toBe(true);

      // Atendimento Carlos: R$ 200,00
      const appCarlos = await callerMariana.appointment.create({
        clientId: camila.id,
        teamMemberId: carlos.id,
        startsAt: "2026-10-15T15:30:00.000Z",
        durationMinutes: 60,
        amountCents: 20000, // R$ 200,00
        status: "concluido",
        paymentStatus: "pago",
      });
      expect(appCarlos.success).toBe(true);

      const appointments = await callerMariana.appointment.list();
      expect(appointments).toHaveLength(3);

      const appAmandaRow = appointments.find((a) => a.teamMemberId === amanda.id)!;
      const appBeatrizRow = appointments.find((a) => a.teamMemberId === beatriz.id)!;
      const appCarlosRow = appointments.find((a) => a.teamMemberId === carlos.id)!;

      // 4. Registra pagamentos recebidos dos atendimentos
      // Total Bruto: R$ 350 + R$ 150 + R$ 200 = R$ 700,00
      await callerMariana.payment.create({
        appointmentId: appAmandaRow.id,
        clientId: juliana.id,
        teamMemberId: amanda.id,
        amountCents: 35000,
        method: "pix",
        status: "pago",
      });

      await callerMariana.payment.create({
        appointmentId: appBeatrizRow.id,
        clientId: fernanda.id,
        teamMemberId: beatriz.id,
        amountCents: 15000,
        method: "pix",
        status: "pago",
      });

      await callerMariana.payment.create({
        appointmentId: appCarlosRow.id,
        clientId: camila.id,
        teamMemberId: carlos.id,
        amountCents: 20000,
        method: "pix",
        status: "pago",
      });

      // 5. Lance uma despesa operacional da casa de R$ 80,00
      const expenseRes = await callerMariana.expense.create({
        description: "Materiais de higienização, toalhas e descartáveis",
        amountCents: 8000, // R$ 80,00
        occurredAt: "2026-10-15T18:00:00.000Z",
      });
      expect(expenseRes.success).toBe(true);

      // 6. Valide a matemática do Fechamento e Pró-Labore
      const teamReport = await callerMariana.team.report();

      // Repasse Amanda: R$ 210,00 | Retenção Casa: R$ 140,00
      const amandaStats = teamReport.breakdown.find((b) => b.member.id === amanda.id)!;
      expect(amandaStats).toBeDefined();
      expect(amandaStats.grossCents).toBe(35000); // R$ 350,00
      expect(amandaStats.commissionCents).toBe(21000); // R$ 210,00 (60%)
      expect(amandaStats.studioCents).toBe(14000); // R$ 140,00 (40%)

      // Repasse Beatriz: R$ 105,00 | Retenção Casa: R$ 45,00
      const beatrizStats = teamReport.breakdown.find((b) => b.member.id === beatriz.id)!;
      expect(beatrizStats).toBeDefined();
      expect(beatrizStats.grossCents).toBe(15000); // R$ 150,00
      expect(beatrizStats.commissionCents).toBe(10500); // R$ 105,00 (70%)
      expect(beatrizStats.studioCents).toBe(4500); // R$ 45,00 (30%)

      // Repasse Carlos: R$ 100,00 | Retenção Casa: R$ 100,00
      const carlosStats = teamReport.breakdown.find((b) => b.member.id === carlos.id)!;
      expect(carlosStats).toBeDefined();
      expect(carlosStats.grossCents).toBe(20000); // R$ 200,00
      expect(carlosStats.commissionCents).toBe(10000); // R$ 100,00 (50%)
      expect(carlosStats.studioCents).toBe(10000); // R$ 100,00 (50%)

      // Total Repasses Parceiros: R$ 415,00
      expect(teamReport.totalCommissionCents).toBe(41500); // R$ 415,00

      // Retenção Bruta da Casa: R$ 285,00
      expect(teamReport.totalStudioNetCents).toBe(28500); // R$ 285,00

      // Total Bruto e Total Recebido: R$ 700,00
      expect(teamReport.totalGrossCents).toBe(70000); // R$ 700,00
      expect(teamReport.totalReceivedCents).toBe(70000); // R$ 700,00

      // Despesas Operacionais: R$ 80,00
      expect(teamReport.totalExpensesCents).toBe(8000); // R$ 80,00

      // Lucro Líquido / Pró-Labore da Gestora: R$ 205,00
      expect(teamReport.finalProfitCents).toBe(20500); // R$ 205,00

      // 7. Simule a geração do extrato formatado para envio no WhatsApp com a chave PIX de cada parceiro
      const generateWhatsAppStatement = (memberStats: typeof amandaStats, memberInfo: typeof amanda) => {
        const studioName = marianaProfile!.displayName;
        const partnerName = memberInfo.name;
        const totalApps = memberStats.count;
        const gross = formatBrl(memberStats.grossCents);
        const commVal = formatBrl(memberStats.commissionCents);
        const commPct = memberInfo.commissionPercent;
        const studioNet = formatBrl(memberStats.studioCents);
        const pix = memberInfo.pixKey
          ? `${(memberInfo.pixKeyType || "PIX").toUpperCase()}: ${memberInfo.pixKey}`
          : "A combinar";

        return (
          `*FECHAMENTO DE REPASSES - ${studioName.toUpperCase()}*\n\n` +
          `Olá *${partnerName}*! Segue o extrato de atendimentos e comissões referente a *Este Mês*:\n\n` +
          `💅 *Atendimentos realizados:* ${totalApps}\n` +
          `💰 *Faturamento Total Gerado:* ${gross}\n` +
          `✂️ *Sua Comissão (${commPct}%):* ${commVal}\n` +
          `🏢 *Retenção Estúdio/Espaço:* ${studioNet}\n\n` +
          `🔑 *Dados PIX para Acerto:*\n${pix}\n\n` +
          `_Extrato emitido com base na Lei do Salão-Parceiro (Lei 13.352). Qualquer dúvida estou à disposição!_`
        );
      };

      // Extrato Amanda
      const statementAmanda = generateWhatsAppStatement(amandaStats, amanda);
      expect(statementAmanda).toContain("Amanda Estética");
      expect(statementAmanda).toContain("R$ 350,00");
      expect(statementAmanda).toContain("Sua Comissão (60%):* R$ 210,00");
      expect(statementAmanda).toContain("Retenção Estúdio/Espaço:* R$ 140,00");
      expect(statementAmanda).toContain("TELEFONE: 11988881111");

      // Extrato Beatriz
      const statementBeatriz = generateWhatsAppStatement(beatrizStats, beatriz);
      expect(statementBeatriz).toContain("Beatriz Cabelos");
      expect(statementBeatriz).toContain("R$ 150,00");
      expect(statementBeatriz).toContain("Sua Comissão (70%):* R$ 105,00");
      expect(statementBeatriz).toContain("Retenção Estúdio/Espaço:* R$ 45,00");
      expect(statementBeatriz).toContain("EMAIL: beatriz@estudio.com");

      // Extrato Carlos
      const statementCarlos = generateWhatsAppStatement(carlosStats, carlos);
      expect(statementCarlos).toContain("Carlos Massoterapia");
      expect(statementCarlos).toContain("R$ 200,00");
      expect(statementCarlos).toContain("Sua Comissão (50%):* R$ 100,00");
      expect(statementCarlos).toContain("Retenção Estúdio/Espaço:* R$ 100,00");
      expect(statementCarlos).toContain("CPF: 123.456.789-00");
    });
  });
});
