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
  /** Valor efetivamente recebido quando o item representa um atendimento consolidado. */
  receivedAmountCents?: number;
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
  unassignedGrossCents: number;
  unassignedReceivedCents: number;
  breakdown: TeamMemberBreakdown[];
  payments: PaymentRecord[];
}

/**
 * Associa pagamentos aos atendimentos. Prioriza appointmentId explícito; na
 * ausência dele, usa cliente/serviço e mantém pagamentos parciais ligados ao
 * mesmo atendimento até cobrir o valor faturável.
 */
export function associatePaymentsToAppointments(
  appointments: AppointmentRecord[],
  payments: PaymentRecord[]
): {
  paymentsByAppointmentId: Map<number, PaymentRecord[]>;
  unlinkedPayments: PaymentRecord[];
} {
  const billableApps = appointments.filter(a => isBillableAppointment(a.status));
  const paymentsByAppointmentId = new Map<number, PaymentRecord[]>();
  const unlinkedPayments: PaymentRecord[] = [];
  const explicitlyLinkedPaymentIds = new Set<number>();

  for (const pay of payments) {
    if (!pay.appointmentId) continue;
    if (!paymentsByAppointmentId.has(pay.appointmentId)) {
      paymentsByAppointmentId.set(pay.appointmentId, []);
    }
    paymentsByAppointmentId.get(pay.appointmentId)!.push(pay);
    explicitlyLinkedPaymentIds.add(pay.id);
  }

  for (const pay of payments) {
    if (explicitlyLinkedPaymentIds.has(pay.id)) continue;

    let matchedApp: AppointmentRecord | undefined;
    if (pay.clientId) {
      matchedApp = billableApps.find(app => {
        if (app.clientId !== pay.clientId) return false;
        if (pay.serviceId && app.serviceId !== pay.serviceId) return false;
        const linked = paymentsByAppointmentId.get(app.id) || [];
        const amountAlreadyAssociated = linked
          .reduce((sum, item) => sum + (item.amountCents || 0), 0);
        return amountAlreadyAssociated < (app.amountCents || 0);
      });
    }

    if (matchedApp) {
      if (!paymentsByAppointmentId.has(matchedApp.id)) {
        paymentsByAppointmentId.set(matchedApp.id, []);
      }
      paymentsByAppointmentId.get(matchedApp.id)!.push(pay);
    } else {
      unlinkedPayments.push(pay);
    }
  }

  return { paymentsByAppointmentId, unlinkedPayments };
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

  const { paymentsByAppointmentId: paymentsByAppId, unlinkedPayments } =
    associatePaymentsToAppointments(appointments, payments);

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
      if (
        app.paymentStatus === "pago" ||
        (app.paymentStatus == null && app.status === "concluido")
      ) {
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

  const { paymentsByAppointmentId: paymentsByAppId, unlinkedPayments } =
    associatePaymentsToAppointments(appointments, payments);

  // Lista consolidada de lançamentos financeiros deduplicados
  const consolidatedPayments: PaymentRecord[] = [];

  for (const app of billableApps) {
    const linkedPays = paymentsByAppId.get(app.id) || [];
    const requestedTeamMemberId = app.teamMemberId || linkedPays.find(p => p.teamMemberId)?.teamMemberId || null;
    const member = members.find(m => m.id === requestedTeamMemberId);
    // Atendimento próprio do estúdio, sem parceiro válido, não gera comissão.
    const effectiveTeamMemberId = member?.id ?? null;
    const commPct = member?.commissionPercent ?? 0;
    const commAmount = Math.round(((app.amountCents || 0) * commPct) / 100);
    const studioAmount = (app.amountCents || 0) - commAmount;

    let receivedAmountCents = 0;
    if (linkedPays.length > 0) {
      receivedAmountCents = Math.min(
        app.amountCents || 0,
        linkedPays.filter(p => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0)
      );
    } else if (
      app.paymentStatus === "pago" ||
      (app.paymentStatus == null && app.status === "concluido")
    ) {
      receivedAmountCents = app.amountCents || 0;
    }

    const itemStatus = receivedAmountCents >= (app.amountCents || 0)
      ? "pago"
      : receivedAmountCents > 0
        ? "parcial"
        : "pendente";

    consolidatedPayments.push({
      id: linkedPays[0]?.id || -app.id,
      profileId: app.profileId,
      appointmentId: app.id,
      clientId: app.clientId,
      serviceId: app.serviceId,
      teamMemberId: effectiveTeamMemberId,
      amountCents: app.amountCents,
      receivedAmountCents,
      commissionPercent: commPct,
      commissionAmountCents: commAmount,
      studioAmountCents: studioAmount,
      status: itemStatus,
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
    const receivedCents = memberItems.reduce(
      (sum, p) => sum + (p.receivedAmountCents ?? (p.status === "pago" ? p.amountCents || 0 : 0)),
      0
    );

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

  // Totais gerais incluem também os lançamentos próprios, sem parceiro.
  const totalGrossCents = consolidatedPayments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const totalReceivedCents = consolidatedPayments.reduce(
    (sum, p) => sum + (p.receivedAmountCents ?? (p.status === "pago" ? p.amountCents || 0 : 0)),
    0
  );
  const totalCommissionCents = breakdown.reduce((sum, b) => sum + b.commissionCents, 0);
  const unassignedPayments = consolidatedPayments.filter(p => !p.teamMemberId);
  const unassignedGrossCents = unassignedPayments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
  const unassignedReceivedCents = unassignedPayments.reduce(
    (sum, p) => sum + (p.receivedAmountCents ?? (p.status === "pago" ? p.amountCents || 0 : 0)),
    0
  );
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
    unassignedGrossCents,
    unassignedReceivedCents,
    breakdown,
    payments: consolidatedPayments,
  };
}
