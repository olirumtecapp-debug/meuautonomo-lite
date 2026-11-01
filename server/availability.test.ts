import { describe, expect, it } from "vitest";
import { isWithinAvailability } from "./routers";

describe("isWithinAvailability", () => {
  const row = {
    schedule: JSON.stringify({ days: ["mon", "tue", "wed", "thu", "fri"], start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] }),
    unavailableDays: JSON.stringify(["2026-09-23"]),
  };

  it("allows a weekday appointment inside the configured window", () => {
    expect(isWithinAvailability(new Date("2026-09-21T13:00:00.000Z"), 60, row)).toBe(true);
  });

  it("rejects appointments outside working hours or on a break", () => {
    expect(isWithinAvailability(new Date("2026-09-21T10:30:00.000Z"), 60, row)).toBe(false);
    expect(isWithinAvailability(new Date("2026-09-21T15:15:00.000Z"), 30, row)).toBe(false);
  });

  it("rejects non-working weekdays and unavailable dates", () => {
    expect(isWithinAvailability(new Date("2026-09-20T13:00:00.000Z"), 60, row)).toBe(false);
    expect(isWithinAvailability(new Date("2026-09-23T13:00:00.000Z"), 60, row)).toBe(false);
  });

  it("handles UTC ISO timestamps accurately according to America/Sao_Paulo timezone", () => {
    // 2026-09-21T13:30:00Z é 10:30 BRT (Segunda-feira) -> Dentro do expediente (08:00-18:00)
    expect(isWithinAvailability(new Date("2026-09-21T13:30:00.000Z"), 60, row)).toBe(true);

    // 2026-09-21T10:30:00Z é 07:30 BRT -> Antes das 08:00
    expect(isWithinAvailability(new Date("2026-09-21T10:30:00.000Z"), 60, row)).toBe(false);

    // 2026-09-21T15:15:00Z é 12:15 BRT -> Intervalo de almoço (12:00-13:00)
    expect(isWithinAvailability(new Date("2026-09-21T15:15:00.000Z"), 30, row)).toBe(false);

    // 2026-09-21T19:30:00Z é 16:30 BRT -> Finaliza às 17:30 BRT (antes das 18:00)
    expect(isWithinAvailability(new Date("2026-09-21T19:30:00.000Z"), 60, row)).toBe(true);
  });
});
