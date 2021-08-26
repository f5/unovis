// Copyright (c) Volterra, Inc. All rights reserved.
import { interrupt, Transition } from 'd3-transition'
import { BaseType, Selection } from 'd3-selection'

export function smartTransition<Element extends BaseType, Datum, ParentElement extends BaseType, ParentDatum> (
  selection: Selection<Element, Datum, ParentElement, ParentDatum>,
  duration?: number,
  easing?: (normalizedTime: number) => number
): Selection<Element, Datum, ParentElement, ParentDatum> | Transition<Element, Datum, ParentElement, ParentDatum> {
  selection.nodes().forEach(node => interrupt(node)) // Interrupt active transitions if any
  if (duration) {
    const transition = selection.transition().duration(duration)
    if (easing) transition.ease(easing)
    return transition
  } else return selection
}
