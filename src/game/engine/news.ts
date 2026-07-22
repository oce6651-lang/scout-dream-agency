import { makeId } from "../ids";
import type { Noticia } from "../types";

export function criarNoticia(
  counters: Record<string, number>,
  semanaAbs: number,
  titulo: string,
  corpo: string,
  tipo: Noticia["tipo"] = "info",
): { noticia: Noticia; counters: Record<string, number> } {
  const { id, counters: c2 } = makeId(counters, "NWS");
  return {
    noticia: { id, semanaAbs, titulo, corpo, tipo },
    counters: c2,
  };
}
