export interface ProfessionCategory {
  category: string;
  icon: string;
  professions: string[];
}

export const POPULAR_PROFESSIONS: ProfessionCategory[] = [
  {
    category: "Multisserviços e Polivalentes",
    icon: "🌟",
    professions: [
      "Profissional Multisserviços",
      "Espaço Multiatendimento / Multisserviços",
      "Prestador(a) de Serviços Integrados",
      "Pequenos Reparos, Reformas e Manutenção",
      "Ateliê / Espaço Multidisciplinar",
      "Serviços Gerais e Utilidades",
    ],
  },
  {
    category: "Beleza e Estética",
    icon: "💅",
    professions: [
      "Estúdio de Beleza Multisserviços (Cabelo, Unhas e Cílios)",
      "Espaço de Beleza Integrada",
      "Beauty Studio Completo",
      "Cabeleireiro(a)",
      "Manicure e Pedicure",
      "Barbeiro",
      "Designer de Sobrancelhas",
      "Lash Designer (Extensão de Cílios)",
      "Maquiador(a)",
      "Esteticista",
      "Depilador(a)",
      "Massoterapeuta",
      "Podólogo(a)",
      "Tatuador(a) / Piercer",
    ],
  },
  {
    category: "Casa e Manutenção",
    icon: "🛠️",
    professions: [
      "Profissional Multisserviços (Reparos e Manutenção)",
      "Marido de Aluguel",
      "Manutenção Geral & Instalações",
      "Eletricista",
      "Encanador",
      "Pintor",
      "Marceneiro",
      "Pedreiro",
      "Chaveiro",
      "Montador de Móveis",
      "Gesseiro",
      "Serralheiro",
      "Calheiro",
      "Jardineiro",
      "Piscineiro",
      "Técnico de Ar-Condicionado",
      "Vidraceiro",
      "Tapeceiro / Estofador",
    ],
  },
  {
    category: "Saúde e Bem-Estar",
    icon: "🩺",
    professions: [
      "Espaço Integrado de Saúde & Terapias",
      "Personal Trainer",
      "Fisioterapeuta",
      "Nutricionista",
      "Psicólogo(a)",
      "Terapeuta Holístico",
      "Cuidador(a) de Idosos",
      "Fonoaudiólogo(a)",
      "Enfermeiro(a) Particular",
      "Instrutor(a) de Pilates / Yoga",
    ],
  },
  {
    category: "Serviços Domésticos e Família",
    icon: "🧹",
    professions: [
      "Serviços Domésticos Integrados",
      "Diarista / Faxineira",
      "Passadeira",
      "Cozinheiro(a) Particular",
      "Babá",
      "Cuidador(a) de Pets (Pet Sitter)",
      "Passeador de Cães (Dog Walker)",
      "Adestrador(a) de Cães",
    ],
  },
  {
    category: "Automotivo",
    icon: "🚗",
    professions: [
      "Centro Automotivo Multisserviços",
      "Mecânico(a)",
      "Eletricista Automotivo",
      "Funileiro / Pintor Automotivo",
      "Estética Automotiva / Detalhamento",
      "Borracheiro",
      "Instalador de Som e Acessórios",
      "Guincheiro",
    ],
  },
  {
    category: "Tecnologia, Mídia e Criação",
    icon: "💻",
    professions: [
      "Comunicação & Mídia Multisserviços (Design, Foto e Vídeo)",
      "Fotógrafo(a)",
      "Videomaker / Filmaker",
      "Designer Gráfico",
      "Editor de Vídeo",
      "Social Media / Gestor de Tráfego",
      "Desenvolvedor(a) / Programador(a)",
      "Técnico de Informática",
      "Técnico de Celular / Eletrônicos",
    ],
  },
  {
    category: "Aulas e Consultoria",
    icon: "📚",
    professions: [
      "Professor(a) Particular",
      "Instrutor(a) de Idiomas",
      "Professor(a) de Música",
      "Consultor(a) / Assessor(a)",
      "Instrutor(a) de Trânsito",
      "Coach / Mentor(a)",
    ],
  },
  {
    category: "Eventos e Gastronomia",
    icon: "🎉",
    professions: [
      "Produção de Eventos & Buffet Multisserviços",
      "Confeiteiro(a) / Doceiro(a)",
      "Salgadeiro(a)",
      "Churrasqueiro(a)",
      "Garçom / Bartender",
      "DJ / Sonorização",
      "Decorador(a) de Festas",
      "Cerimonialista",
    ],
  },
];

// Retorna todas as profissões em lista plana para busca fácil
export const ALL_PROFESSIONS_FLAT = POPULAR_PROFESSIONS.flatMap((cat) =>
  cat.professions.map((prof) => ({ name: prof, category: cat.category }))
);

export function findCategoryForProfession(professionName: string): string {
  const match = ALL_PROFESSIONS_FLAT.find(
    (p) => p.name.toLowerCase() === professionName.trim().toLowerCase()
  );
  return match ? match.category : "Serviços Gerais";
}

export function getProfessionsByCategory(categoryName: string): string[] {
  const found = POPULAR_PROFESSIONS.find(
    (c) => c.category.toLowerCase() === categoryName.trim().toLowerCase()
  );
  return found ? found.professions : [];
}
