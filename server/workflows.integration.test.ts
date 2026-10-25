import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbState = { inserts: [] as unknown[] };
const profile = { id: 7, userId: 11, slug: "ana-eletrica", displayName: "Ana", professionName: "Eletricista", showPrices: true, bookingEnabled: false };

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => {
      const query: any = {
        where: () => query,
        orderBy: () => query,
        limit: async () => [],
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve([]).then(resolve, reject),
      };
      return { from: () => query };
    },
    insert: () => ({ values: async (values: unknown) => { dbState.inserts.push(values); return [{ insertId: dbState.inserts.length }]; } }),
  })),
  getProfileByUserId: vi.fn(async () => profile),
  getProfileBySlug: vi.fn(async () => profile),
  createNotification: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({ storagePut: vi.fn(async (_key: string, _body: Buffer, mimeType: string) => ({ url: `https://storage.test/file.${mimeType.split("/")[1]}` })) }));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: { id: 11, openId: "integration-user", name: "Ana", email: "ana@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("MeuAutônomo workflows", () => {
  beforeEach(() => { dbState.inserts.length = 0; });

  it("creates a public request and persists its client and request records", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.request.createPublic({ slug: profile.slug, requesterName: "Bruno Cliente", requesterPhone: "11999998888", description: "Preciso instalar três tomadas novas." });
    expect(result).toMatchObject({ success: true, id: 2 });
    expect(dbState.inserts).toHaveLength(2);
    expect(dbState.inserts[0]).toMatchObject({ profileId: profile.id, name: "Bruno Cliente", phone: "11999998888" });
    expect(dbState.inserts[1]).toMatchObject({ profileId: profile.id, clientId: 1, requesterName: "Bruno Cliente", description: "Preciso instalar três tomadas novas." });
  });

  it("calculates and persists quote subtotal, discount, and total from multiple items", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.quote.create({ description: "Instalação completa", discountCents: 5000, sendNow: true, items: [{ description: "Mão de obra", quantity: 2, unitPriceCents: 10000 }, { description: "Material", quantity: 1, unitPriceCents: 5000 }] });
    expect(result).toMatchObject({ success: true, quoteId: 1 });
    expect(dbState.inserts[0]).toMatchObject({ subtotalCents: 25000, discountCents: 5000, totalCents: 20000, status: "enviado" });
    expect(dbState.inserts[1]).toEqual([{ quoteId: 1, description: "Mão de obra", quantity: 2, unitPriceCents: 10000, totalCents: 20000 }, { quoteId: 1, description: "Material", quantity: 1, unitPriceCents: 5000, totalCents: 5000 }]);
  });

  it("persists an expense with an explicit occurrence date and category", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.expense.create({ description: "Material elétrico", category: "Materiais", amountCents: 8750, occurredAt: "2026-09-15T14:00:00.000Z", note: "Compra para obra" });
    expect(dbState.inserts[0]).toMatchObject({ profileId: profile.id, description: "Material elétrico", category: "Materiais", amountCents: 8750, note: "Compra para obra" });
    expect((dbState.inserts[0] as any).occurredAt).toEqual(new Date("2026-09-15T14:00:00.000Z"));
  });
});
