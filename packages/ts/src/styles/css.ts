import { compile, middleware, serialize, stringify, DECLARATION } from 'stylis'
import type { Element } from 'stylis'

// Utils
import { isArray, isNumber, isPlainObject, isString } from '@/utils/data'

// Constants
import { CSS_CLASS_NAME_PREFIX, CSS_LABEL_PATTERN, CSS_STYLE_ELEMENT_ATTRIBUTE, CSS_WEBKIT_PREFIXED_PROPERTIES } from './constants'

export type CSSValue = string | number | boolean | null | undefined
/** Keys are used as written: selectors, or kebab-case properties with units (e.g. `--vis-*` variables) */
export type CSSObject = { [key: string]: CSSValue | CSSObject | CSSObject[] }
export type CSSInterpolation = CSSValue | CSSObject | CSSInterpolation[]

const nonce = globalThis?.UNOVIS_NONCE
const insertedClassNames = new Set<string>()
const insertedGlobalStyles = new Set<string>()
let styleElement: HTMLStyleElement | undefined

// Label declarations only name the class, like in Emotion
const removeLabel = (element: Element): void => {
  if (element.type === DECLARATION && element.props === 'label') element.return = element.value = ''
}
const addWebkitPrefix = (element: Element): void => {
  if (element.type === DECLARATION && CSS_WEBKIT_PREFIXED_PROPERTIES.includes(element.props as string)) {
    element.return = `-webkit-${element.value}${element.value}`
  }
}
const stringifyRules = middleware([removeLabel, addWebkitPrefix, stringify])

function hash (text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i)
  return (h >>> 0).toString(36)
}

function interpolate (value: CSSInterpolation): string {
  // Like in Emotion, every array item ends with `;`
  if (isArray(value)) return value.map(item => `${interpolate(item)};`).join('')
  if (isPlainObject(value)) {
    const styles = value as CSSObject
    return Object.keys(styles).map(key => {
      const v = styles[key]
      if (isArray(v) || isPlainObject(v)) return `${key}{${interpolate(v)}}`
      const text = interpolate(v)
      return text ? `${key}:${text};` : ''
    }).join('')
  }
  // Like in Emotion, `null`, `undefined` and booleans render nothing
  return isString(value) || isNumber(value) ? `${value}` : ''
}

function toCssText (styles: TemplateStringsArray | CSSObject | string, values: CSSInterpolation[]): string {
  if (isString(styles)) return styles
  if (isPlainObject(styles)) return interpolate(styles as CSSObject)
  return (styles as TemplateStringsArray).map((text, i) => `${text}${i < values.length ? interpolate(values[i]) : ''}`).join('')
}

function insertRules (cssText: string): void {
  if (typeof document === 'undefined') return

  // If the <style> gets removed from the page, a new one receives the rules inserted from then on
  if (!styleElement?.isConnected) {
    styleElement = document.createElement('style')
    styleElement.setAttribute(CSS_STYLE_ELEMENT_ATTRIBUTE, '')
    if (nonce) styleElement.setAttribute('nonce', nonce)
    document.head.appendChild(styleElement)
  }

  // A Content Security Policy that doesn't allow the <style> leaves it without a sheet
  const sheet = styleElement.sheet
  if (!sheet) return

  // One rule at a time: appending text to the <style> would make the browser re-parse the whole sheet on every call
  for (const element of compile(cssText)) {
    const rule = serialize([element], stringifyRules)
    if (!rule) continue
    try {
      sheet.insertRule(rule, sheet.cssRules.length)
    } catch (e) {
      // The browser rejects rules it can't parse, the same way it would skip them in a stylesheet
    }
  }
}

/** Creates a class with the given styles and returns its name.
 * Nested rules need `&` to attach to the class, e.g. `&:hover`; an interpolated class name is inserted as the name, not its styles.
 */
export function css (styles: TemplateStringsArray, ...values: CSSInterpolation[]): string {
  const cssText = toCssText(styles, values)
  let labels = ''
  cssText.replace(CSS_LABEL_PATTERN, (match: string, label: string) => {
    labels += `-${label}`
    return match
  })
  const className = `${CSS_CLASS_NAME_PREFIX}-${hash(cssText)}${labels}`

  if (!insertedClassNames.has(className)) {
    insertedClassNames.add(className)
    insertRules(`.${className}{${cssText}}`)
  }
  return className
}

/** Adds global styles to the page */
export function injectGlobal (styles: TemplateStringsArray | CSSObject | string, ...values: CSSInterpolation[]): void {
  const cssText = toCssText(styles, values)
  const key = hash(cssText)

  if (!insertedGlobalStyles.has(key)) {
    insertedGlobalStyles.add(key)
    insertRules(cssText)
  }
}
