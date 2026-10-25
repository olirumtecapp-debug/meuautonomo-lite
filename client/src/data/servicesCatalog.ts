// Catálogo de profissões e sub-serviços com preços e durações estimadas
// Usado no Onboarding e na tela de Serviços para preenchimento com 1 clique

export type CatalogService = {
  name: string;
  description: string;
  price?: string; // Ex: "90,00"
  durationMinutes?: string; // Ex: "60"
  category?: string; // Categoria visual se aplicável (ex: "Cabelo", "Unhas")
};

export type CatalogProfession = {
  id: string;
  label: string;
  emoji: string;
  services: CatalogService[];
};

export const SERVICE_CATALOG: CatalogProfession[] = [
  {
    id: "cabeleireiro",
    label: "Cabeleireiro(a) / Barbeiro",
    emoji: "✂️",
    services: [
      { name: "Corte Feminino + Escova", description: "Corte personalizado, lavagem especial e escovação modelada.", price: "90,00", durationMinutes: "60", category: "Cabelo" },
      { name: "Corte Masculino e Barboterapia", description: "Corte degradê/social com toalha quente e alinhamento de barba na navalha.", price: "60,00", durationMinutes: "45", category: "Barba & Cabelo" },
      { name: "Coloração e Cobertura de Brancos", description: "Aplicação de tinta profissional com proteção dos fios e brilho.", price: "120,00", durationMinutes: "90", category: "Química" },
      { name: "Mechas / Luzes / Balayage", description: "Técnicas de clareamento capilar com tonalização e tratamento reconstrutor.", price: "250,00", durationMinutes: "180", category: "Química" },
      { name: "Progressiva / Alinhamento Térmico", description: "Redução de volume e frizz com brilho espelhado.", price: "180,00", durationMinutes: "150", category: "Alisamento" },
      { name: "Botox Capilar / Cronograma", description: "Reposição de massa e hidratação profunda para fios danificados.", price: "110,00", durationMinutes: "60", category: "Tratamento" },
      { name: "Lavagem e Escova Modelada", description: "Higienização completa do couro cabeludo com escova lisa ou ondulada.", price: "50,00", durationMinutes: "40", category: "Cabelo" },
      { name: "Penteado e Maquiagem Social", description: "Produção completa para formaturas, casamentos e eventos especiais.", price: "180,00", durationMinutes: "90", category: "Produção" },
    ],
  },
  {
    id: "manicure",
    label: "Manicure e Pedicure",
    emoji: "💅",
    services: [
      { name: "Esmaltação em Gel", description: "Aplicação de esmalte em gel com cura em cabine LED/UV (dura até 20 dias).", price: "65,00", durationMinutes: "60", category: "Unhas" },
      { name: "Unhas de Gel / Fibra de Vidro", description: "Alongamento com molde ou tips, acabamento natural e alta durabilidade.", price: "130,00", durationMinutes: "120", category: "Alongamento" },
      { name: "Manutenção de Gel / Fibra", description: "Reposição de gel/fibra, nivelamento e novo acabamento nas unhas crescidas.", price: "90,00", durationMinutes: "90", category: "Manutenção" },
      { name: "Manicure + Pedicure Tradicional", description: "Cutilagem funda e esmaltação tradicional completa com materiais esterilizados.", price: "60,00", durationMinutes: "60", category: "Tradicional" },
      { name: "Manicure Tradicional", description: "Cutilagem funda, hidratação e esmaltação com produtos esterilizados.", price: "35,00", durationMinutes: "35", category: "Tradicional" },
      { name: "Pedicure Tradicional", description: "Higiene dos pés, corte correto, cutilagem, lixamento e esmaltação.", price: "35,00", durationMinutes: "40", category: "Tradicional" },
      { name: "Blindagem / Banho de Gel", description: "Camada protetora para fortalecimento das unhas naturais contra quebras.", price: "70,00", durationMinutes: "50", category: "Unhas" },
      { name: "Spa dos Pés com Esfoliação", description: "Esfoliação, hidratação profunda, remoção de asperezas e massagem relaxante.", price: "50,00", durationMinutes: "45", category: "Spa" },
      { name: "Nail Art / Decoração", description: "Desenhos artísticos, pedrarias, francesinha ou encapsulamento.", price: "30,00", durationMinutes: "30", category: "Decoração" },
    ],
  },
  {
    id: "sobrancelhas",
    label: "Designer de Sobrancelhas e Cílios",
    emoji: "👁️",
    services: [
      { name: "Design de Sobrancelhas com Henna", description: "Mapeamento facial, desenho simétrico e aplicação de henna para realce.", price: "45,00", durationMinutes: "35", category: "Sobrancelhas" },
      { name: "Extensão de Cílios (Fio a Fio)", description: "Aplicação de fios individuais para um olhar natural e alongado.", price: "130,00", durationMinutes: "120", category: "Cílios" },
      { name: "Extensão de Cílios (Volume Russo)", description: "Fans artesanais para efeito preenchido, marcante e expressivo.", price: "160,00", durationMinutes: "150", category: "Cílios" },
      { name: "Manutenção de Extensão de Cílios", description: "Preenchimento de fios soltos para manter o volume da extensão.", price: "80,00", durationMinutes: "60", category: "Manutenção" },
      { name: "Lash Lifting e Tintura", description: "Curvatura e hidratação dos cílios naturais com efeito curvex duradouro.", price: "90,00", durationMinutes: "60", category: "Cílios" },
      { name: "Brow Lamination", description: "Alinhamento e laminação dos fios naturais para efeito mais volumoso e moderno.", price: "85,00", durationMinutes: "45", category: "Sobrancelhas" },
      { name: "Design Personalizado (sem Henna)", description: "Alinhamento com pinça, tesoura ou linha conforme formato do rosto.", price: "35,00", durationMinutes: "25", category: "Sobrancelhas" },
      { name: "Micropigmentação (Shadow / Fio a Fio)", description: "Pigmentação semipermanente para preenchimento de falhas com aspecto natural.", price: "280,00", durationMinutes: "120", category: "Micropigmentação" },
      { name: "Epilação Egípcia Facial (Linha)", description: "Remoção de pelos faciais com linha antibacteriana e hipoalergênica.", price: "35,00", durationMinutes: "25", category: "Epilação" },
    ],
  },
  {
    id: "esteticista",
    label: "Estética Facial e Corporal",
    emoji: "✨",
    services: [
      { name: "Limpeza de Pele Profunda", description: "Higienização, emoliência, extração de cravos, alta frequência e máscara calmante.", price: "120,00", durationMinutes: "75", category: "Facial" },
      { name: "Drenagem Linfática Corporal", description: "Massagem suave para retenção de líquidos, pós-operatório ou relaxamento.", price: "100,00", durationMinutes: "60", category: "Corporal" },
      { name: "Massagem Relaxante com Óleos", description: "Alívio de tensões musculares, estresse e relaxamento completo.", price: "110,00", durationMinutes: "60", category: "Relaxamento" },
      { name: "Massagem Modeladora / Redutora", description: "Manobras intensas para redução de medidas e melhora do contorno corporal.", price: "100,00", durationMinutes: "50", category: "Corporal" },
      { name: "Peeling de Diamante / Químico", description: "Renovação celular para controle de oleosidade, manchas e rejuvenescimento.", price: "110,00", durationMinutes: "50", category: "Facial" },
      { name: "Microagulhamento Facial", description: "Estímulo de colágeno para cicatrizes de acne, poros e linhas finas.", price: "160,00", durationMinutes: "60", category: "Facial" },
      { name: "Depilação com Cera Morna", description: "Remoção com cera descartável morna para menor desconforto.", price: "70,00", durationMinutes: "45", category: "Depilação" },
    ],
  },
  {
    id: "marido_aluguel",
    label: "Marido de Aluguel / Reparos Gerais",
    emoji: "🛠️",
    services: [
      { name: "Instalação de Chuveiro Elétrico ou Torneira", description: "Troca e vedação segura com verificação de fiação e vazamentos.", price: "90,00", durationMinutes: "45", category: "Instalações" },
      { name: "Fixação de Suporte de TV, Quadros e Prateleiras", description: "Furação com nível a laser e fixação segura em alvenaria ou drywall.", price: "80,00", durationMinutes: "45", category: "Fixação" },
      { name: "Troca de Tomadas, Interruptores e Disjuntores", description: "Substituição e teste de segurança elétrica.", price: "80,00", durationMinutes: "40", category: "Elétrica" },
      { name: "Desentupimento de Pia, Ralo e Troca de Sifão", description: "Desobstrução e troca de componentes hidráulicos com vazamento.", price: "100,00", durationMinutes: "50", category: "Hidráulica" },
      { name: "Montagem e Regulagem de Móveis Pequenos", description: "Montagem de mesas, cadeiras, racks e estantes.", price: "120,00", durationMinutes: "60", category: "Montagem" },
      { name: "Troca de Fechadura e Maçaneta", description: "Instalação ou reparo de fechaduras internas e externas.", price: "80,00", durationMinutes: "40", category: "Segurança" },
      { name: "Instalação de Cortinas e Persianas", description: "Medição, furação e fixação alinhada de trilhos e varões.", price: "80,00", durationMinutes: "45", category: "Decoração" },
      { name: "Pequenos Reparos de Pintura e Massa", description: "Correção de furos, trincas e retoque pontual de tinta.", price: "120,00", durationMinutes: "90", category: "Pintura" },
    ],
  },
  {
    id: "eletricista",
    label: "Eletricista",
    emoji: "⚡",
    services: [
      { name: "Instalação de Tomadas e Interruptores", description: "Instalação ou substituição de tomadas e interruptores residenciais.", price: "80,00", durationMinutes: "40", category: "Elétrica" },
      { name: "Instalação de Luminárias, Spots e Fitas LED", description: "Instalação de lustres, plafons e iluminação decorativa em geral.", price: "100,00", durationMinutes: "60", category: "Iluminação" },
      { name: "Troca de Disjuntor e Reparo de Curto", description: "Diagnóstico e reparo de curtos, quedas de energia e sobrecargas.", price: "120,00", durationMinutes: "60", category: "Reparo" },
      { name: "Instalação de Chuveiro Elétrico", description: "Troca de chuveiro e cabeamento elétrico adequado.", price: "90,00", durationMinutes: "45", category: "Instalação" },
      { name: "Montagem e Reforma de Quadro Elétrico", description: "Organização e dimensionamento do quadro de distribuição.", price: "250,00", durationMinutes: "120", category: "Quadro" },
      { name: "Passagem de Fiação e Circuitos Novos", description: "Passagem de fiação em eletrodutos para novas cargas e ar-condicionado.", price: "150,00", durationMinutes: "90", category: "Fiação" },
      { name: "Instalação de Ar-Condicionado Split", description: "Ponto elétrico e conexão para ar-condicionado.", price: "180,00", durationMinutes: "90", category: "Climatização" },
      { name: "Aterramento Elétrico e Proteção (DPS)", description: "Instalação de hastes de aterramento e proteção contra descargas.", price: "180,00", durationMinutes: "90", category: "Proteção" },
    ],
  },
  {
    id: "encanador",
    label: "Encanador",
    emoji: "🔧",
    services: [
      { name: "Desentupimento de Pia, Ralo ou Vaso", description: "Desentupimento mecânico rápido sem danificar o encanamento.", price: "120,00", durationMinutes: "60", category: "Desentupimento" },
      { name: "Conserto de Vazamento em Tubulação", description: "Localização e vedação de vazamentos aparentes ou embutidos.", price: "150,00", durationMinutes: "90", category: "Vazamento" },
      { name: "Troca de Torneira, Registro ou Misturador", description: "Substituição e vedação de registros com pinga-pinga.", price: "80,00", durationMinutes: "40", category: "Reparo" },
      { name: "Instalação ou Troca de Vaso Sanitário", description: "Troca de vaso, caixa acoplada, bolsa e anel de vedação.", price: "130,00", durationMinutes: "60", category: "Instalação" },
      { name: "Limpeza e Reparo de Caixa d'Água", description: "Higienização completa e troca de boia ou registros.", price: "180,00", durationMinutes: "120", category: "Manutenção" },
      { name: "Instalação de Purificador e Filtro de Água", description: "Conexão hidráulica segura para purificadores de parede ou bancada.", price: "80,00", durationMinutes: "40", category: "Instalação" },
      { name: "Instalação de Aquecedor a Gás", description: "Instalação hidráulica e regulagem de aquecedor de passagem.", price: "200,00", durationMinutes: "90", category: "Aquecimento" },
    ],
  },
  {
    id: "pintor",
    label: "Pintor",
    emoji: "🖌️",
    services: [
      { name: "Pintura Interna por Cômodo (Paredes e Teto)", description: "Pintura completa com tinta látex ou acrílica premium.", price: "250,00", durationMinutes: "240", category: "Pintura" },
      { name: "Aplicação de Massa Corrida e Lixamento", description: "Nivelamento e preparação fina de paredes antes da pintura.", price: "180,00", durationMinutes: "180", category: "Preparação" },
      { name: "Pintura de Portas, Janelas e Rodapés", description: "Acabamento em esmalte sintético acetinado ou brilhante.", price: "90,00", durationMinutes: "60", category: "Acabamento" },
      { name: "Aplicação de Textura / Grafiato / Cimento Queimado", description: "Efeitos decorativos modernos com alta durabilidade.", price: "280,00", durationMinutes: "240", category: "Especial" },
      { name: "Pintura Externa de Muros e Fachadas", description: "Proteção contra chuva e sol com tinta emborrachada ou acrílica.", price: "450,00", durationMinutes: "480", category: "Externa" },
      { name: "Pintura de Portões e Grades Metálicas", description: "Lixamento de ferrugem, fundo convertedor e esmalte protetor.", price: "150,00", durationMinutes: "120", category: "Metal" },
    ],
  },
  {
    id: "pedreiro",
    label: "Pedreiro / Construção",
    emoji: "🧱",
    services: [
      { name: "Assentamento de Piso Cerâmico / Porcelanato", description: "Nivelamento com espaçadores e acabamento profissional.", price: "60,00", durationMinutes: "60", category: "Piso" },
      { name: "Revestimento de Paredes (Azulejo / Pastilha)", description: "Aplicação alinhada em cozinhas, banheiros e áreas gourmet.", price: "65,00", durationMinutes: "60", category: "Revestimento" },
      { name: "Reboco e Regularização de Paredes", description: "Aplicação de emboço e reboco nivelado para pintura.", price: "50,00", durationMinutes: "60", category: "Alvenaria" },
      { name: "Impermeabilização de Lajes e Banheiros", description: "Aplicação de manta ou impermeabilizante para evitar infiltração.", price: "180,00", durationMinutes: "120", category: "Proteção" },
      { name: "Quebra e Demolição para Reforma", description: "Abertura de portas, vãos ou remoção de paredes com descarte.", price: "200,00", durationMinutes: "180", category: "Demolição" },
      { name: "Execução de Contrapiso Nivelado", description: "Preparo de piso nivelado pronto para receber porcelanato.", price: "55,00", durationMinutes: "60", category: "Piso" },
    ],
  },
  {
    id: "marceneiro",
    label: "Marceneiro e Montador de Móveis",
    emoji: "🪚",
    services: [
      { name: "Montagem de Guarda-Roupa / Armário", description: "Montagem estruturada, regulagem de portas de correr e gavetas.", price: "180,00", durationMinutes: "150", category: "Montagem" },
      { name: "Montagem de Mesa, Cadeiras ou Rack", description: "Montagem rápida e alinhamento de móveis desmontados.", price: "90,00", durationMinutes: "60", category: "Montagem" },
      { name: "Instalação e Fixação de Armários Aéreos", description: "Fixação reforçada com buchas adequadas e nivelamento.", price: "120,00", durationMinutes: "75", category: "Instalação" },
      { name: "Regulagem e Reparo de Portas e Gavetas", description: "Troca de corrediças telescópicas e dobradiças com amortecedor.", price: "80,00", durationMinutes: "45", category: "Reparo" },
      { name: "Fabricação de Prateleiras e Nichos sob Medida", description: "Corte e acabamento em MDF na cor desejada.", price: "150,00", durationMinutes: "90", category: "Sob Medida" },
    ],
  },
  {
    id: "diarista",
    label: "Diarista / Limpeza",
    emoji: "🧹",
    services: [
      { name: "Faxina Residencial Completa (Diária)", description: "Limpeza profunda de banheiros, cozinha, quartos e áreas comuns.", price: "160,00", durationMinutes: "420", category: "Residencial" },
      { name: "Faxina Pesada / Detalhada", description: "Limpeza minuciosa incluindo azulejos, dentro de armários e eletros.", price: "220,00", durationMinutes: "480", category: "Pesada" },
      { name: "Limpeza Pós-Obra", description: "Remoção de respingos de tinta, rejunte, pó fino e resíduos de reforma.", price: "300,00", durationMinutes: "480", category: "Pós-Obra" },
      { name: "Higienização Profunda de Sofá e Estofados", description: "Lavagem a seco com extratora e eliminação de ácaros e odores.", price: "180,00", durationMinutes: "120", category: "Estofados" },
      { name: "Meia-Diária / Limpeza Rápida de Manutenção", description: "Limpeza básica e manutenção de ambientes.", price: "100,00", durationMinutes: "240", category: "Residencial" },
      { name: "Passadoria de Roupas (Diária ou Pacote)", description: "Passadoria cuidadosa de peças do dia a dia e roupas sociais.", price: "150,00", durationMinutes: "360", category: "Roupas" },
    ],
  },
  {
    id: "automotivo",
    label: "Centro Automotivo / Mecânica",
    emoji: "🚗",
    services: [
      { name: "Troca de Óleo do Motor e Filtros", description: "Substituição do óleo lubrificante, filtro de óleo, ar e combustível.", price: "80,00", durationMinutes: "45", category: "Revisão" },
      { name: "Revisão Geral e Troca de Pastilhas de Freio", description: "Checagem do sistema de frenagem, fluídos e suspensão.", price: "180,00", durationMinutes: "90", category: "Freios" },
      { name: "Alinhamento 3D e Balanceamento das Rodas", description: "Alinhamento computadorizado e balanceamento para evitar desgaste.", price: "100,00", durationMinutes: "60", category: "Geometria" },
      { name: "Higienização Interna e Oxi-Sanitização", description: "Limpeza detalhada com ozônio para eliminação de fungos e odores.", price: "130,00", durationMinutes: "90", category: "Estética Auto" },
      { name: "Polimento Comercial e Cristalização", description: "Remoção de riscos leves, restauração da pintura e brilho espelhado.", price: "250,00", durationMinutes: "240", category: "Estética Auto" },
      { name: "Diagnóstico com Scanner Automotivo", description: "Leitura de falhas na injeção eletrônica e sensores do painel.", price: "100,00", durationMinutes: "40", category: "Diagnóstico" },
    ],
  },
  {
    id: "tecnico_ti",
    label: "Técnico em TI / Celular / Informática",
    emoji: "💻",
    services: [
      { name: "Formatação Completa com Backup e Windows", description: "Reinstalação limpa do sistema, ativação de drivers e antivírus.", price: "130,00", durationMinutes: "90", category: "Computador" },
      { name: "Instalação de SSD e Upgrade de Memória RAM", description: "Troca do HD antigo por SSD super rápido e clonagem dos dados.", price: "120,00", durationMinutes: "60", category: "Upgrade" },
      { name: "Remoção de Vírus e Otimização de Lentidão", description: "Limpeza de malwares, inicialização rápida e ajustes de segurança.", price: "90,00", durationMinutes: "60", category: "Manutenção" },
      { name: "Troca de Tela ou Bateria de Celular", description: "Substituição com peças testadas e garantia de funcionamento.", price: "150,00", durationMinutes: "60", category: "Celular" },
      { name: "Configuração de Rede Wi-Fi e Roteador", description: "Otimização de sinal, repetidores Mesh e proteção de senha.", price: "100,00", durationMinutes: "45", category: "Redes" },
    ],
  },
  {
    id: "personal_trainer",
    label: "Personal Trainer / Fitness",
    emoji: "🏋️",
    services: [
      { name: "Mensalidade Personal Trainer (2x por semana)", description: "Acompanhamento presencial focado em objetivos com treino personalizado.", price: "360,00", durationMinutes: "60", category: "Mensalidade" },
      { name: "Mensalidade Personal Trainer (3x por semana)", description: "Treino presencial completo para hipertrofia, emagrecimento ou saúde.", price: "480,00", durationMinutes: "60", category: "Mensalidade" },
      { name: "Sessão Avulsa de Treino Personalizado", description: "Aula individual com foco em execução perfeita e biomecânica.", price: "70,00", durationMinutes: "60", category: "Avulso" },
      { name: "Avaliação Física com Bioimpedância", description: "Medição de percentual de gordura, medidas corporais e metas.", price: "100,00", durationMinutes: "45", category: "Avaliação" },
      { name: "Consultoria e Planilha de Treino Online", description: "Planejamento mensal pelo app com suporte diário via WhatsApp.", price: "150,00", durationMinutes: "45", category: "Online" },
    ],
  },
  {
    id: "cuidador",
    label: "Cuidador / Acompanhante / Enfermagem",
    emoji: "🤝",
    services: [
      { name: "Plantão Diurno Cuidador de Idosos (12h)", description: "Auxílio na higiene, alimentação, medicação no horário e companhia.", price: "180,00", durationMinutes: "720", category: "Plantão" },
      { name: "Plantão Noturno Cuidador de Idosos (12h)", description: "Acompanhamento noturno, segurança e assistência no sono.", price: "200,00", durationMinutes: "720", category: "Plantão" },
      { name: "Acompanhamento a Consultas e Exames", description: "Transporte e assistência durante compromissos médicos.", price: "100,00", durationMinutes: "180", category: "Acompanhamento" },
      { name: "Cuidados Pós-Operatório em Domicílio", description: "Assistência nos primeiros dias de recuperação com conforto.", price: "150,00", durationMinutes: "360", category: "Recuperação" },
    ],
  },
  {
    id: "fotografo",
    label: "Fotógrafo / Criação & Mídia",
    emoji: "📷",
    services: [
      { name: "Ensaio Fotográfico Individual ou Casal (1h)", description: "Sessão externa com direção de poses e fotos tratadas em alta resolução.", price: "280,00", durationMinutes: "60", category: "Ensaio" },
      { name: "Cobertura Fotográfica de Evento (por hora)", description: "Registro completo de aniversários, batizados ou comemorações.", price: "200,00", durationMinutes: "60", category: "Evento" },
      { name: "Ensaio Corporativo / Foto de Perfil Profissional", description: "Fotos pensadas para LinkedIn, WhatsApp empresarial e sites.", price: "220,00", durationMinutes: "60", category: "Corporativo" },
      { name: "Criação de Logotipo e Identidade Visual", description: "Design profissional completo com paleta de cores e tipografia.", price: "350,00", durationMinutes: "120", category: "Design" },
      { name: "Gravação e Edição de Vídeo Reels / TikTok", description: "Captação dinâmica em 4K e edição rápida com legendas.", price: "150,00", durationMinutes: "60", category: "Vídeo" },
    ],
  },
  {
    id: "veterinario",
    label: "Veterinário / Pet",
    emoji: "🐾",
    services: [
      { name: "Banho e Tosa Higiênica Completa", description: "Banho com produtos hipoalergênicos, tosa, corte de unhas e limpeza de ouvidos.", price: "75,00", durationMinutes: "75", category: "Estética Pet" },
      { name: "Consulta Veterinária em Domicílio", description: "Atendimento no conforto de casa sem o estresse do transporte.", price: "150,00", durationMinutes: "60", category: "Saúde" },
      { name: "Passeio Dog Walker (45 minutos)", description: "Passeio estimulante com foco em gasto de energia e bem-estar do pet.", price: "40,00", durationMinutes: "45", category: "Passeio" },
      { name: "Hospedagem Familiar / Pet Sitter (Diária)", description: "Cuidados amorosos em ambiente familiar com fotos e vídeos diários.", price: "70,00", durationMinutes: "60", category: "Hospedagem" },
      { name: "Aplicação de Vacinas e Vermífugo", description: "Vacinação com carteirinha oficial e orientação preventiva.", price: "80,00", durationMinutes: "30", category: "Saúde" },
    ],
  },
  {
    id: "eventos",
    label: "Eventos e Gastronomia",
    emoji: "🎉",
    services: [
      { name: "Serviço de Garçom / Bartender para Festa (4h)", description: "Atendimento atencioso e preparo de drinks durante todo o evento.", price: "160,00", durationMinutes: "240", category: "Atendimento" },
      { name: "Churrasqueiro Profissional para Eventos (4h)", description: "Preparo de cortes no ponto certo, aperitivos e organização da grelha.", price: "200,00", durationMinutes: "240", category: "Buffet" },
      { name: "Bolo Decorado e Kit Festa (Cento de Doces)", description: "Bolo artesanal personalizado com brigadeiros e beijinhos tradicionais.", price: "190,00", durationMinutes: "120", category: "Confeitaria" },
      { name: "Decoração de Festa Temática Completa", description: "Montagem de painel, mesa de doces, arco de balões e suportes.", price: "450,00", durationMinutes: "180", category: "Decoração" },
      { name: "DJ com Sonorização e Iluminação (4h)", description: "Trilha sonora personalizada com caixas de som e efeitos de luz.", price: "400,00", durationMinutes: "240", category: "Música" },
    ],
  },
  {
    id: "aulas",
    label: "Aulas e Consultoria",
    emoji: "📚",
    services: [
      { name: "Aula Particular Individual (1 hora)", description: "Reforço escolar ou aula prática personalizada com material de apoio.", price: "70,00", durationMinutes: "60", category: "Aula" },
      { name: "Pacote Mensal de 4 Aulas Particulares", description: "Acompanhamento semanal contínuo com avaliação de progresso.", price: "250,00", durationMinutes: "60", category: "Pacote" },
      { name: "Sessão de Consultoria / Assessoria Especializada", description: "Diagnóstico, plano de ação e orientações práticas para o seu objetivo.", price: "150,00", durationMinutes: "60", category: "Consultoria" },
    ],
  },
  {
    id: "nutricionista",
    label: "Nutricionista",
    emoji: "🥗",
    services: [
      { name: "Consulta Nutricional + Plano Alimentar", description: "Avaliação física, anamnese completa e cardápio individualizado.", price: "180,00", durationMinutes: "60", category: "Consulta" },
      { name: "Retorno Nutricional e Bioimpedância", description: "Acompanhamento de resultados e ajustes no plano alimentar.", price: "90,00", durationMinutes: "35", category: "Retorno" },
      { name: "Acompanhamento Nutricional Mensal", description: "Suporte contínuo para emagrecimento saudável ou hipertrofia.", price: "260,00", durationMinutes: "60", category: "Pacote" },
    ],
  },
  {
    id: "jardineiro",
    label: "Jardineiro",
    emoji: "🌿",
    services: [
      { name: "Corte e Nivelamento de Grama", description: "Corte uniforme com roçadeira, acabamento nos cantos e recolhimento.", price: "120,00", durationMinutes: "120", category: "Jardim" },
      { name: "Poda de Árvores e Arbustos", description: "Poda de contenção, limpeza e conformação estética de cercas vivas.", price: "140,00", durationMinutes: "90", category: "Poda" },
      { name: "Limpeza Completa de Terreno", description: "Roçagem de mato alto e limpeza geral de área externa.", price: "250,00", durationMinutes: "240", category: "Limpeza" },
      { name: "Plantio e Adubação de Jardim", description: "Preparo do solo com adubo orgânico e plantio de mudas e flores.", price: "150,00", durationMinutes: "120", category: "Plantio" },
    ],
  },
  {
    id: "chaveiro",
    label: "Chaveiro",
    emoji: "🔑",
    services: [
      { name: "Abertura de Porta Residencial sem Chave", description: "Abertura técnica rápida sem danificar a porta ou fechadura.", price: "120,00", durationMinutes: "30", category: "Emergência" },
      { name: "Instalação de Fechadura Digital / Eletrônica", description: "Instalação com furação precisa e configuração de senhas ou biometria.", price: "150,00", durationMinutes: "60", category: "Instalação" },
      { name: "Cópia de Chave Simples ou Tetra", description: "Cópia rápida e testada de chaves residenciais ou automotivas.", price: "20,00", durationMinutes: "15", category: "Cópia" },
      { name: "Troca de Segredo de Fechadura", description: "Alteração dos pinos internos para anular chaves antigas com segurança.", price: "90,00", durationMinutes: "45", category: "Segurança" },
    ],
  },
];

