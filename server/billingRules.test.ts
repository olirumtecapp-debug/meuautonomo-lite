import { describe, expect, it } from "vitest";
import {
  isBillableAppointment,
  isCountableAppointment,
  isCommissionEligible,
  calculateCommissionAndStudio,
  calculateDeduplicatedMetrics,
  calculateTeamReport,
  type AppointmentRecord,
  type PaymentRecord,
  type TeamMemberRecord,
} from "./billingRules";
import { formatBrlInput, parseBrlToCents } from "../client/src/utils/currency";

describe("Domain Billing Rules - Unit & Mathematical Tests", () => {
  describe("Brazilian Currency Parser and Formatter", () => {
    it("correctly parses R$ 180,00 to 18000 cents and avoids R$ 18.000,00 bug", () => {
      expect(parseBrlToCents("180")).toBe(18000);
      expect(parseBrlToCents("180,00")).toBe(18000);
      expect(parseBrlToCents("R$ 180,00")).toBe(18000);
      expect(parseBrlToCents("180.00")).toBe(18000);
      expect(parseBrlToCents("")).toBe(0);
      expect(formatBrlInput(18000)).toBe("180,00");
    });
  });

  describe("Appointment Status Classification", () => {
    it("classifies agendado, confirmado, andamento, and concluido as billable and countable", () => {
      expect(isBillableAppointment("agendado")).toBe(true);
      expect(isBillableAppointment("confirmado")).toBe(true);
      expect(isBillableAppointment("andamento")).toBe(true);
      expect(isBillableAppointment("concluido")).toBe(true);

      expect(isCountableAppointment("agendado")).toBe(true);
      expect(isCountableAppointment("confirmado")).toBe(true);
      expect(isCountableAppointment("andamento")).toBe(true);
      expect(isCountableAppointment("concluido")).toBe(true);

      expect(isCommissionEligible("agendado")).toBe(true);
      expect(isCommissionEligible("confirmado")).toBe(true);
      expect(isCommissionEligible("andamento")).toBe(true);
      expect(isCommissionEligible("concluido")).toBe(true);
    });

    it("excludes cancelado and faltou from billing, counting, and commission", () => {
      expect(isBillableAppointment("cancelado")).toBe(false);
      expect(isBillableAppointment("faltou")).toBe(false);

      expect(isCountableAppointment("cancelado")).toBe(false);
      expect(isCountableAppointment("faltou")).toBe(false);

      expect(isCommissionEligible("cancelado")).toBe(false);
      expect(isCommissionEligible("faltou")).toBe(false);
    });
  });

  describe("Commission & Studio Retention Calculation", () => {
    it("calculates Camila's 45% commission on R$ 180,00 exactly", () => {
      const { commissionCents, studioCents } = calculateCommissionAndStudio(18000, 45);
      expect(commissionCents).toBe(8100); // R$ 81,00
      expect(studioCents).toBe(9900); // R$ 99,00
      expect(commissionCents + studioCents).toBe(18000);
    });

    it("handles various commission percentages with proper rounding", () => {
      // 50%
      expect(calculateCommissionAndStudio(18000, 50)).toEqual({ commissionCents: 9000, studioCents: 9000 });
      // 0%
      expect(calculateCommissionAndStudio(18000, 0)).toEqual({ commissionCents: 0, studioCents: 18000 });
      // 100%
      expect(calculateCommissionAndStudio(18000, 100)).toEqual({ commissionCents: 18000, studioCents: 0 });
      // 33% of R$ 100,00 (10000 cents): 3300 cents, studio 6700 cents
      expect(calculateCommissionAndStudio(10000, 33)).toEqual({ commissionCents: 3300, studioCents: 6700 });
      // 45% of R$ 155,50 (15550 cents): Math.round(15550 * 0.45) = Math.round(6997.5) = 6998 cents
      expect(calculateCommissionAndStudio(15550, 45)).toEqual({ commissionCents: 6998, studioCents: 8552 });
    });
  });

  describe("Faturamento Deduplication & Mathematical Matrix", () => {
    const camilaMember: TeamMemberRecord = {
      id: 5,
      profileId: 1,
      name: "Camila Eletrica QA",
      role: "Eletricista Parceira",
      commissionPercent: 45,
      active: true,
    };

    it("verifies mathematical matrix for 1 appointment of R$ 180,00 + 1 paid payment of R$ 180,00", () => {
      const app: AppointmentRecord = {
        id: 101,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5,
        startsAt: "2026-09-30T10:00:00.000Z",
        durationMinutes: 90,
        amountCents: 18000,
        status: "confirmado",
        paymentStatus: "pendente",
      };

      const pay: PaymentRecord = {
        id: 501,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        amountCents: 18000,
        status: "pago",
        method: "pix",
        createdAt: "2026-09-30T10:30:00.000Z",
      };

      const summary = calculateDeduplicatedMetrics([app], [pay]);

      // REQUIRED MATHEMATICAL MATRIX:
      // Valor do atendimento: R$ 180,00
      // Faturamento bruto: R$ 180,00 (NOT R$ 360,00)
      // Receita paga: R$ 180,00
      // Pendente: R$ 0,00
      // Atendimentos: 1
      expect(summary.faturamentoCents).toBe(18000);
      expect(summary.recebidoCents).toBe(18000);
      expect(summary.pendenteCents).toBe(0);
      expect(summary.appointmentCount).toBe(1);
      expect(summary.saldoCents).toBe(18000);

      // Duplicidade = 0
      const duplicidade = (summary.recebidoCents + summary.pendenteCents) - summary.faturamentoCents;
      expect(duplicidade).toBe(0);
    });

    it("verifies partial payment: 1 appointment R$ 180,00 + 1 payment R$ 100,00", () => {
      const app: AppointmentRecord = {
        id: 102,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5,
        startsAt: "2026-09-30T10:00:00.000Z",
        durationMinutes: 90,
        amountCents: 18000,
        status: "confirmado",
        paymentStatus: "parcial",
      };

      const pay: PaymentRecord = {
        id: 502,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        amountCents: 10000,
        status: "pago",
        method: "pix",
        createdAt: "2026-09-30T10:30:00.000Z",
      };

      const summary = calculateDeduplicatedMetrics([app], [pay]);

      expect(summary.faturamentoCents).toBe(18000);
      expect(summary.recebidoCents).toBe(10000);
      expect(summary.pendenteCents).toBe(8000);
      expect(summary.appointmentCount).toBe(1);
    });

    it("verifies team report matrix for Camila (45% commission)", () => {
      const app: AppointmentRecord = {
        id: 101,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5,
        startsAt: "2026-09-30T10:00:00.000Z",
        durationMinutes: 90,
        amountCents: 18000,
        status: "confirmado",
        paymentStatus: "pendente",
      };

      const pay: PaymentRecord = {
        id: 501,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5,
        amountCents: 18000,
        status: "pago",
        method: "pix",
        createdAt: "2026-09-30T10:30:00.000Z",
      };

      const teamReport = calculateTeamReport([camilaMember], [app], [pay]);

      // REQUIRED TEAM MATRIX:
      // Faturamento da Equipe: R$ 180,00
      // Recebido: R$ 180,00
      // Comissão Camila (45%): R$ 81,00
      // Lucro / Retenção do Estúdio: R$ 99,00
      expect(teamReport.totalGrossCents).toBe(18000);
      expect(teamReport.totalReceivedCents).toBe(18000);
      expect(teamReport.totalCommissionCents).toBe(8100);
      expect(teamReport.totalStudioNetCents).toBe(9900);
      expect(teamReport.finalProfitCents).toBe(9900);

      const camilaBreakdown = teamReport.breakdown.find(b => b.member.id === 5);
      expect(camilaBreakdown).toBeDefined();
      expect(camilaBreakdown!.count).toBe(1);
      expect(camilaBreakdown!.grossCents).toBe(18000);
      expect(camilaBreakdown!.receivedCents).toBe(18000);
      expect(camilaBreakdown!.commissionCents).toBe(8100);
      expect(camilaBreakdown!.studioCents).toBe(9900);
    });

    it("verifies team report when payment has no explicit teamMemberId but appointment has Camila", () => {
      const app: AppointmentRecord = {
        id: 101,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5, // Camila
        startsAt: "2026-09-30T10:00:00.000Z",
        durationMinutes: 90,
        amountCents: 18000,
        status: "confirmado",
        paymentStatus: "pendente",
      };

      // Payment created in Financeiro without selecting partner
      const pay: PaymentRecord = {
        id: 501,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        amountCents: 18000,
        status: "pago",
        method: "pix",
        createdAt: "2026-09-30T10:30:00.000Z",
      };

      const teamReport = calculateTeamReport([camilaMember], [app], [pay]);

      // Inherits Camila's association from appointment, ensuring R$ 81,00 commission and R$ 99,00 studio
      expect(teamReport.totalGrossCents).toBe(18000);
      expect(teamReport.totalReceivedCents).toBe(18000);
      expect(teamReport.totalCommissionCents).toBe(8100);
      expect(teamReport.totalStudioNetCents).toBe(9900);
    });

    it("ignores canceled appointments from revenue and commission", () => {
      const app: AppointmentRecord = {
        id: 103,
        profileId: 1,
        clientId: 30001,
        serviceId: 201,
        teamMemberId: 5,
        startsAt: "2026-09-30T10:00:00.000Z",
        durationMinutes: 90,
        amountCents: 18000,
        status: "cancelado",
      };

      const summary = calculateDeduplicatedMetrics([app], []);
      expect(summary.faturamentoCents).toBe(0);
      expect(summary.recebidoCents).toBe(0);
      expect(summary.pendenteCents).toBe(0);
      expect(summary.appointmentCount).toBe(0);

      const teamReport = calculateTeamReport([camilaMember], [app], []);
      expect(teamReport.totalGrossCents).toBe(0);
      expect(teamReport.totalCommissionCents).toBe(0);
    });
  });
});
