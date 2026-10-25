export interface BrazilianState {
  uf: string;
  name: string;
  cities: string[];
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  {
    uf: "AC",
    name: "Acre",
    cities: [
      "Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó",
      "Brasiléia", "Senador Guiomard", "Plácido de Castro", "Xapuri", "Mâncio Lima",
      "Epitaciolândia", "Acrelândia", "Porto Acre", "Bujari", "Capixaba"
    ]
  },
  {
    uf: "AL",
    name: "Alagoas",
    cities: [
      "Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares",
      "Penedo", "São Miguel dos Campos", "Campo Alegre", "Coruripe", "Delmiro Gouveia",
      "Marechal Deodoro", "Santana do Ipanema", "Atalaia", "Teotônio Vilela", "Pilar",
      "Girau do Ponciano", "São Sebastião", "Mata Grande", "Boca da Mata"
    ]
  },
  {
    uf: "AP",
    name: "Amapá",
    cities: [
      "Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande",
      "Mazagão", "Tartarugalzinho", "Vitória do Jari", "Calçoene", "Amapá",
      "Ferreira Gomes", "Cutias", "Itaubal", "Pedra Branca do Amapari", "Pracuúba", "Serra do Navio"
    ]
  },
  {
    uf: "AM",
    name: "Amazonas",
    cities: [
      "Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari",
      "Tabatinga", "Maués", "Tefé", "Manicoré", "Humaitá",
      "Iranduba", "São Gabriel da Cachoeira", "Benjamin Constant", "Borba", "Autazes",
      "Presidente Figueiredo", "Careiro", "Lábrea", "Eirunepé"
    ]
  },
  {
    uf: "BA",
    name: "Bahia",
    cities: [
      "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro",
      "Itabuna", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas",
      "Barreiras", "Alagoinhas", "Porto Seguro", "Simões Filho", "Paulo Afonso",
      "Santo Antônio de Jesus", "Eunápolis", "Valença", "Candeias", "Guanambi",
      "Jacobina", "Serrinha", "Senhor do Bonfim", "Luís Eduardo Magalhães", "Dias d'Ávila",
      "Itapetinga", "Irecê", "Campo Formoso", "Casa Nova", "Bom Jesus da Lapa",
      "Brumado", "Conceição do Coité", "Itaberaba", "Cruz das Almas", "Santo Amaro"
    ]
  },
  {
    uf: "CE",
    name: "Ceará",
    cities: [
      "Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral",
      "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá",
      "Pacatuba", "Aquiraz", "Russas", "Canindé", "Tianguá",
      "Crateús", "Aracati", "Cascavel", "Pacajus", "Icó",
      "Morada Nova", "Camocim", "Acaraú", "Limoeiro do Norte", "Barbalha",
      "Tauá", "Trairi", "Granja", "Boa Viagem", "São Gonçalo do Amarante"
    ]
  },
  {
    uf: "DF",
    name: "Distrito Federal",
    cities: [
      "Brasília", "Ceilândia", "Samambaia", "Taguatinga", "Plano Piloto",
      "Águas Claras", "Guará", "Gama", "Santa Maria", "Sobradinho",
      "Recanto das Emas", "São Sebastião", "Vicente Pires", "Riacho Fundo", "Paranoá",
      "Planaltina", "Park Way", "Lago Sul", "Lago Norte", "Jardim Botânico",
      "Cruzeiro", "Sudoeste/Octogonal", "Brazlândia", "Núcleo Bandeirante", "Candangolândia"
    ]
  },
  {
    uf: "ES",
    name: "Espírito Santo",
    cities: [
      "Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim",
      "Linhares", "Colatina", "Guarapari", "São Mateus", "Aracruz",
      "Viana", "Nova Venécia", "Barra de São Francisco", "Marataízes", "Castelo",
      "Santa Maria de Jetibá", "Domingos Martins", "Anchieta", "Itapemirim", "Afonso Cláudio"
    ]
  },
  {
    uf: "GO",
    name: "Goiás",
    cities: [
      "Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Águas Lindas de Goiás",
      "Luziânia", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama",
      "Senador Canedo", "Catalão", "Itumbiara", "Jataí", "Caldas Novas",
      "Planaltina", "Cidade Ocidental", "Goianésia", "Cristalina", "Porangatu",
      "Mineiros", "Santa Helena de Goiás", "Posse", "Goiatuba", "Inhumas",
      "Morrinhos", "Quirinópolis", "Pires do Rio", "Uruaçu", "Niquelândia"
    ]
  },
  {
    uf: "MA",
    name: "Maranhão",
    cities: [
      "São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias",
      "Codó", "Paço do Lumiar", "Açailândia", "Bacabal", "Balsas",
      "Santa Inês", "Barra do Corda", "Pinheiro", "Chapadinha", "Santa Luzia",
      "Buriticupu", "Grajaú", "Coroatá", "Itapecuru Mirim", "Viana",
      "Tutóia", "Vargem Grande", "Presidente Dutra", "Zé Doca", "Lago da Pedra"
    ]
  },
  {
    uf: "MT",
    name: "Mato Grosso",
    cities: [
      "Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra",
      "Sorriso", "Lucas do Rio Verde", "Primavera do Leste", "Barra do Garças", "Alta Floresta",
      "Cáceres", "Nova Mutum", "Campo Verde", "Juína", "Pontes e Lacerda",
      "Guarantã do Norte", "Juara", "Barra do Bugres", "Poconé", "Campo Novo do Parecis",
      "Peixoto de Azevedo", "Colíder", "Diamantino", "Canarana", "Água Boa"
    ]
  },
  {
    uf: "MS",
    name: "Mato Grosso do Sul",
    cities: [
      "Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã",
      "Sidrolândia", "Naviraí", "Nova Andradina", "Aquidauana", "Maracaju",
      "Paranaíba", "Amambai", "Rio Brilhante", "Coxim", "Caarapó",
      "Miranda", "São Gabriel do Oeste", "Bonito", "Jardim", "Aparecida do Taboado",
      "Chapadão do Sul", "Fátima do Sul", "Itaporã", "Ribas do Rio Pardo", "Bela Vista"
    ]
  },
  {
    uf: "MG",
    name: "Minas Gerais",
    cities: [
      "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim",
      "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga",
      "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas",
      "Patos de Minas", "Pouso Alegre", "Teófilo Otoni", "Barbacena", "Sabará",
      "Varginha", "Conselheiro Lafaiete", "Vespasiano", "Araguari", "Passos",
      "Ubá", "Coronel Fabriciano", "Muriaé", "Itabira", "Nova Lima",
      "Lavras", "Itaúna", "Paracatu", "Caratinga", "São João del-Rei",
      "Timóteo", "Patrocínio", "Alfenas", "Manhuaçu", "Viçosa",
      "Curvelo", "João Monlevade", "Três Corações", "Ouro Preto", "Mariana"
    ]
  },
  {
    uf: "PA",
    name: "Pará",
    cities: [
      "Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas",
      "Castanhal", "Abaetetuba", "Cametá", "Marituba", "São Félix do Xingu",
      "Bragança", "Barcarena", "Altamira", "Tucuruí", "Paragominas",
      "Tailândia", "Breves", "Itaituba", "Redenção", "Moju",
      "Novo Repartimento", "Oriximiná", "Capanema", "Santa Izabel do Pará", "Tomé-Açu"
    ]
  },
  {
    uf: "PB",
    name: "Paraíba",
    cities: [
      "João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux",
      "Sousa", "Cajazeiras", "Cabedelo", "Guarabira", "Mamanguape",
      "Queimadas", "São Bento", "Monteiro", "Esperança", "Pombal",
      "Catolé do Rocha", "Alagoa Grande", "Pedras de Fogo", "Conceição", "Itabaiana"
    ]
  },
  {
    uf: "PR",
    name: "Paraná",
    cities: [
      "Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel",
      "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá",
      "Araucária", "Toledo", "Apucarana", "Pinhais", "Campo Largo",
      "Arapongas", "Almirante Tamandaré", "Umuarama", "Piraquara", "Cambé",
      "Fazenda Rio Grande", "Sarandi", "Campo Mourão", "Francisco Beltrão", "Paranavaí",
      "Pato Branco", "Cianorte", "Telêmaco Borba", "Castro", "Rolândia",
      "Irati", "União da Vitória", "Ibiporã", "Marechal Cândido Rondon", "Prudentópolis"
    ]
  },
  {
    uf: "PE",
    name: "Pernambuco",
    cities: [
      "Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina",
      "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão",
      "Igarassu", "São Lourenço da Mata", "Abreu e Lima", "Santa Cruz do Capibaribe", "Ipojuca",
      "Serra Talhada", "Araripina", "Gravatá", "Carpina", "Goiana",
      "Belo Jardim", "Arcoverde", "Ouricuri", "Escada", "Pesqueira",
      "Surubim", "Palmares", "Bezerros", "Moreno", "Paudalho"
    ]
  },
  {
    uf: "PI",
    name: "Piauí",
    cities: [
      "Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano",
      "Barras", "Campo Maior", "União", "Altos", "Esperantina",
      "Pedro II", "Oeiras", "José de Freitas", "São Raimundo Nonato", "Miguel Alves",
      "Batalha", "Corrente", "Piracuruca", "Luzilândia", "Uruçuí"
    ]
  },
  {
    uf: "RJ",
    name: "Rio de Janeiro",
    cities: [
      "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói",
      "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti", "Petrópolis", "Volta Redonda",
      "Magé", "Macaé", "Itaboraí", "Cabo Frio", "Angra dos Reis",
      "Nova Friburgo", "Barra Mansa", "Teresópolis", "Mesquita", "Nilópolis",
      "Maricá", "Queimados", "Rio das Ostras", "Resende", "Araruama",
      "Itaguaí", "Japeri", "Itaperuna", "Barra do Piraí", "Saquarema",
      "Seropédica", "Três Rios", "Valença", "Guapimirim", "Cachoeiras de Macacu",
      "Paracambi", "Casimiro de Abreu", "Paraty", "Armação dos Búzios", "Mangaratiba"
    ]
  },
  {
    uf: "RN",
    name: "Rio Grande do Norte",
    cities: [
      "Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Ceará-Mirim",
      "Macaíba", "Caicó", "Açu", "Currais Novos", "São José de Mipibu",
      "Santa Cruz", "Nova Cruz", "Apodi", "João Câmara", "Touros",
      "Pau dos Ferros", "Areia Branca", "Extremoz", "Nísia Floresta", "Goianinha"
    ]
  },
  {
    uf: "RS",
    name: "Rio Grande do Sul",
    cities: [
      "Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria",
      "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande",
      "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana", "Santa Cruz do Sul",
      "Cachoeirinha", "Bento Gonçalves", "Bagé", "Erechim", "Guaíba",
      "Lajeado", "Ijuí", "Santana do Livramento", "Sapiranga", "Farroupilha",
      "Alegrete", "Santa Rosa", "Venâncio Aires", "Campo Bom", "Vacaria",
      "Montenegro", "Cruz Alta", "São Borja", "Carazinho", "Tramandaí",
      "Capão da Canoa", "Torres", "Estância Velha", "Gramado", "Canela"
    ]
  },
  {
    uf: "RO",
    name: "Rondônia",
    cities: [
      "Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal",
      "Rolim de Moura", "Jaru", "Guajará-Mirim", "Ouro Preto do Oeste", "Pimenta Bueno",
      "Buritis", "Machadinho d'Oeste", "Alta Floresta d'Oeste", "Espigão d'Oeste", "Nova Mamoré"
    ]
  },
  {
    uf: "RR",
    name: "Roraima",
    cities: [
      "Boa Vista", "Rorainópolis", "Caracaraí", "Cantá", "Mucajaí",
      "Pacaraima", "Bonfim", "Alto Alegre", "Amajari", "Iracema",
      "Normandia", "Uiramutã", "Caroebe", "São João da Baliza", "São Luiz"
    ]
  },
  {
    uf: "SC",
    name: "Santa Catarina",
    cities: [
      "Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó",
      "Itajaí", "Criciúma", "Jaraguá do Sul", "Palhoça", "Lages",
      "Balneário Camboriú", "Brusque", "Tubarão", "São Bento do Sul", "Camboriú",
      "Caçador", "Navegantes", "Concórdia", "Rio do Sul", "Gaspar",
      "Biguaçu", "Indaial", "Itapema", "Mafra", "Canoinhas",
      "Içara", "Videira", "São Francisco do Sul", "Xanxerê", "Tijucas",
      "Joaçaba", "São Miguel do Oeste", "Pomerode", "Imbituba", "Guaramirim"
    ]
  },
  {
    uf: "SP",
    name: "São Paulo",
    cities: [
      "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André",
      "São José dos Campos", "Osasco", "Ribeirão Preto", "Sorocaba", "Mauá",
      "São José do Rio Preto", "Santos", "Mogi das Cruzes", "Diadema", "Jundiaí",
      "Piracicaba", "Carapicuíba", "Bauru", "Itaquaquecetuba", "São Vicente",
      "Franca", "Praia Grande", "Guarujá", "Taubaté", "Limeira",
      "Suzano", "Taboão da Serra", "Sumaré", "Barueri", "Embu das Artes",
      "Indaiatuba", "Cotia", "Americana", "Marília", "Itapevi",
      "Araraquara", "Jacareí", "Hortolândia", "Rio Claro", "Presidente Prudente",
      "Araçatuba", "Santa Bárbara d'Oeste", "Ferraz de Vasconcelos", "Francisco Morato", "Itapecerica da Serra",
      "Itu", "Bragança Paulista", "Pindamonhangaba", "Itapetininga", "São Caetano do Sul",
      "Franco da Rocha", "Mogi Guaçu", "Jaú", "Botucatu", "Atibaia",
      "Santana de Parnaíba", "Araras", "Cubatão", "Valinhos", "Sertãozinho",
      "Jandira", "Birigui", "Ribeirão Pires", "Votorantim", "Barretos",
      "Catanduva", "Guaratinguetá", "Várzea Paulista", "Tatuí", "Caraguatatuba",
      "Salto", "Poá", "Itatiba", "Ourinhos", "Assis",
      "Paulínia", "Leme", "Caieiras", "Mairiporã", "Ubatuba",
      "São Sebastião", "Vinhedo", "Avaré", "Lorena", "Mogi Mirim"
    ]
  },
  {
    uf: "SE",
    name: "Sergipe",
    cities: [
      "Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão",
      "Estância", "Tobias Barreto", "Simão Dias", "Itabaianinha", "Poço Redondo",
      "Nossa Senhora da Glória", "Propriá", "Barra dos Coqueiros", "Capela", "Laranjeiras"
    ]
  },
  {
    uf: "TO",
    name: "Tocantins",
    cities: [
      "Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins",
      "Araguatins", "Colinas do Tocantins", "Guaraí", "Tocantinópolis", "Dianópolis",
      "Formoso do Araguaia", "Miracema do Tocantins", "Taguatinga", "Xambioá", "Lagoa da Confusão"
    ]
  }
];

