// Brazilian states + notable cities. Not exhaustive but broad and includes Três Passos-RS.
export type Estado = { sigla: string; nome: string; cidades: string[] };

export const ESTADOS: Estado[] = [
  { sigla: "AC", nome: "Acre", cidades: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"] },
  { sigla: "AL", nome: "Alagoas", cidades: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo"] },
  { sigla: "AP", nome: "Amapá", cidades: ["Macapá", "Santana", "Laranjal do Jari"] },
  { sigla: "AM", nome: "Amazonas", cidades: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"] },
  { sigla: "BA", nome: "Bahia", cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Ilhéus", "Itabuna", "Juazeiro", "Camaçari"] },
  { sigla: "CE", nome: "Ceará", cidades: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral", "Maracanaú"] },
  { sigla: "DF", nome: "Distrito Federal", cidades: ["Brasília", "Ceilândia", "Taguatinga", "Gama"] },
  { sigla: "ES", nome: "Espírito Santo", cidades: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares"] },
  { sigla: "GO", nome: "Goiás", cidades: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Luziânia", "Rio Verde"] },
  { sigla: "MA", nome: "Maranhão", cidades: ["São Luís", "Imperatriz", "Timon", "Caxias", "Codó"] },
  { sigla: "MT", nome: "Mato Grosso", cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"] },
  { sigla: "MS", nome: "Mato Grosso do Sul", cidades: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá"] },
  { sigla: "MG", nome: "Minas Gerais", cidades: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Uberaba"] },
  { sigla: "PA", nome: "Pará", cidades: ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal"] },
  { sigla: "PB", nome: "Paraíba", cidades: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos"] },
  { sigla: "PR", nome: "Paraná", cidades: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu"] },
  { sigla: "PE", nome: "Pernambuco", cidades: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"] },
  { sigla: "PI", nome: "Piauí", cidades: ["Teresina", "Parnaíba", "Picos", "Floriano"] },
  { sigla: "RJ", nome: "Rio de Janeiro", cidades: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Petrópolis"] },
  { sigla: "RN", nome: "Rio Grande do Norte", cidades: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante"] },
  { sigla: "RS", nome: "Rio Grande do Sul", cidades: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria", "Canoas", "Novo Hamburgo", "Passo Fundo", "Três Passos", "Ijuí", "Santa Rosa"] },
  { sigla: "RO", nome: "Rondônia", cidades: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena"] },
  { sigla: "RR", nome: "Roraima", cidades: ["Boa Vista", "Rorainópolis"] },
  { sigla: "SC", nome: "Santa Catarina", cidades: ["Florianópolis", "Joinville", "Blumenau", "Chapecó", "Criciúma", "Itajaí"] },
  { sigla: "SP", nome: "São Paulo", cidades: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Ribeirão Preto", "Sorocaba", "Santos", "São José dos Campos"] },
  { sigla: "SE", nome: "Sergipe", cidades: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana"] },
  { sigla: "TO", nome: "Tocantins", cidades: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"] },
];

export function cidadesDoEstado(sigla: string): string[] {
  return ESTADOS.find((e) => e.sigla === sigla)?.cidades ?? [];
}
