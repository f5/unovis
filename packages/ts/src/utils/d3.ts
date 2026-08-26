import { interrupt, Transition } from 'd3-transition'
import { BaseType, Selection } from 'd3-selection'
import { ValueFn } from 'd3'

// Types
import { StyleDeclaration } from '@/types/style'

// Utils
import { kebabCase } from '@/utils/text'

export function smartTransition<Element extends BaseType, Datum, ParentElement extends BaseType, ParentDatum> (
  selection: Selection<Element, Datum, ParentElement, ParentDatum>,
  duration?: number,
  easing?: (normalizedTime: number) => number
): Selection$Transition<Element, Datum, ParentElement, ParentDatum> {
  selection.nodes().forEach(node => interrupt(node)) // Interrupt active transitions if any
  if (duration) {
    const transition = selection.transition().duration(duration)
    if (easing) transition.ease(easing)
    return transition
  } else return selection
}

// Inline style keys previously applied by `applyInlineStyles`, so keys that are no longer
// returned by the accessor can be removed from the element on the next call
const appliedInlineStyles = new WeakMap<Element, string[]>()

/** Applies an object of inline styles to every node of a selection, converting camelCase keys
 * to kebab-case. Keys applied on a previous call but absent from the current object (or set
 * to `null`/`undefined`) are removed, so per-datum styles clean up after themselves.
 * Keys listed in `skipKeys` are ignored — useful when a component manages some of them itself. */
export function applyInlineStyles<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  selection: Selection<GElement, Datum, PElement, PDatum>,
  getStyles: (d: Datum, i: number) => StyleDeclaration | null | undefined,
  skipKeys?: ReadonlySet<string>
): void {
  selection.each((d, i, elements) => {
    const element = elements[i] as SVGElement | HTMLElement
    const styles = (getStyles(d, i) ?? {}) as Record<string, string | number | null | undefined>
    const appliedKeys: string[] = []
    for (const key of Object.keys(styles)) {
      if (skipKeys?.has(key)) continue
      const value = styles[key]
      if (value === null || value === undefined) continue
      const property = key.startsWith('--') ? key : kebabCase(key)
      element.style.setProperty(property, `${value}`)
      appliedKeys.push(property)
    }

    const prevKeys = appliedInlineStyles.get(element)
    if (prevKeys) {
      for (const key of prevKeys) {
        if (!appliedKeys.includes(key)) element.style.removeProperty(key)
      }
    }
    if (appliedKeys.length) appliedInlineStyles.set(element, appliedKeys)
    else appliedInlineStyles.delete(element)
  })
}

export interface VisAttrStylePatch<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
  attr(name: string, value: null | string | number | boolean): this;
  attr(name: string, value: ValueFn<GElement, Datum, string | number | boolean | null>): this;
  style(name: string, value: null): this;
  style(name: string, value: string | number | boolean, priority?: null | 'important'): this;
  style(name: string, value: ValueFn<GElement, Datum, string | number | boolean | null>, priority?: null | 'important'): this;
}

export type Selection$Transition<Element extends BaseType, Datum, ParentElement extends BaseType, ParentDatum> =
  (Transition<Element, Datum, ParentElement, ParentDatum> | Selection<Element, Datum, ParentElement, ParentDatum>)
  & VisAttrStylePatch<Element, Datum, ParentElement, ParentDatum>
