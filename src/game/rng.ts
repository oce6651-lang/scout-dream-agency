// Simple mulberry32 seeded RNG
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ephemeral (non-persisted) rng for UI-random pieces
export const rand = () => Math.random();
export function randi(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function chance(p: number) {
  return Math.random() < p;
}
