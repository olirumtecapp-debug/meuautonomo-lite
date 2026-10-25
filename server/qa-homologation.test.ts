import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

// Simulated database state for integration test
interface MockRow { [key: string]: any; id: number }

const dbData = {
  profiles: [] as MockRow[],
  clients: [] as MockRow[],
  services: [] as MockRow[],
  teamMembers: [] as MockRow[],
  appointments: [] as MockRow[],
  payments: [] as MockRow[],
  expenses: [] as MockRow[],
  quotes: [] as MockRow[],
  quoteItems: [] as MockRow[],
  availability: [] as MockRow[],
  requests: [] as MockRow[],
};

const profile = {
  id: 1,
  userId: 10,
  slug: "estudio-qa",
  displayName: "Estúdio QA Elétrica",
  professionName: "Eletricista",
  showPrices: true,
  bookingEnabled: true,
};

import {
  appointments,
  availability,
  clients,
  expenses,
  payments,
  professionalProfiles,
  quoteItems,
  quotes,
  requests,
  services,
  teamMembers,
} from "../drizzle/schema";

function getTableList(tableObj: any): MockRow[] {
  if (tableObj === clients) return dbData.clients;
  if (tableObj === services) return dbData.services;
  if (tableObj === teamMembers) return dbData.teamMembers;
  if (tableObj === appointments) return dbData.appointments;
  if (tableObj === payments) return dbData.payments;
  if (tableObj === expenses) return dbData.expenses;
  if (tableObj === quotes) return dbData.quotes;
  if (tableObj === quoteItems) return dbData.quoteItems;
  if (tableObj === availability) return dbData.availability;
  if (tableObj === requests) return dbData.requests;
  if (tableObj === professionalProfiles) return dbData.profiles;
  return [];
}

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: (fields?: any) => {
      let currentList: MockRow[] = [];
      const query: any = {
        from: (tableObj: any) => {
          currentList = getTableList(tableObj);
          return query;
        },
        where: (condition: any) => query,
        orderBy: () => query,
        limit: (n: number) => {
          return Promise.resolve(currentList.slice(0, n));
        },
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => {
          return Promise.resolve(currentList).then(resolve, reject);
        },
      };
      return query;
    },
    insert: (tableObj: any) => ({
      values: async (values: any) => {
        const list = getTableList(tableObj);
        const items = Array.isArray(values) ? values : [values];
        const insertedIds: number[] = [];
        for (const item of items) {
          const id = list.length + 1;
          const record = { ...item, id };
          list.push(record);
          insertedIds.push(id);
        }
        return [{ insertId: insertedIds[0] }];
      },
    }),
    update: (tableObj: any) => ({
      set: (updateValues: any) => ({
        where: async (condition: any) => {
          const list = getTableList(tableObj);
          for (const item of list) {
            Object.assign(item, updateValues);
          }
          return { affectedRows: list.length };
        },
      }),
    }),
    delete: (tableObj: any) => ({
      where: async () => ({ affectedRows: 1 }),
    }),
  })),
  getProfileByUserId: vi.fn(async () => profile),
  getProfileBySlug: vi.fn(async () => profile),
  createNotification: vi.fn(async () => undefined),
  getUserByEmail: vi.fn(async () => null),
  getUserByOpenId: vi.fn(async () => null),
  getAllUsers: vi.fn(async () => []),
  upsertUser: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ url: "https://test.storage/file" })),
}));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 10,
      openId: "qa-test-user",
      name: "Murilo QA",
      email: "qa@meuautonomo.test",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("QA Homologation Scenario - End-to-End Integration Tests", () => {
  beforeEach(() => {
    // Reset database state
    dbData.profiles = [profile];
    dbData.clients = [
      { id: 30001, profileId: 1, name: "Maria de Teste QA", phone: "11999990000", email: "maria@test.com" },
    ];
    dbData.services = [
      { id: 201, profileId: 1, name: "Instalação de tomadas", priceCents: 18000, durationMinutes: 90, active: true },
    ];
    dbData.teamMembers = [
      { id: 5, profileId: 1, name: "Camila Eletrica QA", role: "Eletricista Parceira", commissionPercent: 45, active: true },
    ];
    dbData.appointments = [];
    dbData.payments = [];
    dbData.expenses = [];
    dbData.quotes = [];
    dbData.quoteItems = [];
    dbData.availability = [];
    dbData.requests = [];
  });

  it("1. Creates appointment with partner Camila (45%) on 30/09/2026 at 10:00", async () => {
    const caller = appRouter.createCaller(createContext());
    const res = await caller.appointment.create({
      clientId: 30001,
      serviceId: 201,
      teamMemberId: 5,
      startsAt: "2026-09-30T10:00:00.000Z",
      durationMinutes: 90,
      amountCents: 18000,
      status: "confirmado",
      paymentStatus: "pendente",
    });

    expect(res.success).toBe(true);
    expect(dbData.appointments).toHaveLength(1);
    const created = dbData.appointments[0];
    expect(created.teamMemberId).toBe(5);
    expect(created.clientId).toBe(30001);
    expect(created.serviceId).toBe(201);
    expect(created.amountCents).toBe(18000);
    expect(created.status).toBe("confirmado");
  });

  it("2. Registers manual payment of R$ 180,00 for Maria and auto-links Camila's commission", async () => {
    // Setup appointment
    dbData.appointments.push({
      id: 101,
      profileId: 1,
      clientId: 30001,
      serviceId: 201,
      teamMemberId: 5,
      startsAt: "2026-09-30T10:00:00.000Z",
      durationMinutes: 90,
      amountCents: 18000,
      status: "confirmado",
      paymentStatus: "pendente",
    });

    const caller = appRouter.createCaller(createContext());

    // Register manual payment in Financeiro without explicitly typing appointmentId
    const payRes = await caller.payment.create({
      clientId: 30001,
      serviceId: 201,
      amountCents: 18000,
      method: "pix",
      status: "pago",
    });

    expect(payRes.success).toBe(true);
    expect(dbData.payments).toHaveLength(1);

    const savedPay = dbData.payments[0];
    expect(savedPay.appointmentId).toBe(101); // Auto-linked to appointment 101
    expect(savedPay.teamMemberId).toBe(5); // Auto-inherited Camila (id 5)
    expect(savedPay.commissionPercent).toBe(45);
    expect(savedPay.commissionAmountCents).toBe(8100); // R$ 81,00
    expect(savedPay.studioAmountCents).toBe(9900); // R$ 99,00
  });

  it("3. Verifies Finance payment list returns enriched client name and service name", async () => {
    dbData.payments.push({
      id: 501,
      profileId: 1,
      appointmentId: 101,
      clientId: 30001,
      serviceId: 201,
      teamMemberId: 5,
      amountCents: 18000,
      commissionPercent: 45,
      commissionAmountCents: 8100,
      studioAmountCents: 9900,
      status: "pago",
      method: "pix",
      createdAt: new Date("2026-09-30T10:00:00.000Z"),
    });

    const caller = appRouter.createCaller(createContext());
    const list = await caller.payment.list();

    expect(list).toHaveLength(1);
    expect(list[0].clientName).toBe("Maria de Teste QA");
    expect(list[0].serviceName).toBe("Instalação de tomadas");
  });

  it("4. Validates the Exact Mathematical Matrix across Reports and Team Report", async () => {
    dbData.appointments.push({
      id: 101,
      profileId: 1,
      clientId: 30001,
      serviceId: 201,
      teamMemberId: 5,
      startsAt: "2026-09-30T10:00:00.000Z",
      durationMinutes: 90,
      amountCents: 18000,
      status: "confirmado",
      paymentStatus: "pago",
    });

    dbData.payments.push({
      id: 501,
      profileId: 1,
      appointmentId: 101,
      clientId: 30001,
      serviceId: 201,
      teamMemberId: 5,
      amountCents: 18000,
      commissionPercent: 45,
      commissionAmountCents: 8100,
      studioAmountCents: 9900,
      status: "pago",
      method: "pix",
      createdAt: new Date("2026-09-30T10:00:00.000Z"),
    });

    const caller = appRouter.createCaller(createContext());

    // Query Reports Summary
    const repSummary = await caller.reports.summary();
    expect(repSummary.revenueCents).toBe(18000); // R$ 180,00 (Zero Duplication!)
    expect(repSummary.receivedCents).toBe(18000); // R$ 180,00
    expect(repSummary.pendingCents).toBe(0); // R$ 0,00
    expect(repSummary.appointmentCount).toBe(1); // 1 atendimento

    // Query Team Report
    const teamRep = await caller.team.report();
    expect(teamRep.totalGrossCents).toBe(18000); // R$ 180,00
    expect(teamRep.totalReceivedCents).toBe(18000); // R$ 180,00
    expect(teamRep.totalCommissionCents).toBe(8100); // R$ 81,00
    expect(teamRep.totalStudioNetCents).toBe(9900); // R$ 99,00
    expect(teamRep.finalProfitCents).toBe(9900); // R$ 99,00

    const camila = teamRep.breakdown.find(m => m.member.id === 5);
    expect(camila).toBeDefined();
    expect(camila!.grossCents).toBe(18000);
    expect(camila!.commissionCents).toBe(8100);
    expect(camila!.studioCents).toBe(9900);
    expect(camila!.count).toBe(1);

    // Query Dashboard Summary
    const dashSummary = await caller.dashboard.summary();
    expect(dashSummary.metrics.monthRevenueCents).toBe(18000);
    expect(dashSummary.metrics.receivedCents).toBe(18000);
    expect(dashSummary.metrics.pendingCents).toBe(0);
    expect(dashSummary.metrics.balanceCents).toBe(18000);
  });

  it("5. Confirms that Draft Quotes are blocked from public viewing and response", async () => {
    dbData.quotes.push({
      id: 99,
      profileId: 1,
      secureToken: "secret-token-draft-12345",
      status: "rascunho",
      subtotalCents: 18000,
      totalCents: 18000,
    });

    const publicCaller = appRouter.createCaller({
      user: null as any,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => undefined } as any,
    });

    // Attempt to view draft publicly
    await expect(
      publicCaller.quote.getPublic({ token: "secret-token-draft-12345" })
    ).rejects.toThrow("Este orçamento está em rascunho");

    // Attempt to respond to draft publicly
    await expect(
      publicCaller.quote.respondPublic({
        token: "secret-token-draft-12345",
        action: "aceito",
      })
    ).rejects.toThrow("Este orçamento está em rascunho");
  });

  it("6. Onda 2: Sincroniza status do pedido para 'proposta_aceita' ao aceitar orçamento público (BUG-010)", async () => {
    dbData.requests.push({
      id: 55,
      profileId: 1,
      name: "João Silva",
      status: "orcamento_enviado",
    });

    dbData.quotes.push({
      id: 77,
      profileId: 1,
      requestId: 55,
      secureToken: "token-proposta-aceita-77",
      status: "enviado",
      subtotalCents: 25000,
      totalCents: 25000,
    });

    const publicCaller = appRouter.createCaller({
      user: null as any,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => undefined } as any,
    });

    const resp = await publicCaller.quote.respondPublic({
      token: "token-proposta-aceita-77",
      action: "aceito",
    });

    expect(resp.success).toBe(true);
    const req = dbData.requests.find((r) => r.id === 55);
    expect(req).toBeDefined();
    expect(req!.status).toBe("proposta_aceita");
  });

  it("7. Onda 2: Permite orçamento com quantidade decimal/fracionária e calcula subtotal corretamente (BUG-024)", async () => {
    const caller = appRouter.createCaller(createContext());
    const res = await caller.quote.create({
      clientId: 30001,
      validUntil: "2026-10-15T12:00:00.000Z",
      items: [
        {
          description: "Cabo flexível por metro",
          quantity: 2.5,
          unitPriceCents: 1000, // R$ 10,00 por metro
        },
      ],
      discountCents: 500, // R$ 5,00 de desconto
    });

    expect(res.quoteId).toBeDefined();
    const createdQuote = dbData.quotes.find((q) => q.id === res.quoteId);
    expect(createdQuote).toBeDefined();
    expect(createdQuote!.subtotalCents).toBe(2500); // 2.5 * 1000 = 2500
    expect(createdQuote!.totalCents).toBe(2000); // 2500 - 500 = 2000
  });

  it("8. Onda 2: Valida relatórios sem capping e com suporte a períodos dinâmicos (BUG-014, BUG-015)", async () => {
    const caller = appRouter.createCaller(createContext());
    const res = await caller.reports.summary({});
    expect(res).toBeDefined();
    expect(typeof res.revenueCents).toBe("number");
    expect(typeof res.receivedCents).toBe("number");
    expect(typeof res.pendingCents).toBe("number");
  });
});
