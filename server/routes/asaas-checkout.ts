import { Request, Response } from "express";
import { getDb } from "../db";
import { users, professionalProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";

const ASAAS_API_URL = "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

// Configuração oficial dos pacotes com QR Code e Copia e Cola gerados no Asaas
// Padrão idêntico ao Catecismo e Escola da Fé (sem necessidade de solicitar CPF ao usuário)
export const ASAAS_PLANS = {
  solo: {
    plan: "solo" as const,
    title: "MeuAutônomo PRO Individual – Vitalício",
    value: 59.9,
    paymentId: "pay_zhlfko0mdc480t69",
    invoiceUrl: "https://www.asaas.com/i/zhlfko0mdc480t69",
    payload: "00020101021226800014br.gov.bcb.pix2558pix.asaas.com/qr/cobv/b2cb693e-dfa7-47f6-a94a-641d9e4462ee5204000053039865802BR5924Murilo Ferreira da Silva6015Sao Bernardo do61080976105062070503***63041D9D",
    encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADh0lEQVR4Xu2XQW4cORAE+9b//9E+q29aRWQV2zKwkOE9uAwUZ4ZNZmbkHMgR7OvjN8c/18/Kr44lvxtLfjf+F/lcjvtz99y8UG42WgqYKm96yamkciFnTiLWxa4KO73kXBJJIlaeZuIdjVCnlxxOPsRzJwpt4QqPY27Jv4GshMvmq1ElTUvOJ5VliSXi3jIrSyOX9JJjSU48Z/4rr0ov+Z+vP0x+HXEMeO6PnRw9qx+CSw4lzZqo4Ef9stNRbV4DnFyIJceSWOx0kwP0ecS6ImfTv+wlx5FgGE37Nlq5rshXJJI7tORIEhtVJ/EkbQlT62RBl5xKVgbMJXRr6XUVh04LlhxK/qAjXoAERFxmd+6E+pJTyc4kZlGtXgWwr4fr9w4tOY00VE6yfixUiJRGQMeSQ0nsC6nFYlGqxS0Flie55FjSjGKO/cHJZKOqV+G0LjmXROmJ2QKF5K1lvNV3ftlLjiRhPk1jgZJy4TojTDJLjiXVnhN4quFQp7CqXC05lVQrFIe1EnRDNqQc7PEv9ZITSSS4MuEtIuUye7cKdi05mNQEv9OSB/PFMy1Pl6Ziyakkfo07tp8IhBRrcdQl38w88n79wL49+NwIrDyYn/6fzpLjyKweL4EzRZLs3hV9SaAtOZXE+HITNEjFouhDnr3GkqNJTP1y0xEmiGmmN7rkUDIeZtKE3UXB5aVZRXyWHEp2osSGzF1YvcvPvuclh5J10Ni3Uxw2VjZNE+XJLjmWvCKydRSnhHVoFme35GAy+6qI9RniSYFCqlW5D0tOJot56rzPwk72aW8Te8mxZI5cGscuD122meTONyw5lYxwIn3uJG9w5yxyDwwuOZbkvAOJc85GIrHoluIZS04lSyUMCCVJ0EYeaUhGdMmhJA4atudcwegpFRHiqbHkVPLRUfSX3UR1qBLpgZqbsORE0iQF9RTuHrvortaEnx/v0JKjyM9lqcSztSRVeNQE9yO85FCSbC5CpGR6dGnqmayvv9RLDiQJ864UBWZrJ57STrBeci7pYG9FSvKwJ4s0na9ZcigZifPNVEhTvbptP6slx5KlMb2cF6MEeGtP6ZV/SS05kiy/kuGw64qEt/PVlhxPminfpTfkRcPoL/l3kN4CFB/G6llucc/XX/aSo8iPTnvaPqrgsvX0pSrFS04liV+ILaMQr6QJZTPJLTmV/M2x5Hdjye/GHyH/BVAfLbkLV973AAAAAElFTkSuQmCC",
  },
  team: {
    plan: "team" as const,
    title: "MeuAutônomo PRO Equipe & Estúdio – Vitalício",
    value: 99.9,
    paymentId: "pay_44zhds3co79fyqe4",
    invoiceUrl: "https://www.asaas.com/i/44zhds3co79fyqe4",
    payload: "00020101021226800014br.gov.bcb.pix2558pix.asaas.com/qr/cobv/05bf6317-f01e-4d1e-a578-0f7e98c8c9095204000053039865802BR5924Murilo Ferreira da Silva6015Sao Bernardo do61080976105062070503***63041762",
    encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADjElEQVR4Xu2XwW7bMBBEedP//1E/izfX82aWcgIUDtJDNsDSFsWdnTc6kHKb9fjm+LM+K18dQ74bQ74b/0XuxbhU7nXtS8qz8qKWdLUs95BdSTOXqICXqkPRWAks95B9SUlFuDSCx3Zr1ZZvyOYkHnkP6prEZPEZ8leQD219lsU70YqThuxPItvh7uIN9kqRqtHks3vItqR23Hv+lU/cQ/7z88PkGVsCHfUv73tWnAedkjOGbEre3iwfebNdOFI4NHeFDtmUVOM67ToQLJznkQe43H6zh+xIstLOY+Qmh2czFcH5UP/8JgzZkBR4J8RyiZETJuvYVp2EIduR6vHWIgDZQemcwIrDft2/8UP2I6/Ya5YXjAK7EQLIGLIt6V4w7GqJx5IYtStS6pBNybS5b5+DVIZyNNxzuMaQTUmX+yOi8nZJwrB1DBav+JBNSRrBiVCvJkmO1VJCYoZsS0rBI7v2XjaWSSSS7XcE/JBdyafJAF0guwPQ9IHhi2fIrmQB1tWXUuBlIV178Q3Zl0zrQScraTdEAjlg2/9mD9mQ9EhNFwbvpU/d4stThuxKeocPSssHIjZSEnoihmxKbv36+he42lxHS7QXRx2yLemtvu8C+bLxHI87lnnnN37IfmT1bd611QpSFLJWyru1IXuTxb9WzA5yrK8hW5ObLVZfq7hxoJmqIyCNqCHbkjQeMLLLXHHGRDkqQbqGbEqacxN+cRTqupWEZx6yKbn9AqPJUwHEuUsHl5+gZw3ZlaRcmrGHYbabu+N0dzVkU9LW6BC0ntM5Ik4gfdVDhuxLqoE7+y13ZblWSCSHDdmWzFpd06SIMhKGQ3AOx5BdSZXSBEki6ERYlsGK04bsS6ZfzqWe7aiqPd+8xpBtSTvtSkZEYG5OOIFDtiXlQUfDr6XPBFboGJKYv3SGbEliPReNUq0B18AzZFeyjLKehmpWYM+1Cghc23/pDNmQ3HfbDkUk7UaJssGPGLIpKS8HIKw9VjSJvOPPI4bsSj6On03mANhom1MT79blkzBkT5IR8pjVVh4+x0XTd8iupCW2XpDNbDdUSYp7WQ3ZlozmK2UppIknG0pRy/+TGrIlmT6q9Gr7gLCCLm3pBR/yN5CoqnMcvDb6kjTkbyDF4n61CVZPbixa7U9v9pCdyLgRdImzb5Fqi8vih2xLnl03qzuGSFq5bSHikE3Jb44h340h340fIf8CbeG9KUGkMBgAAAAASUVORK5CYII=",
  },
};

// Armazena a intenção de compra recente por userId
const pendingUserCheckouts = new Map<number, { plan: "solo" | "team"; timestamp: number }>();

/**
 * POST /api/asaas/create-pix
 * Body: { plan: "solo" | "team" }
 * Retorna os dados oficiais do PIX na hora (sem solicitar CPF ao usuário)
 */
export async function createPixPayment(req: Request, res: Response) {
  try {
    const plan = req.body?.plan as "solo" | "team";
    if (!plan || !ASAAS_PLANS[plan]) {
      return res.status(400).json({ error: "Plano inválido. Use 'solo' ou 'team'." });
    }

    // Registra a intenção para o usuário logado (se autenticado)
    try {
      const authUser = await sdk.authenticateRequest(req as any);
      if (authUser?.id) {
        pendingUserCheckouts.set(authUser.id, { plan, timestamp: Date.now() });
      }
    } catch {
      // continua mesmo sem sessão rígida
    }

    const planData = ASAAS_PLANS[plan];

    return res.status(200).json({
      paymentId: planData.paymentId,
      invoiceUrl: planData.invoiceUrl,
      encodedImage: planData.encodedImage,
      payload: planData.payload,
    });
  } catch (error: any) {
    console.error("[Asaas CreatePix Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao carregar PIX." });
  }
}

