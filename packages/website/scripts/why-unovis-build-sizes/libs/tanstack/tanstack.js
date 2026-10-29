// TanStack Charts (vanilla): the framework-neutral host for a custom renderer, here the opt-in `motion()` renderer that
// animates the first render and data updates
import { motion } from '@tanstack/charts/motion'
import { mountChartRenderer } from '@tanstack/charts/renderer'
import { getContainer } from '../shared/data.js'
import { makeMatchedDefinition } from './tanstack-definition.js'

mountChartRenderer(getContainer(), {
  definition: makeMatchedDefinition({ svgAnimation: false }),
  renderer: motion({ initial: 'always', transition: { type: 'tween', duration: 600 } }),
  height: 300,
  ariaLabel: 'Three series',
})
