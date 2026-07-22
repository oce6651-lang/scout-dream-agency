import type { Clube } from "../types";

// Seed clubs. IDs are stable strings so save file references remain valid.
export const CLUBES_SEED: Clube[] = [
  // Brasil - Gigantes
  { id: "CLB000001", nome: "Grêmio", pais: "Brasil", cidade: "Porto Alegre", nivel: 8, orcamento: 50_000_000, categoria: "gigante" },
  { id: "CLB000002", nome: "Internacional", pais: "Brasil", cidade: "Porto Alegre", nivel: 8, orcamento: 50_000_000, categoria: "gigante" },
  { id: "CLB000003", nome: "Flamengo", pais: "Brasil", cidade: "Rio de Janeiro", nivel: 10, orcamento: 120_000_000, categoria: "gigante" },
  { id: "CLB000004", nome: "Palmeiras", pais: "Brasil", cidade: "São Paulo", nivel: 10, orcamento: 130_000_000, categoria: "gigante" },
  { id: "CLB000005", nome: "Corinthians", pais: "Brasil", cidade: "São Paulo", nivel: 9, orcamento: 100_000_000, categoria: "gigante" },
  { id: "CLB000006", nome: "São Paulo", pais: "Brasil", cidade: "São Paulo", nivel: 9, orcamento: 90_000_000, categoria: "gigante" },
  { id: "CLB000007", nome: "Santos", pais: "Brasil", cidade: "Santos", nivel: 8, orcamento: 60_000_000, categoria: "gigante" },
  { id: "CLB000008", nome: "Atlético Mineiro", pais: "Brasil", cidade: "Belo Horizonte", nivel: 9, orcamento: 90_000_000, categoria: "gigante" },
  { id: "CLB000009", nome: "Cruzeiro", pais: "Brasil", cidade: "Belo Horizonte", nivel: 8, orcamento: 60_000_000, categoria: "gigante" },
  { id: "CLB000010", nome: "Fluminense", pais: "Brasil", cidade: "Rio de Janeiro", nivel: 8, orcamento: 60_000_000, categoria: "gigante" },
  { id: "CLB000011", nome: "Botafogo", pais: "Brasil", cidade: "Rio de Janeiro", nivel: 8, orcamento: 55_000_000, categoria: "gigante" },
  { id: "CLB000012", nome: "Vasco da Gama", pais: "Brasil", cidade: "Rio de Janeiro", nivel: 7, orcamento: 45_000_000, categoria: "principal" },
  // Brasil - Principais
  { id: "CLB000013", nome: "Athletico Paranaense", pais: "Brasil", cidade: "Curitiba", nivel: 7, orcamento: 40_000_000, categoria: "principal" },
  { id: "CLB000014", nome: "Coritiba", pais: "Brasil", cidade: "Curitiba", nivel: 6, orcamento: 25_000_000, categoria: "principal" },
  { id: "CLB000015", nome: "Bahia", pais: "Brasil", cidade: "Salvador", nivel: 7, orcamento: 40_000_000, categoria: "principal" },
  { id: "CLB000016", nome: "Fortaleza", pais: "Brasil", cidade: "Fortaleza", nivel: 7, orcamento: 40_000_000, categoria: "principal" },
  { id: "CLB000017", nome: "Ceará", pais: "Brasil", cidade: "Fortaleza", nivel: 6, orcamento: 25_000_000, categoria: "principal" },
  { id: "CLB000018", nome: "Sport", pais: "Brasil", cidade: "Recife", nivel: 6, orcamento: 22_000_000, categoria: "principal" },
  { id: "CLB000019", nome: "Juventude", pais: "Brasil", cidade: "Caxias do Sul", nivel: 5, orcamento: 15_000_000, categoria: "principal" },
  { id: "CLB000020", nome: "Caxias", pais: "Brasil", cidade: "Caxias do Sul", nivel: 4, orcamento: 8_000_000, categoria: "base" },
  { id: "CLB000021", nome: "Chapecoense", pais: "Brasil", cidade: "Chapecó", nivel: 5, orcamento: 12_000_000, categoria: "principal" },
  { id: "CLB000022", nome: "Goiás", pais: "Brasil", cidade: "Goiânia", nivel: 5, orcamento: 12_000_000, categoria: "principal" },
  { id: "CLB000023", nome: "Atlético Goianiense", pais: "Brasil", cidade: "Goiânia", nivel: 5, orcamento: 12_000_000, categoria: "principal" },
  { id: "CLB000024", nome: "Cuiabá", pais: "Brasil", cidade: "Cuiabá", nivel: 5, orcamento: 12_000_000, categoria: "principal" },
  // Europa - Top
  { id: "CLB000025", nome: "Barcelona", pais: "Espanha", cidade: "Barcelona", nivel: 10, orcamento: 400_000_000, categoria: "gigante" },
  { id: "CLB000026", nome: "Real Madrid", pais: "Espanha", cidade: "Madrid", nivel: 10, orcamento: 500_000_000, categoria: "gigante" },
  { id: "CLB000027", nome: "Manchester City", pais: "Inglaterra", cidade: "Manchester", nivel: 10, orcamento: 500_000_000, categoria: "gigante" },
  { id: "CLB000028", nome: "Bayern de Munique", pais: "Alemanha", cidade: "Munique", nivel: 10, orcamento: 400_000_000, categoria: "gigante" },
  { id: "CLB000029", nome: "Paris Saint-Germain", pais: "França", cidade: "Paris", nivel: 10, orcamento: 500_000_000, categoria: "gigante" },
  { id: "CLB000030", nome: "Porto", pais: "Portugal", cidade: "Porto", nivel: 8, orcamento: 100_000_000, categoria: "gigante" },
  { id: "CLB000031", nome: "Benfica", pais: "Portugal", cidade: "Lisboa", nivel: 8, orcamento: 100_000_000, categoria: "gigante" },
  { id: "CLB000032", nome: "Ajax", pais: "Holanda", cidade: "Amsterdã", nivel: 8, orcamento: 90_000_000, categoria: "gigante" },
];
