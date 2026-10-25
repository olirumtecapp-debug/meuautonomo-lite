/**
 * Regras de Domínio Centralizadas para Faturamento, Receitas, Comissões e Status
 * Projeto: MeuAutônomo
 * 
 * Regra Única de Domínio:
 * - Faturamento: Valor dos atendimentos faturáveis (confirmado, concluído, andamento, agendado) + receitas avulsas.
 * - Recebido: Pagamentos com status 'pago' vinculados a atendimentos ou avulsos (ou atendimentos concluídos/pagos diretamente).
 * - Pendente: Faturamento faturável menos o valor já recebido.
 * - Comissão de Parceiro: Calculada sobre o valor faturável do atendimento realizado pelo parceiro:
 *     comissao = valorFaturavel * (percentualComissao / 100)
 *     retencaoEstudio = valorFaturavel - comissao
 * - Deduplicação Absoluta: Um pagamento registrado para um atendimento NÃO duplica o faturamento.
 *   Duplicidade = 0.
 */

export const BILLABLE_APPOINTMENT_STATUSES = ["agendado", "confirmado", "andamento", "concluido"] as const;
export const NON_BILLABLE_APPOINTMENT_STATUSES = ["cancelado", "faltou"] as const;

export type AppointmentStatus = typeof BILLABLE_APPOINTMENT_STATUSES[number] | typeof NON_BILLABLE_APPOINTMENT_STATUSES[number];

export function isBillableAppointment(status: string): boolean {
  return status !== "cancelado" && status !== "faltou";
}

export function isCountableAppointment(status: string): boolean {
  return status !== "cancelado" && status !== "faltou";
}

export function isCommissionEligible(status: string): boolean {
  return status !== "cancelado" && status !== "faltou";
}

export function calculateCommissionAndStudio(amountCents: number, commissionPercent: number): {
  commissionCents: number;
  studioCents: number;
} {
  const safePercent = Math.max(0, Math.min(100, Math.round(commissionPercent)));
  const commissionCents = Math.round((amountCents * safePercent) / 100);
  const studioCents = amountCents - commissionCents;
  return { commissionCents, studioCents };
}

export interface AppointmentRecord {
  id: number;
  profileId: number;
  clientId?: number | null;
  serviceId?: number | null;
  teamMemberId?: number | null;
  startsAt: Date | string;
  durationMinutes: number;
  amountCents: number;
  status: string;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
}

export interface PaymentRecord {
  id: number;
  profileId: number;
  appointmentId?: number | null;
  clientId?: number | null;
  serviceId?: number | null;
  teamMemberId?: number | null;
  amountCents: number;
  status: "pago" | "pendente" | "parcial" | string;
  method?: string | null;
  commissionPercent?: number | null;
  commissionAmountCents?: number | null;
  studioAmountCents?: number | null;
  paidAt?: Date | string | null;
  createdAt: Date | string;
}

export interface TeamMemberRecord {
  id: number;
  profileId: number;
  name: string;
  role?: string | null;
  commissionPercent: number;
  active?: boolean;
}

export interface ExpenseRecord {
  id: number;
  amountCents: number;
  occurredAt?: Date | string | null;
}

export interface DomainFinancialSummary {
  revenueCents: number;
  receivedCents: number;
  pendingCents: number;
  expensesCents: number;
  balanceCents: number;
  appointmentCount: number;
  topServices: { serviceId: number; count: number; name: string }[];
}

export interface TeamMemberBreakdown {
  member: TeamMemberRecord;
  count: number;
  grossCents: number;
  receivedCents: number;
  commissionCents: number;
  studioCents: number;
  commissionPercent: number;
}

export interface TeamFinancialReport {
  totalGrossCents: number;
  totalReceivedCents: number;
  totalCommissionCents: number;
  totalStudioNetCents: number;
  totalExpensesCents: number;
  finalProfitCents: number;
  breakdown: TeamMemberBreakdown[];
  payments: PaymentRecord[];
}

/**
 * Calcula faturamento, valores recebidos e pendentes com deduplicação estrita.
 */
