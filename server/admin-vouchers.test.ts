import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";
import { sdk } from "./_core/sdk";
import { DEFAULT_ADMIN_PASSWORD, getAdminEmail } from "./demoConfig";

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

describe("Painel Administrativo & Gestão de Vouchers - MeuAutônomo", () => {
  const adminEmail = getAdminEmail();
  const adminPassword = DEFAULT_ADMIN_PASSWORD;
  let adminSessionToken: string;
  let adminUser: NonNullable<TrpcContext["user"]>;
  let savedQaUser: NonNullable<TrpcContext["user"]>;
  let initialDbSnapshot: string | null = null;

  beforeAll(async () => {
    const fs = await import("fs");
    if (fs.existsSync("server/data/db-store.json")) {
      initialDbSnapshot = fs.readFileSync("server/data/db-store.json", "utf8");
    }
  });

  it("1. Login administrativo com credenciais incorretas deve ser rejeitado", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.login({
        email: adminEmail,
        password: "senha_errada_123",
      })
    ).rejects.toThrow("Credenciais de administrador incorretas.");
  });

  it("2. Login administrativo com credenciais corretas deve retornar sessionToken e gravar cookie", async () => {
    const { ctx, cookiesSet } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.login({
      email: adminEmail,
      password: adminPassword,
    });

    expect(result.success).toBe(true);
    expect(result.email).toBe(adminEmail.toLowerCase());
    expect(result.sessionToken).toBeTruthy();
    adminSessionToken = result.sessionToken;

    // Cookie deve ter sido definido
    const cookie = cookiesSet.find((c) => c.name === COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe(result.sessionToken);
  });

  it("3. Sessão administrativa persistida: sdk.authenticateRequest deve retornar usuário com role 'admin'", async () => {
    const req = {
      headers: {
        authorization: `Bearer ${adminSessionToken}`,
      },
      cookies: {},
    };

    const authenticatedUser = await sdk.authenticateRequest(req as any);
    expect(authenticatedUser).toBeDefined();
    expect(authenticatedUser?.email).toBe(adminEmail.toLowerCase());
    expect(authenticatedUser?.role).toBe("admin");
    adminUser = authenticatedUser!;

    // Verifica que auth.me retorna role 'admin'
    const { ctx } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me?.role).toBe("admin");
  });

  it("3b. Estabilidade de contas: logins e consultas repetidas NÃO duplicam administradores nem criam usuários vazios", async () => {
    const { ctx } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);
    const initialUsers = await caller.admin.listUsers();

    // Simula logins e autenticações repetidas
    for (let i = 0; i < 3; i++) {
      await caller.admin.login({ email: adminEmail, password: adminPassword });
      await sdk.authenticateRequest({
        headers: { authorization: `Bearer ${adminSessionToken}` },
        cookies: {},
      } as any);
      await caller.auth.me();
    }

    const afterUsers = await caller.admin.listUsers();
    expect(afterUsers.length).toBe(initialUsers.length);
  });

  it("4. Bloqueio para usuário comum: não-administrador não pode acessar dados administrativos", async () => {
    const commonUser: TrpcContext["user"] = {
      id: 99999,
      openId: "user_common_qa",
      email: "comum@exemplo.com",
      name: "Usuário Comum QA",
      role: "user",
      loginMethod: "local-password",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const { ctx } = createMockContext(commonUser);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getMetrics()).rejects.toThrow("Acesso restrito a administradores.");
    await expect(caller.admin.listUsers()).rejects.toThrow("Acesso restrito a administradores.");
    await expect(caller.admin.listVouchers()).rejects.toThrow("Acesso restrito a administradores.");
    await expect(
      caller.admin.createVoucher({
        code: "HACK-VOUCHER",
        plan: "pro",
        days: 30,
        maxUses: 1,
      })
    ).rejects.toThrow("Acesso restrito a administradores.");
  });

  it("5. Dashboard administrativo: métricas e usuários carregam sem erros para admin", async () => {
    const { ctx } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.admin.getMetrics();
    expect(metrics).toBeDefined();
    expect(typeof metrics.usersCount).toBe("number");
    expect(typeof metrics.profilesCount).toBe("number");
    expect(typeof metrics.quotesCount).toBe("number");
    expect(typeof metrics.totalQuotedCents).toBe("number");
    expect(typeof metrics.demoMode).toBe("boolean");

    const usersList = await caller.admin.listUsers();
    expect(Array.isArray(usersList)).toBe(true);
    expect(usersList.length).toBeGreaterThanOrEqual(1);
  });

  const syntheticVoucherCode = "QA-ADMIN-20260929";
  let createdVoucherId: number;

  it("6. Listagem e Criação sintética de voucher: cria QA-ADMIN-20260929", async () => {
    const { ctx } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    // Listagem inicial de vouchers
    const initialList = await caller.admin.listVouchers();
    expect(Array.isArray(initialList.vouchers)).toBe(true);
    expect(Array.isArray(initialList.redemptions)).toBe(true);

    // Se já existia de teste anterior, limpamos apenas este voucher sintético
    const existing = initialList.vouchers.find((v) => v.code === syntheticVoucherCode);
    if (existing) {
      await caller.admin.deleteVoucher({ id: existing.id });
    }

    // Criação do voucher sintético
    const createResult = await caller.admin.createVoucher({
      code: syntheticVoucherCode,
      description: "Voucher sintético de homologação",
      plan: "pro",
      days: 7,
      maxUses: 1,
      isVipTotal: false,
    });

    expect(createResult.success).toBe(true);
    expect(createResult.code).toBe(syntheticVoucherCode);

    // Confirma que aparece na listagem
    const updatedList = await caller.admin.listVouchers();
    const found = updatedList.vouchers.find((v) => v.code === syntheticVoucherCode);
    expect(found).toBeDefined();
    expect(found?.code).toBe(syntheticVoucherCode);
    expect(found?.description).toBe("Voucher sintético de homologação");
    expect(found?.plan).toBe("pro");
    expect(found?.days).toBe(7);
    expect(found?.maxUses).toBe(1);
    expect(found?.usedCount).toBe(0);
    expect(found?.active).toBe(true);
    createdVoucherId = found!.id;
  });

  it("7. Ativação e Desativação do voucher sintético", async () => {
    const { ctx } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    // Desativa voucher
    const toggleOff = await caller.admin.toggleVoucher({
      id: createdVoucherId,
      active: false,
    });
    expect(toggleOff.success).toBe(true);

    // Verifica que está inativo
    let list = await caller.admin.listVouchers();
    let v = list.vouchers.find((item) => item.id === createdVoucherId);
    expect(v?.active).toBe(false);

    // Reativa voucher
    const toggleOn = await caller.admin.toggleVoucher({
      id: createdVoucherId,
      active: true,
    });
    expect(toggleOn.success).toBe(true);

    // Verifica que voltou a ser ativo
    list = await caller.admin.listVouchers();
    v = list.vouchers.find((item) => item.id === createdVoucherId);
    expect(v?.active).toBe(true);
  });

  it("8. Resgate de voucher com conta de QA e validação de benefícios", async () => {
    // Cria uma conta de QA para testar o resgate com perfil
    const qaEmail = `qa.voucher.${nanoid(6).toLowerCase()}@meuautonomo.com.br`;
    const { ctx: regCtx } = createMockContext();
    const publicCaller = appRouter.createCaller(regCtx);

    const regResult = await publicCaller.auth.register({
      name: "Tester QA Voucher",
      email: qaEmail,
      password: "SenhaQA@123456",
    });
    expect(regResult.success).toBe(true);

    savedQaUser = regResult.user;
    const { ctx: qaCtx } = createMockContext(savedQaUser);
    const qaCaller = appRouter.createCaller(qaCtx);

    // Cria perfil para o usuário QA
    const safeSlug1 = `qa-tester-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    await qaCaller.profile.upsert({
      displayName: "Tester QA",
      slug: safeSlug1,
      professionName: "Analista de Qualidade",
    });

    // Resgata o voucher sintético
    const redeemResult = await qaCaller.voucher.redeem({
      code: syntheticVoucherCode,
    });

    expect(redeemResult.success).toBe(true);
    expect(redeemResult.days).toBe(7);
    expect(redeemResult.isVipTotal).toBe(false);

    // Verifica status do perfil após resgate
    const status = await qaCaller.voucher.getStatus();
    expect(status?.isPro).toBe(true);
    expect(status?.plan).toBe("pro");
    expect(status?.daysRemaining).toBeGreaterThanOrEqual(6);

    // Confirma que o resgate aparece no histórico administrativo
    const { ctx: adminCtx } = createMockContext(adminUser);
    const adminCaller = appRouter.createCaller(adminCtx);
    const vouchersData = await adminCaller.admin.listVouchers();

    const voucherInList = vouchersData.vouchers.find((v) => v.id === createdVoucherId);
    expect(voucherInList?.usedCount).toBe(1);

    const redemptionInHistory = vouchersData.redemptions.find(
      (r) => r.voucherId === createdVoucherId && r.voucherCode === syntheticVoucherCode
    );
    expect(redemptionInHistory).toBeDefined();
    expect(redemptionInHistory?.userEmail).toBe(qaEmail);
  });

  it("9. Casos inválidos e bloqueio contra resgate duplicado / limite de uso", async () => {
    // 1. Mesmo usuário tentando resgatar novamente o mesmo voucher -> CONFLICT
    const { ctx: qaCtx } = createMockContext(savedQaUser);
    const qaCaller = appRouter.createCaller(qaCtx);

    await expect(
      qaCaller.voucher.redeem({ code: syntheticVoucherCode })
    ).rejects.toThrow("Você já resgatou este voucher anteriormente.");

    // 2. Outro usuário tentando resgatar voucher que tem maxUses=1 (já esgotado) -> BAD_REQUEST
    const otherEmail = `qa.other.${Date.now().toString(36)}@meuautonomo.com.br`;
    const regResult = await appRouter.createCaller(createMockContext().ctx).auth.register({
      name: "Outro Usuário QA",
      email: otherEmail,
      password: "SenhaQA@123456",
    });
    const otherUser = regResult.user;
    const { ctx: otherCtx } = createMockContext(otherUser);
    const otherCaller = appRouter.createCaller(otherCtx);

    const safeSlug2 = `outro-qa-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    await otherCaller.profile.upsert({
      displayName: "Outro QA",
      slug: safeSlug2,
      professionName: "Designer",
    });

    await expect(
      otherCaller.voucher.redeem({ code: syntheticVoucherCode })
    ).rejects.toThrow("Este voucher atingiu o limite máximo de resgates.");

    // 3. Código inexistente -> NOT_FOUND
    await expect(
      otherCaller.voucher.redeem({ code: "CODIGO-INEXISTENTE-999" })
    ).rejects.toThrow("Voucher não encontrado ou inativo.");
  });

  it("10. Logout: encerra sessão e limpa cookie", async () => {
    const { ctx, cookiesCleared } = createMockContext(adminUser);
    const caller = appRouter.createCaller(ctx);

    const logoutResult = await caller.auth.logout();
    expect(logoutResult.success).toBe(true);

    const clearedCookie = cookiesCleared.find((c) => c.name === COOKIE_NAME);
    expect(clearedCookie).toBeDefined();
  });

  afterAll(async () => {
    const fs = await import("fs");
    if (initialDbSnapshot) {
      fs.writeFileSync("server/data/db-store.json", initialDbSnapshot, "utf8");
    }
  });
});