/**
 * GET /api/asaas/payment-status/:paymentId
 * Consulta se o usuário logado já teve o plano ativado ou se o Asaas confirmou
 */
export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    // 1. Verifica se o usuário atual já está Pro no banco
    try {
      const authUser = await sdk.authenticateRequest(req as any);
      if (authUser?.id) {
        const db = await getDb();
        const profiles = await db
          .select({ isPro: professionalProfiles.isPro, plan: professionalProfiles.plan })
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, authUser.id))
          .limit(1);

        if (profiles.length > 0 && profiles[0].isPro) {
          return res.status(200).json({
            status: "CONFIRMED",
            confirmed: true,
            plan: profiles[0].plan,
          });
        }
      }
    } catch {}

    // 2. Fallback: consulta API do Asaas se a chave estiver presente
    if (paymentId && ASAAS_API_KEY) {
      try {
        const resAsaas = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
          headers: { access_token: ASAAS_API_KEY },
        });
        if (resAsaas.ok) {
          const payment = await resAsaas.json();
          const confirmed =
            payment.status === "RECEIVED" ||
            payment.status === "CONFIRMED" ||
            payment.status === "RECEIVED_IN_CASH";

          return res.status(200).json({
            status: payment.status,
            confirmed,
            value: payment.value,
          });
        }
      } catch {}
    }

    return res.status(200).json({ status: "PENDING", confirmed: false });
  } catch (error: any) {
    console.error("[Asaas PaymentStatus Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao consultar status." });
  }
}
