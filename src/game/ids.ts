export type IdPrefix = "AGT" | "AGN" | "PLR" | "CLB" | "NWS" | "OFR" | "STF";

export function makeId(
  counters: Record<string, number>,
  prefix: IdPrefix,
): { id: string; counters: Record<string, number> } {
  const next = (counters[prefix] ?? 0) + 1;
  const id = `${prefix}${String(next).padStart(6, "0")}`;
  return { id, counters: { ...counters, [prefix]: next } };
}
