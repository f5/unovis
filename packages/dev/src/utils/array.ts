import { rng } from '@src/utils/data'
export function groupBy<T extends Record<string, any>> (arr: T[], key: string): Record<string, T[]> {
  return arr.reduce(
    (grouped, v, i, a, k = v[key]) => (((grouped[k] || (grouped[k] = [])).push(v), grouped)),
    {} as Record<string, T[]>
  )
}

export const sample = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
