/** Id rewriting and url() reference normalization.
 *
 * Rendered charts contain random `guid()` ids (clip paths, filters) and
 * absolute references like `url(http://localhost/#saturate)` (built from
 * `window.location.href` in the XYContainer constructor). For standalone,
 * embeddable SVG we rewrite ids with a deterministic prefix and strip the
 * base URL from all references.
 */

const URL_REF = /url\(["']?([^"')]+)["']?\)/g

const extractRefId = (raw: string): string | undefined => {
  const hashIndex = raw.indexOf('#')
  if (hashIndex === -1) return undefined
  return raw.slice(hashIndex + 1)
}

/** Copy referenced defs living outside the chart SVG (e.g. globally injected
 * pattern defs) into the chart's own defs so the output is self-contained. */
export function importExternalDefs (svg: SVGSVGElement, document: Document): void {
  const referencedIds = new Set<string>()
  for (const el of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const attr of Array.from(el.attributes)) {
      for (const match of attr.value.matchAll(URL_REF)) {
        const id = extractRefId(match[1])
        if (id) referencedIds.add(id)
      }
    }
    const href = el.getAttribute('href') ?? el.getAttribute('xlink:href')
    if (href?.startsWith('#')) referencedIds.add(href.slice(1))
  }

  for (const id of referencedIds) {
    if (svg.querySelector(`[id="${id}"]`)) continue
    const external = document.getElementById(id)
    if (!external) continue
    let defs = svg.querySelector(':scope > defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.prepend(defs)
    }
    defs.appendChild(external.cloneNode(true))
  }
}

export function rewriteIds (svg: SVGSVGElement, prefix: string): void {
  const idMap = new Map<string, string>()
  let counter = 0
  for (const el of Array.from(svg.querySelectorAll('[id]'))) {
    const oldId = el.getAttribute('id') as string
    const newId = `${prefix}${counter++}`
    idMap.set(oldId, newId)
    el.setAttribute('id', newId)
  }

  const rewriteValue = (value: string): string => {
    let result = value.replace(URL_REF, (_match, ref: string) => {
      const id = extractRefId(ref)
      if (id === undefined) return `url(${ref})` // external URL without fragment — drop quotes consistently
      const mapped = idMap.get(id) ?? id
      return `url(#${mapped})`
    })
    if (result.startsWith('#')) {
      const mapped = idMap.get(result.slice(1))
      if (mapped) result = `#${mapped}`
    }
    return result
  }

  for (const el of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === 'id') continue
      if (attr.value.includes('url(') || attr.value.startsWith('#')) {
        const rewritten = rewriteValue(attr.value)
        if (rewritten !== attr.value) el.setAttribute(attr.name, rewritten)
      }
    }
    const style = (el as SVGElement).style
    if (style && style.length) {
      for (let i = 0; i < style.length; i++) {
        const prop = style.item(i)
        const value = style.getPropertyValue(prop)
        if (value.includes('url(')) {
          const rewritten = rewriteValue(value)
          if (rewritten !== value) style.setProperty(prop, rewritten)
        }
      }
    }
  }
}
