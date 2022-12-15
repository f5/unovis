export function groupBy<T> (arr: T[], key: string): Record<string, T[]> {
  return arr.reduce((r, v, i, a, k = v[key]) => (((r[k] || (r[k] = [])).push(v), r)), {})
}
