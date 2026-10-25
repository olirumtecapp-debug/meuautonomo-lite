import { describe, it, expect } from "vitest";
import { parseBrlToCents, formatBrl, formatBrlInput } from "../client/src/utils/currency";

describe("Testes Unitários de Conversão Monetária (BRL / Moeda)", () => {
  describe("parseBrlToCents", () => {
    it("converte número (já em centavos) mantendo o valor exato", () => {
      expect(parseBrlToCents(18000)).toBe(18000);
      expect(parseBrlToCents(15050)).toBe(15050);
      expect(parseBrlToCents(0)).toBe(0);
    });

    it("converte string brasileira com vírgula para centavos", () => {
      expect(parseBrlToCents("180,00")).toBe(18000);
      expect(parseBrlToCents("180,50")).toBe(18050);
      expect(parseBrlToCents("1.800,00")).toBe(180000);
      expect(parseBrlToCents("18.000,00")).toBe(1800000);
      expect(parseBrlToCents("R$ 180,00")).toBe(18000);
      expect(parseBrlToCents("R$ 1.800,50")).toBe(180050);
    });

    it("converte string inteira sem vírgula para centavos", () => {
      expect(parseBrlToCents("180")).toBe(18000);
      expect(parseBrlToCents("1500")).toBe(150000);
      expect(parseBrlToCents("1.800")).toBe(180000);
    });

    it("retorna 0 para entradas nulas, indefinidas ou vazias", () => {
      expect(parseBrlToCents(null)).toBe(0);
      expect(parseBrlToCents(undefined)).toBe(0);
      expect(parseBrlToCents("")).toBe(0);
      expect(parseBrlToCents("   ")).toBe(0);
      expect(parseBrlToCents("texto_invalido")).toBe(0);
    });
  });

  describe("formatBrlInput", () => {
    it("formata número em centavos do banco para string sem multiplicar por 100", () => {
      // BUG-01 regression: 18000 centavos deve virar 180,00 (NÃO 18.000,00)
      expect(formatBrlInput(18000)).toBe("180,00");
      expect(formatBrlInput(18050)).toBe("180,50");
      expect(formatBrlInput(180000)).toBe("1.800,00");
      expect(formatBrlInput(0)).toBe("");
    });

    it("formata digitação do usuário em Reais", () => {
      expect(formatBrlInput("180")).toBe("180,00");
      expect(formatBrlInput("180,00")).toBe("180,00");
      expect(formatBrlInput("180,50")).toBe("180,50");
      expect(formatBrlInput("1800")).toBe("1.800,00");
    });

    it("retorna string vazia para valores nulos ou vazios", () => {
      expect(formatBrlInput(null)).toBe("");
      expect(formatBrlInput(undefined)).toBe("");
      expect(formatBrlInput("")).toBe("");
      expect(formatBrlInput("0")).toBe("");
      expect(formatBrlInput("0,00")).toBe("");
    });
  });

  describe("formatBrl", () => {
    it("formata centavos com prefixo R$ por padrão", () => {
      expect(formatBrl(18000)).toBe("R$ 180,00");
      expect(formatBrl(18000, false)).toBe("180,00");
    });
  });
});
