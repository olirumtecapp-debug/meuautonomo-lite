import { SERVICE_CATALOG } from "../data/servicesCatalog";

// Dicionário de erros e correções ortográficas comuns em português para serviços
const COMMON_TYPOS: Record<string, string> = {
  // Estética, Beleza, Unhas, Sobrancelhas e Cílios
  "sombrancelha": "sobrancelha",
  "sombrancelhas": "sobrancelhas",
  "sobranselha": "sobrancelha",
  "sobranselhas": "sobrancelhas",
  "desing": "design",
  "dizaine": "design",
  "rena": "henna",
  "hena": "henna",
  "jel": "gel",
  "alongameto": "alongamento",
  "alongamentos": "alongamentos",
  "micropigmentacao": "micropigmentação",
  "micropigmentaçao": "micropigmentação",
  "micropigmentasao": "micropigmentação",
  "microblading": "microblading",
  "microbleding": "microblading",
  "esmaltacao": "esmaltação",
  "esmaltecao": "esmaltação",
  "esmaltassao": "esmaltação",
  "esmalte": "esmalte",
  "manicuri": "manicure",
  "manicuree": "manicure",
  "pedicuri": "pedicure",
  "pedicuree": "pedicure",
  "cutilajem": "cutilagem",
  "cutilagem": "cutilagem",
  "podolojia": "podologia",
  "podolojista": "podologista",
  "lash lifiting": "lash lifting",
  "lash lift": "lash lifting",
  "liftin": "lifting",
  "depilacao": "depilação",
  "depilassao": "depilação",
  "depilacão": "depilação",
  "depilaçao": "depilação",
  "massajem": "massagem",
  "massajens": "massagens",
  "massagen": "massagem",
  "drenajem": "drenagem",
  "drenajens": "drenagens",
  "drenagen": "drenagem",
  "maquiajem": "maquiagem",
  "maquiagen": "maquiagem",
  "maquiadora": "maquiadora",
  "maquiador": "maquiador",
  "progresiva": "progressiva",
  "progressiva": "progressiva",
  "hidratacao": "hidratação",
  "hidratassao": "hidratação",
  "cauterizacao": "cauterização",
  "selagem": "selagem",
  "selajem": "selagem",
  "cilios": "cílios",
  "cilio": "cílio",
  "extencao": "extensão",
  "extensao": "extensão",
  "limpesa": "limpeza",
  "limpesas": "limpezas",
  "limpessa": "limpeza",

  // Reformas, Elétrica, Hidráulica, Reparos e Serviços Gerais
  "concerto": "conserto",
  "concertos": "consertos",
  "pedrero": "pedreiro",
  "pedreros": "pedreiros",
  "chuvero": "chuveiro",
  "chuveros": "chuveiros",
  "instalacao": "instalação",
  "instalassao": "instalação",
  "instalacão": "instalação",
  "instalasaõ": "instalação",
  "manutencao": "manutenção",
  "manutensao": "manutenção",
  "manutencão": "manutenção",
  "higienizacao": "higienização",
  "higienizassao": "higienização",
  "higienisacao": "higienização",
  "idraulica": "hidráulica",
  "idraulico": "hidráulico",
  "montajem": "montagem",
  "montajens": "montagens",
  "lavajem": "lavagem",
  "desentupimeto": "desentupimento",
  "desentupisao": "desentupimento",
  "recidencial": "residencial",
  "residensial": "residencial",
  "comerçial": "comercial",
  "eletrica": "elétrica",
  "eletrico": "elétrico",
  "eletrecista": "eletricista",
  "revisao": "revisão",
  "reparacao": "reparação",
  "orcamento": "orçamento",
  "formatacao": "formatação",
  "porcelenato": "porcelanato",
  "impermeabilizacao": "impermeabilização",
  "impermeabilisacao": "impermeabilização",
  "arcondicionado": "ar-condicionado",
  "ar condicionado": "ar-condicionado",
  "computado": "computador",
  "tecnico": "técnico",
  "mecanico": "mecânico",
  "mecanica": "mecânica",
  "estetica": "estética",
  "domestica": "doméstica",
  "domestico": "doméstico",
  "veiculo": "veículo",
  "veiculos": "veículos",
  "automovel": "automóvel",
  "automoveis": "automóveis",
  "jardinajem": "jardinagem",
  "vidracaria": "vidraçaria",
  "serralharia": "serralheria",
  "tornera": "torneira",
  // Saúde, Bem-Estar, Diagnóstico e Análises
  "analise": "análise",
  "analises": "análises",
  "analitico": "analítico",
  "analitica": "analítica",
  "analiticos": "analíticos",
  "analiticas": "analíticas",
  "diagnostico": "diagnóstico",
  "diagnosticos": "diagnósticos",
  "avaliacao": "avaliação",
  "avaliacoes": "avaliações",
  "relatorio": "relatório",
  "relatorios": "relatórios",
  "sessao": "sessão",
  "sessoes": "sessões",
  "consulta": "consulta",
  "consultas": "consultas",
  "consultorio": "consultório",
  "consultoria": "consultoria",
  "clinica": "clínica",
  "clinicas": "clínicas",
  "clinico": "clínico",
  "clinicos": "clínicos",
  "medica": "médica",
  "medicas": "médicas",
  "medico": "médico",
  "medicos": "médicos",
  "pediatrica": "pediátrica",
  "pediatrico": "pediátrico",
  "geriatrica": "geriátrica",
  "geriatrico": "geriátrico",
  "odontologica": "odontológica",
  "odontologico": "odontológico",
  "oftalmologica": "oftalmológica",
  "oftalmologico": "oftalmológico",
  "dermatologica": "dermatológica",
  "dermatologico": "dermatológico",
  "psicologica": "psicológica",
  "psicologicas": "psicológicas",
  "psicologico": "psicológico",
  "psicologicos": "psicológicos",
  "fisioterapica": "fisioterápica",
  "fisioterapico": "fisioterápico",
  "fisioterapeutica": "fisioterapêutica",
  "fisioterapeutico": "fisioterapêutico",
  "quimica": "química",
  "quimico": "químico",
  "protese": "prótese",
  "proteses": "próteses",
  "ortese": "órtese",
  "orteses": "órteses",
  "laudo": "laudo",
  "laudos": "laudos",
  "pericia": "perícia",
  "pericias": "perícias",
  "terapeutica": "terapêutica",
  "terapeutico": "terapêutico",
  "terapeuticos": "terapêuticos",
  "terapeuticas": "terapêuticas",
  "servico": "serviço",
  "servicos": "serviços",
  "video": "vídeo",
  "videos": "vídeos",
  "audio": "áudio",
  "audios": "áudios",
  "edicao": "edição",
  "edicoes": "edições",
  "gravacao": "gravação",
  "gravacoes": "gravações",
  "musica": "música",
  "musicas": "músicas",
  "juridico": "jurídico",
  "juridica": "jurídica",
  "contabil": "contábil",
  "contabeis": "contábeis",
  "optica": "óptica",
  "optico": "óptico",
  "eletronica": "eletrônica",
  "eletronico": "eletrônico",
  "eletronicos": "eletrônicos",
  "informatica": "informática",
  "assistencia": "assistência",
  "residencia": "residência",
  "residencias": "residências",
  "comercio": "comércio",
  "comercios": "comércios",
  "automacao": "automação",
  "climatizacao": "climatização",
  "refrigeracao": "refrigeração",
  "desinfeccao": "desinfecção",
  "dedetizacao": "dedetização",
  "sanitizacao": "sanitização",
  "polimento": "polimento",
  "alvenaria": "alvenaria",
  "construcao": "construção",
  "construcoes": "construções",
  "aplicacao": "aplicação",
  "aplicacoes": "aplicações",
  "coloracao": "coloração",
  "descoloracao": "descoloração",
  "cristalizacao": "cristalização",
  "experiencia": "experiência",
  "experiencias": "experiências",
  "rapido": "rápido",
  "rapida": "rápida",
  "rapidos": "rápidos",
  "rapidas": "rápidas",
  "domicilio": "domicílio",
  "regiao": "região",
  "regioes": "regiões",
  "preco": "preço",
  "precos": "preços",
  "facil": "fácil",
  "dificil": "difícil",
  "otimo": "ótimo",
  "otima": "ótima",
  "otimos": "ótimos",
  "otimas": "ótimas",
  "duvida": "dúvida",
  "duvidas": "dúvidas",
  "voce": "você",
  "voces": "vocês",
  "horario": "horário",
  "horarios": "horários",
  "ate": "até",
  "ja": "já",
  "tambem": "também",
  "numero": "número",
  "numeros": "números",
  "endereco": "endereço",
  "enderecos": "endereços",
  "cartao": "cartão",
  "cartoes": "cartões",
  "transferencia": "transferência",
  "transferencias": "transferências",
  "conclusao": "conclusão",
  "informacao": "informação",
  "informacoes": "informações",
  "condicao": "condição",
  "condicoes": "condições",
  "necessario": "necessário",
  "necessaria": "necessária",
  "necessarios": "necessários",
  "necessarias": "necessárias",
  "solucao": "solução",
  "solucoes": "soluções",
  "vitrificacao": "vitrificação",
  "nutricao": "nutrição",
  "ventilacao": "ventilação",
  "manutencoes": "manutenções",
  "instalacoes": "instalações",
  "reparacoes": "reparações",
  "restauracao": "restauração",
  "restauracoes": "restaurações",
  "higienizacoes": "higienizações",
  "configuracao": "configuração",
  "configuracoes": "configurações",
  "programacao": "programação",
  "animacao": "animação",
  "animacoes": "animações",
  "ilustracao": "ilustração",
  "ilustracoes": "ilustrações",
  "comunicacao": "comunicação",
  "traducao": "tradução",
  "traducoes": "traduções",
  "redacao": "redação",
  "correcao": "correção",
  "correcoes": "correções",
  "revisoes": "revisões",
  "harmonizacao": "harmonização",
  "orientacao": "orientação",
  "orientacoes": "orientações",
  "organizacao": "organização",
  "organizacoes": "organizações",
  "confeccao": "confecção",
  "confeccoes": "confecções",
  "chapeacao": "chapeação",
  "injecao": "injeção",
  "suspensao": "suspensão",
  "panificacao": "panificação",
  "preparacao": "preparação",
  "lubrificacao": "lubrificação",
  "oleo": "óleo",
  "oleos": "óleos",
  "combustivel": "combustível",
  "combustiveis": "combustíveis",
  "luminaria": "luminária",
  "luminarias": "luminárias",
  "lampada": "lâmpada",
  "lampadas": "lâmpadas",
  "valvula": "válvula",
  "valvulas": "válvulas",
  "ceramica": "cerâmica",
  "ceramicas": "cerâmicas",
  "mudanca": "mudança",
  "mudancas": "mudanças",
  "vigilancia": "vigilância",
  "seguranca": "segurança",
  "previdenciaria": "previdenciária",
  "previdenciario": "previdenciário",
  "tributaria": "tributária",
  "tributario": "tributário",
  "imobiliaria": "imobiliária",
  "imobiliario": "imobiliário",
  "bancaria": "bancária",
  "bancario": "bancário",
  "pedagogica": "pedagógica",
  "pedagogico": "pedagógico",
  "fotografica": "fotográfica",
  "fotografico": "fotográfico",
};