export function parseLocation(value: string | null | undefined): { uf: string; city: string; isCustom: boolean } {
  if (!value || !value.trim()) {
    return { uf: "", city: "", isCustom: false };
  }

  const str = value.trim();

  // Try matching "Cidade - UF" or "Cidade / UF" or "Cidade, UF"
  const match = str.match(/^(.+?)\s*(?:-|–|\/|,)\s*([A-Za-z]{2})$/);
  if (match) {
    const rawCity = match[1].trim();
    const rawUf = match[2].toUpperCase();
    const stateObj = BRAZILIAN_STATES.find(s => s.uf === rawUf);
    if (stateObj) {
      const cityInList = stateObj.cities.find(c => c.toLowerCase() === rawCity.toLowerCase());
      return {
        uf: rawUf,
        city: cityInList || rawCity,
        isCustom: !cityInList,
      };
    }
  }

  // If no UF pattern, check if the string matches any city in our list directly
  for (const state of BRAZILIAN_STATES) {
    const found = state.cities.find(c => c.toLowerCase() === str.toLowerCase());
    if (found) {
      return { uf: state.uf, city: found, isCustom: false };
    }
  }

  return { uf: "", city: str, isCustom: true };
}

export function formatCityState(city: string, uf: string): string {
  if (!city) return "";
  if (!uf) return city;
  return `${city} - ${uf}`;
}
