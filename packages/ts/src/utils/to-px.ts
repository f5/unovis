// SSR-safe port of https://github.com/mikolalysenko/to-px

function parseUnit (str: string): [number, string] {
  str = String(str)
  const num = parseFloat(str)
  const unit = str.match(/[\d.\-+]*\s*(.*)/)?.[1] || ''
  return [num, unit]
}

function isBrowser (): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getPropertyInPX (element: Element, prop: string): number {
  const parts = parseUnit(getComputedStyle(element).getPropertyValue(prop))
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return parts[0] * (toPx(parts[1], element) ?? 1)
}

function getSizeBrutal (unit: string, element: Element): number {
  const testDIV = document.createElement('div')
  testDIV.style.height = `128${unit}`
  element.appendChild(testDIV)
  const size = getPropertyInPX(testDIV, 'height') / 128
  element.removeChild(testDIV)
  return size
}

let cachedPPI: number | null = null
function getPixelsPerInch (): number {
  if (!isBrowser()) return 96 // Standard default
  if (cachedPPI === null) cachedPPI = getSizeBrutal('in', document.body)
  return cachedPPI
}

export function toPx (str: string | number | null | undefined, element?: Element | Window | Document | null): number | null {
  if (!str && str !== 0) return null

  // SSR guard
  if (!isBrowser()) {
    // Return sensible defaults for SSR
    const parts = parseUnit(String(str))
    if (!isNaN(parts[0])) {
      const unit = parts[1]?.toLowerCase() || 'px'
      if (unit === 'px' || unit === '') return parts[0]
      if (unit === 'em' || unit === 'rem') return parts[0] * 16 // Assume 16px base
      if (unit === 'in') return parts[0] * 96
      if (unit === 'cm') return parts[0] * (96 / 2.54)
      if (unit === 'mm') return parts[0] * (96 / 25.4)
      if (unit === 'pt') return parts[0] * (96 / 72)
      if (unit === 'pc') return parts[0] * (96 / 6)
    }
    return null
  }

  let el: Element = document.body
  if (element && element !== window && element !== document) {
    el = element as Element
  }

  const s = (String(str) || 'px').trim().toLowerCase()

  switch (s) {
    case '%':
      return el.clientHeight / 100.0
    case 'ch':
    case 'ex':
      return getSizeBrutal(s, el)
    case 'em':
      return getPropertyInPX(el, 'font-size')
    case 'rem':
      return getPropertyInPX(document.body, 'font-size')
    case 'vw':
      return window.innerWidth / 100
    case 'vh':
      return window.innerHeight / 100
    case 'vmin':
      return Math.min(window.innerWidth, window.innerHeight) / 100
    case 'vmax':
      return Math.max(window.innerWidth, window.innerHeight) / 100
    case 'in':
      return getPixelsPerInch()
    case 'cm':
      return getPixelsPerInch() / 2.54
    case 'mm':
      return getPixelsPerInch() / 25.4
    case 'pt':
      return getPixelsPerInch() / 72
    case 'pc':
      return getPixelsPerInch() / 6
    case 'px':
      return 1
  }

  // Detect number + units (e.g., "12px", "2em")
  const parts = parseUnit(s)
  if (!isNaN(parts[0])) {
    if (parts[1]) {
      const px = toPx(parts[1], el)
      return typeof px === 'number' ? parts[0] * px : null
    }
    return parts[0]
  }

  return null
}