export function calculateDeduplicatedMetrics(
  appointments: AppointmentRecord[],
  payments: PaymentRecord[],
  expenses: ExpenseRecord[] = []
): {
  faturamentoCents: number;
  recebidoCents: number;
  pendenteCents: number;
  despesasCents: number;
  saldoCents: number;
  appointmentCount: number;
} {
  const billableApps = appointments.filter(a => isBillableAppointment(a.status));
  const appointmentCount = appointments.filter(a => isCountableAppointment(a.status)).length;

  // Mapear pagamentos vinculados a cada agendamento
  const paymentsByAppId = new Map<number, PaymentRecord[]>();
  const unlinkedPayments: PaymentRecord[] = [];

  // Primeiro passo: agrupar por appointmentId explícito
  const explicitlyLinkedPaymentIds = new Set<number>();
  for (const pay of payments) {
    if (pay.appointmentId) {
      if (!paymentsByAppId.has(pay.appointmentId)) {
        paymentsByAppId.set(pay.appointmentId, []);
      }
      paymentsByAppId.get(pay.appointmentId)!.push(pay);
      explicitlyLinkedPaymentIds.add(pay.id);
    }
  }

  // Segundo passo: para pagamentos sem appointmentId explícito, associar por clientId/serviceId
  for (const pay of payments) {
    if (explicitlyLinkedPaymentIds.has(pay.id)) continue;

    let matchedApp: AppointmentRecord | undefined;
    if (pay.clientId) {
      matchedApp = billableApps.find(a => 
        a.clientId === pay.clientId && 
        (!paymentsByAppId.has(a.id) || paymentsByAppId.get(a.id)!.length === 0) &&
        (pay.serviceId ? a.serviceId === pay.serviceId : true)
      );
    }

    if (matchedApp) {
      if (!paymentsByAppId.has(matchedApp.id)) {
        paymentsByAppId.set(matchedApp.id, []);
      }
      paymentsByAppId.get(matchedApp.id)!.push(pay);
    } else {
      unlinkedPayments.push(pay);
    }
  }

  let faturamentoCents = 0;
  let recebidoCents = 0;
  let pendenteCents = 0;

  // Processar cada atendimento faturável
  for (const app of billableApps) {
    const appGross = app.amountCents || 0;
    faturamentoCents += appGross;

    const linkedPays = paymentsByAppId.get(app.id) || [];
    if (linkedPays.length > 0) {
      const paidSum = linkedPays.filter(p => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0);
      const appReceived = Math.min(appGross, paidSum);
      recebidoCents += appReceived;
      pendenteCents += Math.max(0, appGross - appReceived);
    } else {
      // Sem pagamentos registrados na tabela de pagamentos
      if (app.paymentStatus === "pago" || app.status === "concluido") {
        recebidoCents += appGross;
      } else {
        pendenteCents += appGross;
      }
    }
  }

  // Processar pagamentos avulsos (receitas manuais que não possuem atendimento correspondente)
  for (const pay of unlinkedPayments) {
    faturamentoCents += pay.amountCents;
    if (pay.status === "pago") {
      recebidoCents += pay.amountCents;
    } else {
      pendenteCents += pay.amountCents;
    }
  }

  const despesasCents = expenses.reduce((sum, e) => sum + (e.amountCents || 0), 0);
  const saldoCents = recebidoCents - despesasCents;

  return {
    faturamentoCents,
    recebidoCents,
    pendenteCents,
    despesasCents,
    saldoCents,
    appointmentCount,
  };
}

/**
 * Calcula a produção e o repasse de comissão por parceiro da equipe.
 */