// Função inteligente que retorna os serviços recomendados para a profissão ou atividade escolhida
export function getRecommendedServicesForProfession(
  professionName: string,
  categoryName?: string
): CatalogService[] {
  if (!professionName && !categoryName) {
    // Padrão versátil
    return [
      { name: "Atendimento Padrão", description: "Atendimento profissional completo.", price: "100,00", durationMinutes: "60" },
      { name: "Consulta / Avaliação Inicial", description: "Diagnóstico e planejamento de atendimento.", price: "80,00", durationMinutes: "45" },
      { name: "Visita Técnica e Orçamento", description: "Visita presencial para avaliação detalhada do serviço.", price: "50,00", durationMinutes: "30" },
    ];
  }

  const clean = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const pClean = clean(professionName || "");
  const cClean = clean(categoryName || "");
  const combined = `${pClean} ${cClean}`;

  // 1. Estúdio de Beleza Multisserviços / Beleza Integrada / Cabelo + Unhas + Cílios
  if (
    combined.includes("multis") &&
    (combined.includes("beleza") || combined.includes("cabelo") || combined.includes("unha") || combined.includes("cilio") || combined.includes("estudio")) ||
    combined.includes("estudio de beleza") ||
    combined.includes("espaco de beleza") ||
    combined.includes("beauty studio")
  ) {
    return [
      { name: "Corte Feminino + Escova", description: "Corte personalizado, lavagem especial e escovação modelada.", price: "90,00", durationMinutes: "60", category: "Cabelo" },
      { name: "Esmaltação em Gel", description: "Aplicação de esmalte em gel com cura em cabine LED/UV (duração de até 20 dias).", price: "65,00", durationMinutes: "60", category: "Unhas" },
      { name: "Design de Sobrancelhas com Henna", description: "Mapeamento facial simétrico e aplicação de henna para realce do olhar.", price: "45,00", durationMinutes: "35", category: "Sobrancelhas" },
      { name: "Extensão de Cílios (Fio a Fio)", description: "Aplicação minuciosa de fios individuais com acabamento natural e elegante.", price: "130,00", durationMinutes: "120", category: "Cílios" },
      { name: "Alongamento de Unhas em Fibra de Vidro", description: "Unhas longas, resistentes e com acabamento ultra natural.", price: "130,00", durationMinutes: "120", category: "Unhas" },
      { name: "Progressiva / Alinhamento Térmico", description: "Redução de volume e frizz intenso com brilho espelhado.", price: "180,00", durationMinutes: "150", category: "Cabelo" },
      { name: "Limpeza de Pele Profunda", description: "Higienização, emoliência, extração de cravos e máscara calmante revitalizadora.", price: "120,00", durationMinutes: "75", category: "Estética" },
      { name: "Manicure + Pedicure Tradicional", description: "Cutilagem funda e esmaltação completa com materiais esterilizados.", price: "60,00", durationMinutes: "60", category: "Unhas" },
      { name: "Lash Lifting e Tintura", description: "Curvatura dos cílios naturais com efeito curvex e cor marcante.", price: "90,00", durationMinutes: "60", category: "Cílios" },
    ];
  }

  // 2. Cabeleireiro / Barbeiro
  if (combined.includes("cabeleireir") || combined.includes("barbeir") || combined.includes("cabelo")) {
    const isBarber = combined.includes("barbeir");
    if (isBarber) {
      return [
        { name: "Corte Masculino e Barboterapia", description: "Corte degradê/social com toalha quente e navalha afiada.", price: "60,00", durationMinutes: "45" },
        { name: "Corte Masculino Degradê / Social", description: "Corte com acabamento no pezinho e finalização.", price: "40,00", durationMinutes: "35" },
        { name: "Barba Completa com Toalha Quente", description: "Alinhamento com navalha, óleo hidratante e toalha quente relaxante.", price: "35,00", durationMinutes: "30" },
        { name: "Corte + Barba (Combo)", description: "Produção completa para cabelo e barba alinhados.", price: "70,00", durationMinutes: "60" },
        { name: "Platinado / Luzes Masculino", description: "Descoloração global ou mechas com matização.", price: "120,00", durationMinutes: "120" },
        { name: "Sobrancelha na Navalha ou Pinça", description: "Limpeza e alinhamento dos fios.", price: "15,00", durationMinutes: "15" },
      ];
    }
    return [
      { name: "Corte Feminino + Escova", description: "Corte personalizado, lavagem especial e escovação modelada.", price: "90,00", durationMinutes: "60" },
      { name: "Progressiva / Alinhamento Térmico", description: "Redução de volume e frizz intenso com efeito espelhado.", price: "180,00", durationMinutes: "150" },
      { name: "Mechas / Luzes / Balayage", description: "Técnicas de clareamento com tonalização e tratamento reconstrutor.", price: "250,00", durationMinutes: "180" },
      { name: "Coloração e Cobertura de Brancos", description: "Aplicação de tinta profissional com proteção da fibra capilar.", price: "120,00", durationMinutes: "90" },
      { name: "Botox Capilar / Cronograma Hidratação", description: "Reposição de massa e brilho para cabelos danificados.", price: "110,00", durationMinutes: "60" },
      { name: "Lavagem Especial e Escova Modelada", description: "Higienização profunda com escova lisa ou com ondas.", price: "50,00", durationMinutes: "40" },
    ];
  }

  // 3. Manicure / Pedicure / Unhas
  if (combined.includes("manicure") || combined.includes("pedicure") || combined.includes("unha") || combined.includes("nail")) {
    return [
      { name: "Esmaltação em Gel", description: "Aplicação de esmalte em gel com cura em cabine LED/UV (dura até 20 dias).", price: "65,00", durationMinutes: "60" },
      { name: "Unhas de Gel / Fibra de Vidro", description: "Alongamento com acabamento natural, curvatura C e alta resistência.", price: "130,00", durationMinutes: "120" },
      { name: "Manutenção de Gel / Fibra", description: "Nivelamento, troca de cor e reforço na estrutura da unha crescida.", price: "90,00", durationMinutes: "90" },
      { name: "Manicure + Pedicure Tradicional", description: "Cutilagem funda e esmaltação completa com materiais esterilizados.", price: "60,00", durationMinutes: "60" },
      { name: "Blindagem / Banho de Gel", description: "Camada protetora para fortalecimento das unhas naturais contra quebras.", price: "70,00", durationMinutes: "50" },
      { name: "Spa dos Pés com Esfoliação e Massagem", description: "Remoção de calosidades, esfoliação profunda e hidratação.", price: "50,00", durationMinutes: "45" },
    ];
  }

  // 4. Sobrancelhas / Cílios / Lash
  if (combined.includes("sobrancelha") || combined.includes("cilio") || combined.includes("lash") || combined.includes("micropigment")) {
    return [
      { name: "Design de Sobrancelhas com Henna", description: "Mapeamento facial com paquímetro e aplicação simétrica de henna.", price: "45,00", durationMinutes: "35" },
      { name: "Extensão de Cílios (Fio a Fio)", description: "Aplicação individual para alongamento natural do olhar.", price: "130,00", durationMinutes: "120" },
      { name: "Extensão de Cílios (Volume Russo)", description: "Fans artesanais de alta densidade para efeito marcante.", price: "160,00", durationMinutes: "150" },
      { name: "Manutenção de Extensão de Cílios", description: "Preenchimento de fios soltos para manter o olhar preenchido.", price: "80,00", durationMinutes: "60" },
      { name: "Lash Lifting com Hidratação", description: "Curvatura e efeito curvex nos próprios cílios naturais.", price: "90,00", durationMinutes: "60" },
      { name: "Brow Lamination", description: "Alinhamento e efeito volumoso e moderno para sobrancelhas rebeldes.", price: "85,00", durationMinutes: "45" },
      { name: "Design Personalizado de Sobrancelhas", description: "Limpeza e formato ideal sem aplicação de henna.", price: "35,00", durationMinutes: "25" },
    ];
  }

  // 5. Estética / Massagem / Depilação
  if (combined.includes("estetic") || combined.includes("masso") || combined.includes("drenagem") || combined.includes("depila")) {
    return [
      { name: "Limpeza de Pele Profunda", description: "Higienização, emoliência, extração de cravos e máscara calmante.", price: "120,00", durationMinutes: "75" },
      { name: "Drenagem Linfática Corporal", description: "Massagem suave para retenção de líquidos e desinchaço.", price: "100,00", durationMinutes: "60" },
      { name: "Massagem Relaxante com Óleos", description: "Alívio imediato de tensões musculares e estresse.", price: "110,00", durationMinutes: "60" },
      { name: "Massagem Modeladora / Redutora", description: "Manobras intensas para redução de medidas corporais.", price: "100,00", durationMinutes: "50" },
      { name: "Peeling de Diamante / Renovação Facial", description: "Esfoliação profunda para renovação celular e viço.", price: "110,00", durationMinutes: "50" },
      { name: "Depilação com Cera Morna", description: "Remoção higiênica e rápida com cera descartável morna.", price: "70,00", durationMinutes: "45" },
    ];
  }

  // 6. Marido de Aluguel / Reparos e Manutenção Multisserviços / Faz-Tudo / Casa e Manutenção
  if (
    combined.includes("marido de aluguel") ||
    combined.includes("pequenos reparos") ||
    combined.includes("casa e manutencao") ||
    combined.includes("casa e reforma") ||
    combined.includes("manutencao residencial") ||
    combined.includes("reparos e manutencao") ||
    (combined.includes("casa") && combined.includes("manutenc")) ||
    (combined.includes("reparo") && combined.includes("manutencao")) ||
    (combined.includes("multis") && (combined.includes("casa") || combined.includes("reparo") || combined.includes("instalac") || combined.includes("manutencao"))) ||
    combined.includes("faz-tudo") ||
    combined.includes("servicos gerais")
  ) {
    return [
      { name: "Instalação de Chuveiro Elétrico ou Torneira", description: "Troca, vedação correta e teste de segurança elétrica/hidráulica.", price: "90,00", durationMinutes: "45" },
      { name: "Fixação de Suporte de TV, Quadros e Prateleiras", description: "Furação precisa com nível a laser e fixação segura.", price: "80,00", durationMinutes: "45" },
      { name: "Troca de Tomadas, Interruptores e Disjuntores", description: "Substituição e testes elétricos de segurança.", price: "80,00", durationMinutes: "40" },
      { name: "Desentupimento de Pia, Ralo e Troca de Sifão", description: "Desobstrução rápida e eliminação de vazamentos sob a pia.", price: "100,00", durationMinutes: "50" },
      { name: "Montagem ou Regulagem de Móveis", description: "Montagem de móveis comprados pela internet ou ajuste de portas/gavetas.", price: "120,00", durationMinutes: "60" },
      { name: "Troca de Fechadura, Miolo ou Maçaneta", description: "Instalação de fechaduras convencionais ou travas adicionais.", price: "80,00", durationMinutes: "40" },
      { name: "Instalação de Cortinas e Persianas", description: "Medição, furação e fixação alinhada de trilhos e varões.", price: "80,00", durationMinutes: "45" },
      { name: "Pequenos Reparos de Pintura e Retoque de Massa", description: "Fechamento de furos de broca e retoque pontual.", price: "120,00", durationMinutes: "90" },
    ];
  }

  // 7. Eletricista
  if (combined.includes("eletric")) {
    return [
      { name: "Instalação de Tomadas e Interruptores", description: "Instalação ou substituição de tomadas e interruptores residenciais.", price: "80,00", durationMinutes: "40" },
      { name: "Instalação de Luminárias, Spots e Fitas LED", description: "Instalação de lustres, pendentes e iluminação decorativa.", price: "100,00", durationMinutes: "60" },
      { name: "Troca de Disjuntor e Reparo de Curto", description: "Diagnóstico e reparo de quedas de energia e curtos.", price: "120,00", durationMinutes: "60" },
      { name: "Instalação de Chuveiro Elétrico", description: "Troca de chuveiro e fiação compatível com o disjuntor.", price: "90,00", durationMinutes: "45" },
      { name: "Montagem e Organização de Quadro de Luz", description: "Balanceamento de circuitos e instalação de DPS/DR.", price: "250,00", durationMinutes: "120" },
      { name: "Ponto Elétrico para Ar-Condicionado", description: "Circuito exclusivo com disjuntor dedicado e tubulação.", price: "180,00", durationMinutes: "90" },
    ];
  }

  // 8. Encanador
  if (combined.includes("encanad") || combined.includes("hidraul")) {
    return [
      { name: "Desentupimento de Pia, Ralo ou Vaso", description: "Desobstrução rápida com equipamento mecânico.", price: "120,00", durationMinutes: "60" },
      { name: "Conserto de Vazamento em Tubulação", description: "Localização precisa e reparo de tubos com vazamento.", price: "150,00", durationMinutes: "90" },
      { name: "Troca de Torneira, Registro ou Misturador", description: "Substituição e vedação de registros com pinga-pinga.", price: "80,00", durationMinutes: "40" },
      { name: "Instalação de Vaso Sanitário e Caixa Acoplada", description: "Montagem, anel de vedação e ligação flexível.", price: "130,00", durationMinutes: "60" },
      { name: "Limpeza de Caixa d'Água Residencial", description: "Esvaziamento, escovação e desinfecção com cloro.", price: "180,00", durationMinutes: "120" },
    ];
  }

  // 9. Pintor
  if (combined.includes("pintor") || combined.includes("pintura")) {
    return [
      { name: "Pintura Interna de Cômodo (Paredes e Teto)", description: "Pintura completa com tinta látex ou acrílica premium.", price: "250,00", durationMinutes: "240" },
      { name: "Aplicação de Massa Corrida e Lixamento", description: "Regularização fina de paredes antes da pintura.", price: "180,00", durationMinutes: "180" },
      { name: "Pintura de Portas, Janelas e Rodapés", description: "Acabamento acetinado ou brilhante em esmalte sintético.", price: "90,00", durationMinutes: "60" },
      { name: "Aplicação de Efeito Cimento Queimado / Textura", description: "Efeito decorativo sofisticado para parede de destaque.", price: "280,00", durationMinutes: "240" },
      { name: "Pintura Externa de Muros e Fachada", description: "Aplicação de tinta emborrachada resistente a intempéries.", price: "450,00", durationMinutes: "480" },
    ];
  }

  // 10. Diarista / Faxina / Limpeza
  if (combined.includes("diarist") || combined.includes("faxin") || combined.includes("limpeza")) {
    return [
      { name: "Faxina Residencial Completa (Diária)", description: "Limpeza detalhada de banheiros, cozinha, quartos e salas.", price: "160,00", durationMinutes: "420" },
      { name: "Faxina Pesada Detalhada", description: "Limpeza profunda de azulejos, dentro de armários e eletros.", price: "220,00", durationMinutes: "480" },
      { name: "Limpeza Pós-Obra", description: "Remoção de pós de reforma, restos de tinta e rejuntes.", price: "300,00", durationMinutes: "480" },
      { name: "Higienização Profunda de Sofá e Estofados", description: "Lavagem com extratora profissional e secagem rápida.", price: "180,00", durationMinutes: "120" },
      { name: "Passadoria de Roupas (Diária ou Pacote)", description: "Passar e organizar peças sociais e do cotidiano.", price: "150,00", durationMinutes: "360" },
    ];
  }

  // 11. Automotivo / Mecânico
  if (combined.includes("auto") || combined.includes("mecanic") || combined.includes("carro") || combined.includes("oficina")) {
    return [
      { name: "Troca de Óleo do Motor e Filtros", description: "Óleo especificado pelo fabricante e filtros de ar/óleo.", price: "80,00", durationMinutes: "45" },
      { name: "Revisão Preventiva de Freios e Pastilhas", description: "Inspeção de pastilhas, discos, fluido e lonas.", price: "180,00", durationMinutes: "90" },
      { name: "Alinhamento 3D e Balanceamento", description: "Correção de direção e estabilidade das 4 rodas.", price: "100,00", durationMinutes: "60" },
      { name: "Higienização Interna e Oxi-Sanitização", description: "Limpeza e esterilização do ar-condicionado e cabine.", price: "130,00", durationMinutes: "90" },
      { name: "Polimento Comercial e Cristalização", description: "Recuperação do brilho e proteção da pintura contra sol.", price: "250,00", durationMinutes: "240" },
    ];
  }

  // 12. TI / Informática / Celular
  if (combined.includes("ti") || combined.includes("computad") || combined.includes("informatica") || combined.includes("celular")) {
    return [
      { name: "Formatação Completa com Backup e Windows", description: "Reinstalação limpa do SO, antivírus e programas básicos.", price: "130,00", durationMinutes: "90" },
      { name: "Instalação de SSD e Aceleração do Computador", description: "Substituição do HD por SSD com clonagem dos seus dados.", price: "120,00", durationMinutes: "60" },
      { name: "Remoção de Vírus e Otimização de Lentidão", description: "Limpeza profunda de programas maliciosos e travamentos.", price: "90,00", durationMinutes: "60" },
      { name: "Troca de Tela ou Bateria de Smartphone", description: "Substituição de display ou bateria com garantia.", price: "150,00", durationMinutes: "60" },
      { name: "Configuração de Rede Wi-Fi Residencial", description: "Roteador, repetidores e segurança da rede doméstica.", price: "100,00", durationMinutes: "45" },
    ];
  }

  // 13. Personal Trainer / Fitness
  if (combined.includes("personal") || combined.includes("treino") || combined.includes("fitness") || combined.includes("pilates")) {
    return [
      { name: "Mensalidade Personal Trainer (2x por semana)", description: "Acompanhamento presencial individualizado.", price: "360,00", durationMinutes: "60" },
      { name: "Sessão Avulsa de Treino Personalizado", description: "Aula presencial com foco na execução e carga adequada.", price: "70,00", durationMinutes: "60" },
      { name: "Avaliação Física com Bioimpedância", description: "Medição de composição corporal e definição de metas.", price: "100,00", durationMinutes: "45" },
      { name: "Consultoria e Planilha de Treino Online", description: "Prescrição de treino pelo app e suporte via WhatsApp.", price: "150,00", durationMinutes: "45" },
    ];
  }

  // 14. Fotografia / Mídia / Design
  if (combined.includes("foto") || combined.includes("video") || combined.includes("design") || combined.includes("social media")) {
    return [
      { name: "Ensaio Fotográfico Individual ou Casal (1h)", description: "Sessão com fotos selecionadas e tratadas profissionalmente.", price: "280,00", durationMinutes: "60" },
      { name: "Cobertura Fotográfica de Eventos (por hora)", description: "Registro completo de aniversários ou comemorações.", price: "200,00", durationMinutes: "60" },
      { name: "Criação de Logotipo e Identidade Visual", description: "Logotipo profissional em vetor com versões para redes.", price: "350,00", durationMinutes: "120" },
      { name: "Pacote Mensal de Posts para Redes Sociais", description: "Criação de artes estratégicas para Instagram e Facebook.", price: "450,00", durationMinutes: "180" },
    ];
  }

  if (
    combined.includes("pet") ||
    combined.includes("veterinar") ||
    /\bca[oe]s?\b/.test(combined) ||
    combined.includes("cachorr") ||
    combined.includes("canin") ||
    combined.includes("felin") ||
    combined.includes("gato") ||
    combined.includes("banho e tosa")
  ) {
    return [
      { name: "Banho e Tosa Higiênica Completa", description: "Banho com hidratação, tosa, corte de unhas e limpeza de ouvidos.", price: "75,00", durationMinutes: "75" },
      { name: "Consulta Veterinária em Domicílio", description: "Atendimento no conforto de casa sem estresse para o pet.", price: "150,00", durationMinutes: "60" },
      { name: "Passeio Dog Walker (45 minutos)", description: "Passeio estimulante para gasto de energia do cão.", price: "40,00", durationMinutes: "45" },
      { name: "Hospedagem Familiar / Pet Sitter (Diária)", description: "Cuidados dedicados em ambiente seguro com atualizações diárias.", price: "70,00", durationMinutes: "60" },
    ];
  }

  // 16. Eventos / Gastronomia
  if (combined.includes("evento") || combined.includes("festa") || combined.includes("buffet") || combined.includes("confeit") || combined.includes("doce")) {
    return [
      { name: "Serviço de Garçom / Bartender para Festa (4h)", description: "Atendimento atencioso e preparo de drinks durante o evento.", price: "160,00", durationMinutes: "240" },
      { name: "Churrasqueiro Profissional para Eventos (4h)", description: "Preparo de carnes no ponto ideal, cortes e aperitivos.", price: "200,00", durationMinutes: "240" },
      { name: "Bolo Decorado e Kit Festa (Cento de Doces)", description: "Bolo artesanal personalizado com doces tradicionais.", price: "190,00", durationMinutes: "120" },
      { name: "Decoração de Festa Temática Completa", description: "Montagem de painel, mesa de doces e arco de balões.", price: "450,00", durationMinutes: "180" },
    ];
  }

  // 17. Aulas e Consultoria
  if (combined.includes("aula") || combined.includes("professor") || combined.includes("consultor")) {
    return [
      { name: "Aula Particular Individual (1 hora)", description: "Reforço e aprendizado focado no ritmo do aluno.", price: "70,00", durationMinutes: "60" },
      { name: "Pacote Mensal de 4 Aulas Particulares", description: "Acompanhamento semanal com material incluso.", price: "250,00", durationMinutes: "60" },
      { name: "Sessão de Consultoria / Assessoria Estratégica", description: "Diagnóstico e plano de ação focado nos seus objetivos.", price: "150,00", durationMinutes: "60" },
    ];
  }

  // Fallback: tentar correspondência direta no catálogo geral
  const directMatch = SERVICE_CATALOG.find(
    (c) =>
      clean(c.label).includes(pClean) ||
      pClean.includes(clean(c.label)) ||
      clean(c.id).includes(pClean)
  );

  if (directMatch && directMatch.services.length > 0) {
    return directMatch.services.slice(0, 6);
  }

  // Fallback padrão amigável
  return [
    { name: `Atendimento Inicial — ${professionName}`, description: "Atendimento padrão com foco nas necessidades do cliente.", price: "100,00", durationMinutes: "60" },
    { name: "Avaliação / Diagnóstico Especializado", description: "Avaliação detalhada para planejamento da execução.", price: "80,00", durationMinutes: "45" },
    { name: "Visita Técnica e Orçamento", description: "Visita presencial para vistoria e levantamento de custos.", price: "50,00", durationMinutes: "30" },
    { name: "Pacote de Serviços Personalizado", description: "Atendimento completo com garantia de satisfação.", price: "180,00", durationMinutes: "120" },
  ];
}

