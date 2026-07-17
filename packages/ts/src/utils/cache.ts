const UNOVIS_MAX_CACHE_SIZE = 5000

export function addToCache<K, V> (map: Map<K, V>, key: K, value: V): void {
  if (map.size >= UNOVIS_MAX_CACHE_SIZE && !map.has(key)) {
    const first = map.keys().next().value
    if (first !== undefined) map.delete(first)
  }
  map.set(key, value)
}
