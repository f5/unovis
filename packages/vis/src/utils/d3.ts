// Copyright (c) Volterra, Inc. All rights reserved.
import { interrupt, Transition } from 'd3-transition'
import { Selection } from 'd3-selection'

export const smartTransition = function (
  selection: Selection<any, any, any, any>,
  duration?: number,
  easing?: (normalizedTime: number) => number
): Selection<any, any, any, any> | Transition<any, any, any, any> {
  selection.nodes().forEach(node => interrupt(node)) // Interrupt active transitions if any
  if (duration) {
    const transition = selection.transition().duration(duration)
    if (easing) transition.ease(easing)
    return transition
  } else return selection
}
