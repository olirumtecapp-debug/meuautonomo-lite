import { describe, expect, it, vi } from "vitest";
import { checkServiceSpelling } from "../client/src/utils/serviceSpellcheck";
import { formatBrl, formatBrlInput, parseBrlToCents } from "../client/src/utils/currency";
import type { TrpcContext } from "./_core/context";

const dbState = {
  inserts: [] as any[],
  updates: [] as any[],
};

const profile = {
  id: 7,
  userId: 11,
  slug: "ana-eletrica",
  displayName: "Ana Elétrica",
  professionName: "Eletricista",
  showPrices: true,
  bookingEnabled: true,
};

const mockQuoteRecord = {
  id: 42,
  profileId: 7,
  clientId: 1,
  secureToken: "token_seguro_orcamento_123456",
  status: "enviado",
  description: "Orçamento de Laudo e Diagnóstico Elétrico",
  subtotalCents: 35000,
  discountCents: 2000,
  totalCents: 33000,
  paymentTerms: "50% entrada e 50% na conclusão",
  notes: "Validade de 10 dias",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQuoteItems = [
  { id: 1, quoteId: 42, description: "Visita e Diagnóstico", quantity: 1, unitPriceCents: 15000, totalCents: 15000 },
  { id: 2, quoteId: 42, description: "Elaboração de Relatório Técnico", quantity: 1, unitPriceCents: 20000, totalCents: 20000 },
];

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => {
      let currentTable: any = null;
      const query: any = {
        from: (table: any) => {
          currentTable = table;
          return query;
        },
        where: () => query,
        orderBy: () => query,
        limit: async () => {
          const tableName = String(currentTable?._?.name || currentTable || "");
          if (tableName.includes("profile")) return [profile];
          if (tableName.includes("item")) return mockQuoteItems;
          return [mockQuoteRecord];
        },
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => {
          const tableName = String(currentTable?._?.name || currentTable || "");
          let result = [mockQuoteRecord];
          if (tableName.includes("profile")) result = [profile];
          else if (tableName.includes("item")) result = mockQuoteItems as any;
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    },
    insert: () => ({
      values: async (values: unknown) => {
        dbState.inserts.push(values);
        return [{ insertId: dbState.inserts.length }];
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        dbState.updates.push(values);
        return {
          where: async () => [{ affectedRows: 1 }],
        };
      },
    }),
  })),
  getProfileByUserId: vi.fn(async () => profile),
  getProfileBySlug: vi.fn(async () => profile),
  createNotification: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async (_key: string, _body: Buffer, mimeType: string) => ({
    url: `https://storage.test/file.${mimeType.split("/")[1]}`,
  })),
}));

vi.mock("./email", () => ({
  enviarEmail: vi.fn(async () => true),
  modeloOrcamentoAprovado: vi.fn(() => "<p>Email</p>"),
}));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 11,
      openId: "integration-user",
      name: "Ana Elétrica",
      email: "ana@example.com",
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

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("Simulação Completa do Sistema MeuAutônomo", () => {
  it("Simulação 1: Correção ortográfica de termos de serviços e diagnósticos", () => {
    const tests = [
      { input: "analises", expected: "Análises" },
      { input: "analises clinicas", expected: "Análises clínicas" },
      { input: "diagnostico", expected: "Diagnóstico" },
      { input: "avaliacao", expected: "Avaliação" },
      { input: "relatorio", expected: "Relatório" },
      { input: "sessao", expected: "Sessão" },
      { input: "eletrecista", expected: "Eletricista" },
      { input: "manutencao de chuvero", expected: "Manutenção de chuveiro" },
      { input: "concerto residencial", expected: "Conserto residencial" },
    ];

    for (const test of tests) {
      const result = checkServiceSpelling(test.input);
      expect(result.hasCorrection).toBe(true);
      expect(result.correctedText).toBe(test.expected);
    }
  });

  it("Simulação 2: Cliente envia solicitação de orçamento pela página pública", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const res = await caller.request.createPublic({
      slug: profile.slug,
      requesterName: "Carlos Cliente",
      requesterPhone: "11988887777",
      description: "Preciso de um laudo técnico para instalação elétrica residencial.",
    });

    expect(res).toMatchObject({ success: true });
  });

  it("Simulação 3a: Autônomo monta orçamento com itens e envia para o cliente", async () => {
    const caller = appRouter.createCaller(createContext());
    const quote = await caller.quote.create({
      description: "Orçamento de Laudo e Diagnóstico Elétrico",
      discountCents: 2000,
      sendNow: true,
      items: [
        { description: "Visita e Diagnóstico", quantity: 1, unitPriceCents: 15000 },
        { description: "Elaboração de Relatório Técnico", quantity: 1, unitPriceCents: 20000 },
      ],
    });

    expect(quote).toMatchObject({ success: true, quoteId: expect.any(Number) });
  });

  it("Simulação 3b: Cliente abre o link seguro do orçamento sem login", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const publicData = await caller.quote.getPublic({
      token: "token_seguro_orcamento_123456",
    });

    expect(publicData).toBeDefined();
    expect(publicData.quote.status).toBe("enviado");
    expect(publicData.quote.totalCents).toBe(33000);
    expect(publicData.profile).toBeDefined();
  });

  it("Simulação 3c: Cliente aprova o orçamento com confirmação digital", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.quote.respondPublic({
      token: "token_seguro_orcamento_123456",
      action: "aceito",
      clientName: "Carlos Cliente",
      clientEmail: "carlos@cliente.com",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("Simulação 3d: Cliente solicita alteração com mensagem de observação", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.quote.respondPublic({
      token: "token_seguro_orcamento_123456",
      action: "alteracao_solicitada",
      clientName: "Carlos Cliente",
      changeRequestText: "Poderíamos dividir o pagamento em 3 parcelas?",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("Simulação 4: Auditoria matemática e consistência de moeda brasileira", () => {
    expect(parseBrlToCents("180,00")).toBe(18000);
    expect(parseBrlToCents("180")).toBe(18000);
    expect(parseBrlToCents("R$ 1.500,50")).toBe(150050);
    expect(formatBrl(18000)).toBe("R$ 180,00");
    expect(formatBrl(150050)).toBe("R$ 1.500,50");
    expect(formatBrlInput(18000)).toBe("180,00");
  });

  it("Simulação 5: Validação dos planos Asaas PIX oficiais (Solo e Team)", async () => {
    const plansConfig = await import("./routes/asaas-plans-config.json");
    expect(plansConfig.default.solo).toBeDefined();
    expect(plansConfig.default.solo.paymentId).toBe("pay_zhlfko0mdc480t69");

    expect(plansConfig.default.team).toBeDefined();
    expect(plansConfig.default.team.paymentId).toBe("pay_44zhds3co79fyqe4");
  });

  it("Simulação 6: Auditoria de integridade e ausência de contas fictícias", async () => {
    const fs = await import("fs");
    if (fs.existsSync("server/data/db-store.json")) {
      try {
        const raw = fs.readFileSync("server/data/db-store.json", "utf8");
        if (raw.trim()) {
          const data = JSON.parse(raw);
          const fakeAdmin = data.users?.find(
            (u: any) => u.email === "admin@meuautonomo.com.br" || u.name === "Administrador Geral"
          );
          expect(fakeAdmin).toBeUndefined();
        }
      } catch (err: any) {
        if (!(err instanceof SyntaxError)) {
          throw err;
        }
      }
    }
  });
});