// Distância de Levenshtein para calcular similaridade
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Lista plana de todos os serviços do catálogo para sugestão
export const ALL_CATALOG_SERVICES = SERVICE_CATALOG.flatMap((cat) =>
  cat.services.map((s) => ({
    name: s.name,
    description: s.description,
    profession: cat.label,
    emoji: cat.emoji,
  }))
);

export type ServiceCorrectionType = "accent" | "spelling" | "capitalization";

export interface SpellcheckResult {
  hasCorrection: boolean;
  correctedText: string;
  originalText: string;
  explanation?: string;
  correctionType?: ServiceCorrectionType;
  catalogSuggestion?: {
    name: string;
    description: string;
    profession: string;
  };
}

// Verifica se uma palavra é um identificador/código (contém hífens, sublinhados, dígitos)
function isIdentifierOrCode(token: string): boolean {
  return /^[a-z0-9]+[-_]/i.test(token) || /[a-z]+[0-9]/i.test(token) || /[0-9]+[a-z]/i.test(token) || /^[a-z]+-[a-z]/i.test(token);
}

function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function checkServiceSpelling(input: string): SpellcheckResult {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 3) {
    return {
      hasCorrection: false,
      correctedText: input,
      originalText: input,
    };
  }

  // 1. Correção palavra por palavra baseada em dicionário
  const words = trimmed.split(/(\s+)/);
  let changed = false;

  const correctedWords = words.map((w) => {
    // Se for espaço em branco, mantém
    if (/^\s+$/.test(w)) return w;

    // Se for um identificador técnico ou slug (ex: bb-quotes-edit-clean-repro-QA7K4M), preserva
    if (isIdentifierOrCode(w)) return w;

    const match = w.match(/^([^a-zA-ZÀ-ÿ0-9]*)(.*?)([^a-zA-ZÀ-ÿ0-9]*)$/);
    const prefix = match ? match[1] : "";
    const core = match ? match[2] : w;
    const suffix = match ? match[3] : "";
    const lower = core.toLowerCase();

    if (COMMON_TYPOS[lower]) {
      const fixed = COMMON_TYPOS[lower];
      if (fixed.toLowerCase() !== lower) {
        changed = true;
        // Preserva primeira letra maiúscula se o original tinha
        if (core.charAt(0) === core.charAt(0).toUpperCase()) {
          return prefix + fixed.charAt(0).toUpperCase() + fixed.slice(1) + suffix;
        }
        return prefix + fixed + suffix;
      }
    }

    // Regra geral para sufixos com cedilha e til comuns em serviços
    if (lower.length >= 4) {
      if (lower.endsWith("cao")) {
        const fixed = lower.slice(0, -3) + "ção";
        changed = true;
        return prefix + (core.charAt(0) === core.charAt(0).toUpperCase() ? fixed.charAt(0).toUpperCase() + fixed.slice(1) : fixed) + suffix;
      }
      if (lower.endsWith("coes")) {
        const fixed = lower.slice(0, -4) + "ções";
        changed = true;
        return prefix + (core.charAt(0) === core.charAt(0).toUpperCase() ? fixed.charAt(0).toUpperCase() + fixed.slice(1) : fixed) + suffix;
      }
    }

    return w;
  });

  let wordCorrected = correctedWords.join("");

  // Ajusta primeira letra para maiúscula apenas se não for identificador/código
  const firstWord = words.find((w) => !/^\s+$/.test(w)) || "";
  const shouldCapitalizeFirst = !isIdentifierOrCode(firstWord);

  if (shouldCapitalizeFirst && wordCorrected.length > 0 && wordCorrected.charAt(0) !== wordCorrected.charAt(0).toUpperCase()) {
    wordCorrected = wordCorrected.charAt(0).toUpperCase() + wordCorrected.slice(1);
    if (wordCorrected !== trimmed) {
      changed = true;
    }
  }

  // 2. Busca no catálogo de serviços para verificar se é muito similar a um serviço padrão
  const lowerInput = trimmed.toLowerCase();
  let bestCatalogMatch: (typeof ALL_CATALOG_SERVICES)[0] | null = null;
  let minDistance = 999;

  for (const catService of ALL_CATALOG_SERVICES) {
    const catLower = catService.name.toLowerCase();
    
    // Se for exatamente igual, não precisa sugerir catálogo
    if (catLower === lowerInput) {
      bestCatalogMatch = null;
      break;
    }

    // Se o usuário digitou uma frase de 5+ letras parecida com o serviço
    const dist = levenshteinDistance(lowerInput, catLower);
    const maxLen = Math.max(lowerInput.length, catLower.length);
    const similarity = 1 - dist / maxLen;

    if (similarity >= 0.75 && dist < minDistance && dist <= 4) {
      minDistance = dist;
      bestCatalogMatch = catService;
    }
  }

  const hasCorrection = changed && wordCorrected !== trimmed;

  let correctionType: ServiceCorrectionType | undefined = undefined;
  let explanation = "";

  if (hasCorrection) {
    const strippedOrig = stripAccents(trimmed).toLowerCase();
    const strippedCorr = stripAccents(wordCorrected).toLowerCase();

    if (strippedOrig === strippedCorr) {
      if (trimmed.toLowerCase() !== wordCorrected.toLowerCase()) {
        correctionType = "accent";
        explanation = "Acentuação corrigida automaticamente";
      } else {
        correctionType = "capitalization";
        explanation = "Capitalização ajustada automaticamente";
      }
    } else {
      correctionType = "spelling";
      explanation = "Correção ortográfica aplicada";
    }
  }

  return {
    hasCorrection,
    correctedText: wordCorrected,
    originalText: input,
    explanation,
    correctionType,
    catalogSuggestion: bestCatalogMatch
      ? {
          name: bestCatalogMatch.name,
          description: bestCatalogMatch.description,
          profession: bestCatalogMatch.profession,
        }
      : undefined,
  };
}

