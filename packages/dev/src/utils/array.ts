import { random } from './random'

export function groupBy<T extends Record<string, any>> (arr: T[], key: string): Record<string, T[]> {
  return arr.reduce(
    (grouped, v, i, a, k = v[key]) => (((grouped[k] || (grouped[k] = [])).push(v), grouped)),
    {} as Record<string, T[]>
  )
}

export const sample = <T>(arr: T[]): T => arr[Math.floor(random.float() * arr.length)]