export function calculateTeamReport(
  members: TeamMemberRecord[],
  appointments: AppointmentRecord[],
  payments: PaymentRecord[],
  expenses: ExpenseRecord[] = []
): TeamFinancialReport {
  const billableApps = appointments.filter(a => isCommissionEligible(a.status));

  // Mapear pagamentos vinculados
  const paymentsByAppId = new Map<number, PaymentRecord[]>();
  const unlinkedPayments: PaymentRecord[] = [];

  const explicitlyLinkedPaymentIds = new Set<number>();
  for (const pay of payments) {
    if (pay.appointmentId) {
      if (!paymentsByAppId.has(pay.appointmentId)) {
        paymentsByAppId.set(pay.appointmentId, []);
      }
      paymentsByAppId.get(pay.appointmentId)!.push(pay);
      explicitlyLinkedPaymentIds.add(pay.id);
    }
  }

  for (const pay of payments) {
    if (explicitlyLinkedPaymentIds.has(pay.id)) continue;

    let matchedApp: AppointmentRecord | undefined;
    if (pay.clientId) {
      matchedApp = billableApps.find(a => 
        a.clientId === pay.clientId && 
        (!paymentsByAppId.has(a.id) || paymentsByAppId.get(a.id)!.length === 0) &&
        (pay.serviceId ? a.serviceId === pay.serviceId : true)
      );
    }

    if (matchedApp) {
      if (!paymentsByAppId.has(matchedApp.id)) {
        paymentsByAppId.set(matchedApp.id, []);
      }
      paymentsByAppId.get(matchedApp.id)!.push(pay);
    } else {
      unlinkedPayments.push(pay);
    }
  }

  // Lista consolidada de lançamentos financeiros deduplicados
  const consolidatedPayments: PaymentRecord[] = [];

  for (const app of billableApps) {
    const linkedPays = paymentsByAppId.get(app.id) || [];
    const effectiveTeamMemberId = app.teamMemberId || linkedPays.find(p => p.teamMemberId)?.teamMemberId || null;
    const member = members.find(m => m.id === effectiveTeamMemberId);
    const commPct = member?.commissionPercent ?? 50;
    const commAmount = Math.round(((app.amountCents || 0) * commPct) / 100);
    const studioAmount = (app.amountCents || 0) - commAmount;

    let isPaid = app.paymentStatus === "pago" || app.status === "concluido";
    let paidSum = 0;
    if (linkedPays.length > 0) {
      paidSum = linkedPays.filter(p => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0);
      isPaid = isPaid || paidSum >= app.amountCents;
    }

    consolidatedPayments.push({
      id: linkedPays[0]?.id || -app.id,
      profileId: app.profileId,
      appointmentId: app.id,
      clientId: app.clientId,
      serviceId: app.serviceId,
      teamMemberId: effectiveTeamMemberId,
      amountCents: app.amountCents,
      commissionPercent: commPct,
      commissionAmountCents: commAmount,
      studioAmountCents: studioAmount,
      status: isPaid ? "pago" : "pendente",
      method: linkedPays[0]?.method || app.paymentMethod || "pix",
      createdAt: linkedPays[0]?.createdAt || app.startsAt,
    });
  }

  // Adicionar pagamentos avulsos
  for (const pay of unlinkedPayments) {
    consolidatedPayments.push(pay);
  }

  // Agrupar por parceiro
  const breakdown: TeamMemberBreakdown[] = members.map(m => {
    const memberItems = consolidatedPayments.filter(p => p.teamMemberId === m.id);
    const grossCents = memberItems.reduce((sum, p) => sum + (p.amountCents || 0), 0);
    const receivedCents = memberItems.filter(p => p.status === "pago").reduce((sum, p) => sum + (p.amountCents || 0), 0);

    // A comissão é calculada sobre o faturamento do parceiro
    const commissionCents = memberItems.reduce((sum, p) => {
      if (p.commissionAmountCents !== undefined && p.commissionAmountCents !== null && p.commissionAmountCents > 0) {
        return sum + p.commissionAmountCents;
      }
      return sum + Math.round(((p.amountCents || 0) * m.commissionPercent) / 100);
    }, 0);

    const studioCents = grossCents - commissionCents;
    const count = memberItems.filter(p => p.appointmentId).length;

    return {
      member: m,
      count,
      grossCents,
      receivedCents,
      commissionCents,
      studioCents,
      commissionPercent: m.commissionPercent,
    };
  });

  const totalGrossCents = breakdown.reduce((sum, b) => sum + b.grossCents, 0);
  const totalReceivedCents = breakdown.reduce((sum, b) => sum + b.receivedCents, 0);
  const totalCommissionCents = breakdown.reduce((sum, b) => sum + b.commissionCents, 0);
  const totalStudioNetCents = totalGrossCents - totalCommissionCents;
  const totalExpensesCents = expenses.reduce((sum, e) => sum + (e.amountCents || 0), 0);
  const finalProfitCents = totalStudioNetCents - totalExpensesCents;

  return {
    totalGrossCents,
    totalReceivedCents,
    totalCommissionCents,
    totalStudioNetCents,
    totalExpensesCents,
    finalProfitCents,
    breakdown,
    payments: consolidatedPayments,
  };
}