const COMMON_PROFESSION_TYPOS: Record<string, string> = {
  eletrecista: "Eletricista",
  eletrecistas: "Eletricistas",
  eletricissao: "Eletricista",
  cabeleleiro: "Cabeleireiro",
  cabeleleira: "Cabeleireira",
  cabelereiro: "Cabeleireiro",
  cabelereira: "Cabeleireira",
  cabelereiros: "Cabeleireiros",
  pedrero: "Pedreiro",
  pedreros: "Pedreiros",
  encandador: "Encanador",
  encandadores: "Encanadores",
  fisioterapista: "Fisioterapeuta",
  fisioterapistas: "Fisioterapeutas",
  massajista: "Massagista",
  massajistas: "Massagistas",
  estetisista: "Esteticista",
  estetisistas: "Esteticistas",
  barbero: "Barbeiro",
  barberos: "Barbeiros",
  manicuri: "Manicure",
  manicuris: "Manicures",
  pedicuri: "Pedicure",
  pedicuris: "Pedicures",
  mecanico: "Mecânico",
  mecanicos: "Mecânicos",
  psicologo: "Psicólogo",
  psicologa: "Psicóloga",
  nutrisao: "Nutrição",
  nutricionisa: "Nutricionista",
  sombrancelha: "Designer de Sobrancelhas",
  sobranselhas: "Designer de Sobrancelhas",
  serralhero: "Serralheiro",
  serralheria: "Serralheria",
  marceneiro: "Marceneiro",
  marcenaria: "Marcenaria",
  diarista: "Diarista",
  confeiteiro: "Confeiteiro",
  confeiteira: "Confeiteira",
  tatador: "Tatuador",
  tatuadora: "Tatuadora",
  fotografo: "Fotógrafo",
  fotografa: "Fotógrafa",
  analista: "Analista",
  biomedico: "Biomédico",
  biomedica: "Biomédica",
  quimico: "Químico",
  quimica: "Química",
  farmaceutico: "Farmacêutico",
  farmaceutica: "Farmacêutica",
  medico: "Médico",
  medica: "Médica",
  tecnico: "Técnico",
  tecnica: "Técnica",
  veterinario: "Veterinário",
  veterinaria: "Veterinária",
};

export function checkProfessionSpelling(input: string): {
  hasCorrection: boolean;
  correctedText: string;
} {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 3) return { hasCorrection: false, correctedText: input };
  const lower = trimmed.toLowerCase();
  if (COMMON_PROFESSION_TYPOS[lower]) {
    return { hasCorrection: true, correctedText: COMMON_PROFESSION_TYPOS[lower] };
  }
  return { hasCorrection: false, correctedText: input };
}

