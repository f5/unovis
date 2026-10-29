/** Deterministic pseudo-random number generator (mulberry32), so every library renders exactly the same data */
export function randomGenerator (seed: number): () => number {
  let state = seed >>> 0
  return (): number => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween (random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

export function round (value: number, digits = 1): number {
  const k = 10 ** digits
  return Math.round(value * k) / k
}