// Retorna um placeholder contextualizado para o nome do serviço
export function getServicePlaceholderForProfession(professionName: string): string {
  if (!professionName) return "Ex.: Instalação elétrica residencial";
  const lower = professionName.toLowerCase();

  if (lower.includes("beleza") || lower.includes("estúdio") || lower.includes("estudio") || lower.includes("multisserviço")) {
    return "Ex.: Corte Feminino + Escova, Esmaltação em Gel ou Cílios";
  }
  if (lower.includes("cabel") || lower.includes("barb")) {
    return "Ex.: Corte Feminino + Escova ou Progressiva";
  }
  if (lower.includes("manicure") || lower.includes("pedicure") || lower.includes("unha")) {
    return "Ex.: Esmaltação em Gel ou Alongamento Fibra de Vidro";
  }
  if (lower.includes("sobrancelha") || lower.includes("cílio") || lower.includes("cilio") || lower.includes("lash")) {
    return "Ex.: Design com Henna ou Alongamento de Cílios";
  }
  if (lower.includes("marido de aluguel") || lower.includes("reparo") || lower.includes("manuten")) {
    return "Ex.: Instalação de chuveiro, prateleiras ou reparos gerais";
  }
  if (lower.includes("eletric")) {
    return "Ex.: Instalação de luminárias ou troca de disjuntor";
  }
  if (lower.includes("encanad")) {
    return "Ex.: Desentupimento de pia ou reparo de vazamento";
  }
  if (lower.includes("pintor") || lower.includes("pintura")) {
    return "Ex.: Pintura de cômodo ou aplicação de massa corrida";
  }
  if (lower.includes("diarist") || lower.includes("faxin") || lower.includes("limpeza")) {
    return "Ex.: Faxina residencial completa (diária)";
  }
  if (lower.includes("ti") || lower.includes("computador") || lower.includes("celular")) {
    return "Ex.: Formatação de computador ou troca de tela";
  }
  if (lower.includes("auto") || lower.includes("mecanic")) {
    return "Ex.: Troca de óleo e filtros ou revisão geral";
  }
  if (lower.includes("personal") || lower.includes("treino")) {
    return "Ex.: Mensalidade Personal Trainer (2x/semana)";
  }
  return "Ex.: Atendimento padrão ou serviço principal";
}

