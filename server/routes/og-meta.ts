import express from "express";
import fs from "fs";
import path from "path";
import { getProfileBySlug } from "../db";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

let cachedIndexHtml: string | null = null;
const profileCache = new Map<string, { data: any; expiresAt: number }>();

function findIndexHtml(): string | null {
  if (cachedIndexHtml) return cachedIndexHtml;
  const possiblePaths = [
    path.resolve(process.cwd(), "dist/public/index.html"),
    path.resolve(process.cwd(), "public/index.html"),
    path.resolve(process.cwd(), "client/index.html"),
    path.resolve(__dirname, "../../dist/public/index.html"),
    path.resolve(__dirname, "../public/index.html"),
    path.resolve(__dirname, "public/index.html"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        cachedIndexHtml = fs.readFileSync(p, "utf-8");
        return cachedIndexHtml;
      } catch (err) {
        console.error("[OG Meta] Erro ao ler index.html em", p, err);
      }
    }
  }
  return null;
}

async function getCachedProfile(slug: string) {
  const cached = profileCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const fresh = await getProfileBySlug(slug);
  if (fresh) {
    profileCache.set(slug, { data: fresh, expiresAt: Date.now() + 5 * 60 * 1000 });
  }
  return fresh;
}

export function registerOgMetaRoutes(app: express.Express) {
  // 0. Rota Otimizada para Crawlers Sociais (WhatsApp, Facebook, Twitter, Telegram, etc.)
  app.get("/api/og-preview", async (req, res) => {
    const slug = (req.query.slug as string || "").trim();
    const host = req.get("x-forwarded-host") || req.get("host") || "meuautonomo.creativeam.com.br";
    const protocol = req.get("x-forwarded-proto") || "https";
    const siteUrl = `${protocol}://${host}`;

    if (!slug) {
      return res.redirect("/");
    }

    try {
      // Timeout seguro de 2.5s para garantir que nunca trave
      const profilePromise = getCachedProfile(slug);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const profile = await Promise.race([profilePromise, timeoutPromise]);

      const name = profile?.displayName || "Profissional";
      const profession = profile?.professionName || "Atendimento Profissional";
      const safeName = escapeHtml(name);
      const safeProfession = escapeHtml(profession);
      const title = `${safeName} — ${safeProfession} | Cartão Profissional`;
      const description = escapeHtml(
        profile?.bio ||
        `Confira os serviços, valores e solicite seu agendamento direto com ${name} (${profession}).`
      );
      const pageUrl = `${siteUrl}/p/${encodeURIComponent(slug)}`;

      let ogImageUrl = `${siteUrl}/pwa-512.png`;
      if (profile?.avatarUrl && profile.avatarUrl.startsWith("http")) {
        ogImageUrl = profile.avatarUrl;
      } else if (profile?.avatarUrl && profile.avatarUrl.startsWith("/")) {
        ogImageUrl = `${siteUrl}${profile.avatarUrl}`;
      }

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="profile" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="${safeName} — Cartão Profissional" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:secure_url" content="${ogImageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#fbfcf9;">
  <p>Carregando cartão de <strong>${safeName}</strong>...</p>
  <p><a href="${pageUrl}">Clique aqui se não for redirecionado automaticamente</a></p>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
      return res.send(html);
    } catch (err) {
      console.error("[OG Preview Error]:", err);
      return res.redirect(`/p/${encodeURIComponent(slug)}`);
    }
  });
  // 1. Rota de Imagem de Prévia Social do Profissional (1200x630)
  app.get("/api/og/card/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const profile = await getProfileBySlug(slug);
      const name = profile?.displayName || "Profissional Autônomo";
      const profession = profile?.professionName || "Cartão Profissional";
      const initial = name.charAt(0).toUpperCase();

      const safeName = escapeXml(name);
      const safeProfession = escapeXml(profession);

      const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12352f"/>
      <stop offset="60%" stop-color="#173a34"/>
      <stop offset="100%" stop-color="#0c201d"/>
    </linearGradient>
  </defs>
  
  <!-- Fundo com gradiente elegante -->
  <rect width="1200" height="630" fill="url(#cardBg)"/>
  
  <!-- Formas decorativas orgânicas -->
  <circle cx="1120" cy="90" r="260" fill="#d9f56a" fill-opacity="0.08"/>
  <circle cx="80" cy="560" r="220" fill="#d9f56a" fill-opacity="0.05"/>
  
  <!-- Selo superior do Cartão -->
  <rect x="90" y="80" width="240" height="46" rx="23" fill="#d9f56a" fill-opacity="0.15"/>
  <text x="210" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#d9f56a" text-anchor="middle" letter-spacing="1.5">CARTÃO OFICIAL</text>

  <!-- Avatar com inicial de destaque -->
  <rect x="90" y="160" width="120" height="120" rx="34" fill="#d9f56a"/>
  <text x="150" y="242" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#173a34" text-anchor="middle">${initial}</text>

  <!-- Nome do Profissional -->
  <text x="90" y="345" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${safeName}</text>

  <!-- Profissão / Ramo de Atuação -->
  <text x="90" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="700" fill="#d9f56a">${safeProfession}</text>

  <!-- Botão de Ação / Chamada -->
  <rect x="90" y="480" width="480" height="66" rx="20" fill="#d9f56a"/>
  <text x="330" y="522" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#173a34" text-anchor="middle">Agende seu atendimento online →</text>

  <!-- Assinatura da plataforma -->
  <text x="1110" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#ffffff" fill-opacity="0.45" text-anchor="end">MeuAutônomo</text>
</svg>`.trim();

      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(svg);
    } catch (err) {
      console.error("[OG Image Error]:", err);
      return res.status(500).send("Error generating card image");
    }
  });

  // 2. Rota SSR para Prévia do WhatsApp/Redes Sociais (/p/:slug)
  app.get("/p/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const profile = await getCachedProfile(slug);
      const html = findIndexHtml();

      if (!html) {
        return res.redirect("/");
      }

      if (!profile) {
        return res.send(html);
      }

      const host = req.get("x-forwarded-host") || req.get("host") || "meuautonomo.creativeam.com.br";
      const protocol = req.get("x-forwarded-proto") || "https";
      const siteUrl = `${protocol}://${host}`;
      const pageUrl = `${siteUrl}/p/${encodeURIComponent(profile.slug)}`;

      const safeName = escapeHtml(profile.displayName || "Profissional");
      const safeProfession = escapeHtml(profile.professionName || "Atendimento Profissional");
      const title = `${safeName} — ${safeProfession} | Cartão Profissional`;
      const description = escapeHtml(
        profile.bio ||
        `Confira os serviços, valores e solicite seu agendamento direto com ${profile.displayName} (${profile.professionName || "Profissional"}).`
      );

      // Imagem de prévia do WhatsApp e Redes Sociais
      let ogImageUrl = "";
      if (profile.avatarUrl && profile.avatarUrl.startsWith("http")) {
        ogImageUrl = profile.avatarUrl;
      } else if (profile.avatarUrl && profile.avatarUrl.startsWith("/")) {
        ogImageUrl = `${siteUrl}${profile.avatarUrl}`;
      } else {
        ogImageUrl = `${siteUrl}/api/og/card/${encodeURIComponent(profile.slug)}`;
      }

      const ogTags = `
    <!-- Metatags do Profissional (WhatsApp, Facebook, Instagram, Twitter, Google) -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="profile" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="${safeName} — Cartão Profissional" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:alt" content="${safeName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
      `.trim();

      const preloadedScript = `<script>window.__PRELOADED_PROFILE__ = ${JSON.stringify(profile)};</script>`;

      // Substitui title e description padrão pelas informações do profissional e injeta preload
      let personalizedHtml = html
        .replace(/<title>.*?<\/title>/i, "")
        .replace(/<meta\s+name=["']description["'].*?>/i, "")
        .replace("</head>", `  ${ogTags}\n  ${preloadedScript}\n  </head>`);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      // Cache global na CDN da Vercel (Edge) por até 24h e revalidação assíncrona instantânea
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
      return res.send(personalizedHtml);
    } catch (err) {
      console.error("[OG Route Error]:", err);
      const fallbackHtml = findIndexHtml();
      if (fallbackHtml) return res.send(fallbackHtml);
      return res.redirect("/");
    }
  });
}
