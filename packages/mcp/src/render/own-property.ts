/** Own-property lookup for names that come from a chart spec. A plain
 * `obj[name]` would also reach inherited members — `constructor`, `toString`,
 * `__proto__` — and dispatch to something that was never a component,
 * extractor or projection. */
export function hasOwn (obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
