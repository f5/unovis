// Copyright (c) Volterra, Inc. All rights reserved.
import { interrupt } from 'd3-transition'

export const smartTransition = function (selection, duration?, easing?) {
  selection.nodes().forEach(node => interrupt(node)) // Interrupt active transitions if any
  if (duration) selection = selection.transition().duration(duration)
  if (duration && easing) selection = selection.ease(easing)
  return selection
}