// Retorna sugestões de papéis/cargos e placeholder para cadastro de membros de equipe com base no ramo do negócio
export function getTeamRoleSuggestionsForProfession(
  professionName?: string,
  categoryName?: string
): { suggestions: string[]; placeholder: string } {
  const clean = (str: string) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const combined = `${clean(professionName || "")} ${clean(categoryName || "")}`;

  // 1. Beleza, Estética, Salão, Cabelo, Unhas, Cílios
  if (
    combined.includes("beleza") ||
    combined.includes("cabel") ||
    combined.includes("unha") ||
    combined.includes("cilio") ||
    combined.includes("estetica") ||
    combined.includes("salao") ||
    combined.includes("estudio") ||
    combined.includes("spa")
  ) {
    return {
      placeholder: "Ex.: Manicure & Nail Designer",
      suggestions: [
        "Cabeleireira(o) / Colorista",
        "Manicure & Nail Designer",
        "Designer de Sobrancelhas",
        "Lash Designer (Cílios)",
        "Esteticista Facial & Corporal",
        "Maquiadora Profissional",
        "Barbeiro / Barboterapeuta",
        "Podóloga / Podólogo",
        "Massoterapeuta / Depiladora",
        "Tatuador(a) / Body Piercer"
      ]
    };
  }

  // 2. Casa, Reparos, Construção, Manutenção
  if (
    combined.includes("casa") ||
    combined.includes("manutenc") ||
    combined.includes("reparo") ||
    combined.includes("eletric") ||
    combined.includes("encanad") ||
    combined.includes("pintor") ||
    combined.includes("pedreir") ||
    combined.includes("marido") ||
    combined.includes("obra") ||
    combined.includes("reforma")
  ) {
    return {
      placeholder: "Ex.: Eletricista Parceiro(a)",
      suggestions: [
        "Eletricista Parceiro(a)",
        "Encanador(a) / Instalador(a)",
        "Pintor(a) Residencial",
        "Marceneiro(a) / Montador(a)",
        "Pedreiro(a) / Azulejista",
        "Técnico(a) de Ar-Condicionado",
        "Vidraceiro(a) / Serralheiro(a)",
        "Gesseiro(a) / Drywall",
        "Jardineiro(a) / Piscineiro(a)"
      ]
    };
  }

  // 3. Automotivo
  if (combined.includes("auto") || combined.includes("mecanic") || combined.includes("carro") || combined.includes("oficina")) {
    return {
      placeholder: "Ex.: Mecânico(a) Geral",
      suggestions: [
        "Mecânico(a) Geral",
        "Eletricista Automotivo",
        "Funileiro(a) / Pintor(a)",
        "Estética Automotiva / Detalhador",
        "Alinhador(a) / Geometria",
        "Borracheiro(a)",
        "Instalador(a) de Som & Acessórios"
      ]
    };
  }

  // 4. Tecnologia, Design, Mídia
  if (combined.includes("tecnolog") || combined.includes("ti") || combined.includes("midia") || combined.includes("design") || combined.includes("foto")) {
    return {
      placeholder: "Ex.: Fotógrafo(a) ou Designer",
      suggestions: [
        "Fotógrafo(a)",
        "Videomaker / Filmaker",
        "Designer Gráfico",
        "Editor(a) de Vídeo",
        "Social Media & Tráfego",
        "Desenvolvedor(a) Web/App",
        "Técnico(a) de Suporte / Hardware"
      ]
    };
  }

  // 5. Saúde, Terapias, Bem-estar
  if (combined.includes("saude") || combined.includes("bem-estar") || combined.includes("terapia") || combined.includes("personal")) {
    return {
      placeholder: "Ex.: Fisioterapeuta ou Nutricionista",
      suggestions: [
        "Personal Trainer",
        "Fisioterapeuta",
        "Nutricionista",
        "Massoterapeuta",
        "Psicólogo(a)",
        "Terapeuta Holístico(a)",
        "Instrutor(a) de Pilates / Yoga",
        "Cuidador(a) / Enfermagem"
      ]
    };
  }

  // 6. Eventos, Gastronomia, Festas
  if (combined.includes("evento") || combined.includes("festa") || combined.includes("gastronom") || combined.includes("buffet")) {
    return {
      placeholder: "Ex.: Confeiteiro(a) ou Bartender",
      suggestions: [
        "Confeiteiro(a) / Doceiro(a)",
        "Churrasqueiro(a)",
        "Garçom / Bartender",
        "Decorador(a) de Festas",
        "DJ / Sonorização",
        "Cerimonialista / Produtor(a)"
      ]
    };
  }

  return {
    placeholder: "Ex.: Especialista Parceiro(a)",
    suggestions: [
      "Profissional Parceiro(a)",
      "Atendente Especialista",
      "Prestador(a) Associado(a)",
      "Técnico(a) Especialista",
      "Consultor(a) Parceiro(a)"
    ]
  };
}

