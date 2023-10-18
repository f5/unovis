import { interrupt, Transition } from 'd3-transition'
import { BaseType, Selection } from 'd3-selection'
import { ValueFn } from 'd3'

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
