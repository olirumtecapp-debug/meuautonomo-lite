export interface CepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  formattedAddress: string;
}

export function formatCep(value: string = ""): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupCep(rawCep: string): Promise<CepResult | null> {
  const clean = rawCep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;

    const parts = [
      data.logradouro,
      data.bairro,
      `${data.localidade} - ${data.uf}`
    ].filter(Boolean);

    return {
      cep: formatCep(data.cep || clean),
      logradouro: data.logradouro || "",
      complemento: data.complemento || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
      formattedAddress: parts.join(", ")
    };
  } catch (error) {
    console.warn("[ViaCEP] Falha ao consultar CEP:", error);
    return null;
  }
}
