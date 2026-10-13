// TanStack Charts (React), reference build with Unovis' default line-chart behaviour, animated by the opt-in
// `motion()` renderer, which also animates the first render as Unovis does
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react/core'
import { motion } from '@tanstack/charts/motion'
import { getContainer } from '../shared/data.js'
import { makeMatchedDefinition } from './tanstack-matched-definition.js'

const definition = makeMatchedDefinition({ svgAnimation: false })
const renderer = motion({ initial: 'always', transition: { type: 'tween', duration: 600 } })

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" renderer={renderer} />
}

createRoot(getContainer()).render(<LineChart />)
