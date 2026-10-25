import { afterAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";

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

describe("Fluxo Completo de Autenticação - MeuAutônomo", () => {
  const testEmail = `teste.qa.${nanoid(8).toLowerCase()}@exemplo.com`;
  const testPassword = "SenhaSegura@123";
  const testName = "Profissional Teste QA";

  it("1. Cadastro válido: cria conta, define cookie e retorna sessionToken", async () => {
    const { ctx, cookiesSet } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.sessionToken).toBeTruthy();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.name).toBe(testName);

    // Verifica se o cookie de sessão foi gravado com as opções de segurança
    expect(cookiesSet.length).toBeGreaterThanOrEqual(1);
    const sessionCookie = cookiesSet.find((c) => c.name === COOKIE_NAME);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe(result.sessionToken);
    expect(sessionCookie?.options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("2. Cadastro duplicado: rejeita com erro CONFLICT amigável e inteligível", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: testName,
        email: testEmail,
        password: testPassword,
      })
    ).rejects.toThrow("Já existe uma conta cadastrada com este e-mail");
  });

  it("3. Validação de senha curta (< 6 caracteres): rejeita antes de salvar", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Outro Nome",
        email: `novo.${nanoid(6)}@exemplo.com`,
        password: "123",
      })
    ).rejects.toThrow("A senha deve ter no mínimo 6 caracteres.");
  });

  it("4. Validação de e-mail inválido: rejeita formato incorreto", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({
        name: "Outro Nome",
        email: "email-invalido-sem-arroba",
        password: "senha-valida-123",
      })
    ).rejects.toThrow("Informe um e-mail válido.");
  });

  it("5. Login com credenciais válidas: autentica e gera novo token de sessão", async () => {
    const { ctx, cookiesSet } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.sessionToken).toBeTruthy();
    expect(result.user.email).toBe(testEmail);

    const sessionCookie = cookiesSet.find((c) => c.name === COOKIE_NAME);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe(result.sessionToken);
  });

  it("6. Login com senha incorreta: rejeita com mensagem segura", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: testEmail,
        password: "senha_errada_com_certeza",
      })
    ).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("7. Login com e-mail inexistente: rejeita com a mesma mensagem neutra e segura", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "usuario.inexistente.999@exemplo.com",
        password: "qualquer_senha",
      })
    ).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("8. Procedimento auth.me não autenticado: retorna null sem estourar erro", async () => {
    const { ctx } = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("9. Procedimento auth.me autenticado: retorna dados do usuário logado", async () => {
    const fakeUser = {
      id: 9999,
      openId: "user_test_9999",
      name: "Usuário Logado",
      email: "logado@exemplo.com",
      passwordHash: null,
      loginMethod: "local-password",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const { ctx } = createMockContext(fakeUser);
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.email).toBe("logado@exemplo.com");
    expect(user?.name).toBe("Usuário Logado");
  });

  it("10. Segurança e Privacidade: listUsers NUNCA vaza contas para usuários públicos", async () => {
    const { ctx } = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    const users = await caller.auth.listUsers();
    expect(users).toEqual([]);
  });

  it("11. isDemoMode permanece false para ambiente de produção", async () => {
    const { ctx } = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    const demo = await caller.auth.isDemoMode();
    expect(demo).toBe(false);
  });

  it("12. Logout: limpa o cookie de sessão com sucesso", async () => {
    const { ctx, cookiesCleared } = createMockContext({
      id: 1,
      openId: "usr_1",
      email: "a@a.com",
      name: "A",
      passwordHash: null,
      loginMethod: "local-password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    const caller = appRouter.createCaller(ctx);

    const res = await caller.auth.logout();
    expect(res.success).toBe(true);
    expect(cookiesCleared).toHaveLength(1);
    expect(cookiesCleared[0]?.name).toBe(COOKIE_NAME);
  });

  afterAll(async () => {
    const fs = await import("fs");
    if (fs.existsSync("server/data/db-store.json")) {
      const data = JSON.parse(fs.readFileSync("server/data/db-store.json", "utf8"));
      data.users = data.users.filter((u: any) => !u.email?.includes("teste.qa.") && !u.email?.includes("qa.") && u.openId !== "admin_master");
      fs.writeFileSync("server/data/db-store.json", JSON.stringify(data, null, 2), "utf8");
    }
  });
});
