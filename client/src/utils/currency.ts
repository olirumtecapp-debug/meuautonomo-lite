/**
 * Utilitários para formatação e manipulação de Moeda Real Brasileira (BRL / R$)
 */

/**
 * Converte qualquer valor inserido pelo usuário (string ou número) para centavos inteiros.
 * Suporta formatos: "150", "150,00", "150.50", "1.500,50", "R$ 150,00", etc.
 * Se o argumento já for um número (ex: 18000 vindo do banco/schema), considera que já está em centavos.
 * NUNCA retorna NaN.
 */
export function parseBrlToCents(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") {
    return isNaN(val) ? 0 : Math.round(val);
  }

  // Remove prefixos como "R$", espaços e caracteres inválidos
  let clean = String(val).replace(/R\$\s*/gi, "").trim();
  if (!clean) return 0;

  // Se o usuário digitou formato brasileiro com vírgula decimal (ex: "1.500,50" ou "150,00" ou "50,5")
  if (clean.includes(",")) {
    // Remove os pontos de milhar e troca vírgula decimal por ponto
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(".")) {
    // Se não tem vírgula, mas tem ponto:
    // Ex: "1.800" (milhar sem decimal) vs "150.50" (decimal padrão americano) vs "1.000.000"
    const dotCount = (clean.match(/\./g) || []).length;
    if (dotCount > 1 || /\.\d{3}$/.test(clean)) {
      // São pontos de milhar! Ex: "1.800" ou "1.000.000"
      clean = clean.replace(/\./g, "");
    }
  }

  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formata um valor numérico em centavos para a representação textual oficial em Real.
 * Exemplo: 15000 -> "R$ 150,00" (com prefixo) ou "150,00" (sem prefixo).
 */
export function formatBrl(cents: number | string = 0, withPrefix = true): string {
  const numCents = typeof cents === "string" ? parseBrlToCents(cents) : (isNaN(cents) ? 0 : Math.round(cents));
  const formatted = (numCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return withPrefix ? `R$ ${formatted}` : formatted;
}

/**
 * Formata um valor digitado pelo usuário ou carregado do banco para exibição em campos de formulário.
 * - Se `val` for número (ex: 18000 vindo do banco/API): trata como centavos inteiros -> "180,00".
 * - Se `val` for string (ex: "180", "180,00", "1800"): interpreta como valor em Reais e formata em BRL.
 * Ex: 18000 -> "180,00" | "180" -> "180,00" | "180,5" -> "180,50" | "1800" -> "1.800,00"
 */
export function formatBrlInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return "";
    return (Math.round(val) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  const str = String(val).trim();
  if (str === "" || str === "0" || str === "0,00") return "";
  const cents = parseBrlToCents(str);
  if (cents <= 0) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
