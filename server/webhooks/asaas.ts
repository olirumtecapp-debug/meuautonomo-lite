import { Request, Response } from "express";
import { getDb } from "../db";
import { professionalProfiles, notifications } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function handleAsaasWebhook(req: Request, res: Response) {
  try {
    const event = req.body?.event;
    const payment = req.body?.payment;

    console.log(`[Asaas Webhook] Recebido evento: ${event} para o pagamento:`, payment?.id);

    if (!payment) {
      return res.status(400).json({ error: "Dados de pagamento ausentes." });
    }

    const db = await getDb();
    const externalRef = payment.externalReference; // Pode ser o userId ou o profileId
    const customerId = payment.customer;
    const paymentId = payment.id;
    const value = Number(payment.value || payment.netValue || 0);

    // Identifica se é plano Solo ou Equipe pelo valor ou descrição
    const isTeamPlan = value >= 70 || (payment.description || "").toLowerCase().includes("equipe");
    const targetPlan = isTeamPlan ? "team" : "pro";

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      console.log(`[Asaas Webhook] Ativando plano ${targetPlan} (isPro = true) para ref:`, externalRef);

      let profileUpdated = false;

      // 1. Tenta atualizar pelo externalReference (userId)
      if (externalRef && !isNaN(Number(externalRef))) {
        const userId = Number(externalRef);
        await db
          .update(professionalProfiles)
          .set({
            plan: targetPlan,
            isPro: true,
            asaasCustomerId: customerId,
            asaasPaymentId: paymentId,
            updatedAt: new Date(),
          })
          .where(eq(professionalProfiles.userId, userId));

        profileUpdated = true;

        // Cria notificação amigável para o profissional
        await db.insert(notifications).values({
          profileId: 1, // Fallback se profileId não for conhecido diretamente
          type: "pagamento_aprovado",
          title: `🎉 Plano ${isTeamPlan ? "PRO Equipe" : "PRO Solo"} Ativado!`,
          body: `Seu pagamento via PIX no valor de R$ ${value.toFixed(2)} foi confirmado pelo Asaas. Todos os recursos vitais já estão liberados sem limites!`,
          read: false,
        });
      } else {
        // Se não tiver externalReference, atualiza o perfil padrão ou primeiro perfil
        await db
          .update(professionalProfiles)
          .set({
            plan: targetPlan,
            isPro: true,
            asaasCustomerId: customerId,
            asaasPaymentId: paymentId,
            updatedAt: new Date(),
          });
      }

      return res.status(200).json({
        success: true,
        message: `Plano ${targetPlan} liberado com sucesso via Webhook Asaas.`,
      });
    }

    if (event === "PAYMENT_REFUNDED") {
      console.log(`[Asaas Webhook] Processando estorno (Art. 49 CDC) para ref:`, externalRef);

      if (externalRef && !isNaN(Number(externalRef))) {
        const userId = Number(externalRef);
        await db
          .update(professionalProfiles)
          .set({
            plan: "free",
            isPro: false,
            updatedAt: new Date(),
          })
          .where(eq(professionalProfiles.userId, userId));
      } else {
        await db
          .update(professionalProfiles)
          .set({
            plan: "free",
            isPro: false,
            updatedAt: new Date(),
          });
      }

      return res.status(200).json({
        success: true,
        message: "Estorno confirmado. Conta revertida para o plano gratuito.",
      });
    }

    // Demais eventos (ex: PAYMENT_CREATED, PAYMENT_OVERDUE)
    return res.status(200).json({ received: true, event });
  } catch (error: any) {
    console.error("[Asaas Webhook Error]:", error);
    return res.status(500).json({ error: error.message || "Erro interno no webhook." });
  }
}
