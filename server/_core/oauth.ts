import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { isDemoMode } from "../demoConfig";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/app");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Rota de Teste Local / Demonstração (Permite entrar no /app sem OAuth externo)
  app.get("/api/dev-login", async (req: Request, res: Response) => {
    if (!isDemoMode()) {
      res.redirect("/?login=true");
      return;
    }
    try {
      const devOpenId = "dev-user-local";
      let devName = "Profissional Autônomo";
      let devEmail = "contato@meuautonomo.com.br";

      const database = await db.getDb();
      if (database) {
        try {
          const { professionalProfiles } = await import("../../drizzle/schema");
          const existingProfile = (await database.select().from(professionalProfiles).limit(1))[0];
          if (existingProfile?.displayName) {
            devName = existingProfile.displayName;
          }
        } catch (e) {
          console.warn("[OAuth dev-login] Usando nome padrão:", e);
        }
      }

      await db.upsertUser({
        openId: devOpenId,
        name: devName,
        email: devEmail,
        loginMethod: "local-dev",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(devOpenId, {
        name: devName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Entrando no MeuAutônomo...</title>
</head>
<body style="font-family: sans-serif; display: grid; min-height: 100vh; place-items: center; background: #f5f7f2; color: #173a34;">
  <p style="font-weight: bold;">Carregando seu espaço de teste...</p>
  <script>
    try {
      sessionStorage.setItem("manus-cookie", ${JSON.stringify(sessionToken)});
    } catch (e) {}
    window.location.replace("/app");
  </script>
</body>
</html>`);
    } catch (error) {
      console.error("[DevLogin] Failed:", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
}
