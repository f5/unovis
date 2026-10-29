// TanStack Charts (React): the React adapter ships inside @tanstack/charts. The opt-in `motion()` renderer animates the
// first render and data updates, as the other animated charts here do
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react/core'
import { motion } from '@tanstack/charts/motion'
import { getContainer } from '../shared/data.js'
import { makeMatchedDefinition } from './tanstack-definition.js'

const definition = makeMatchedDefinition({ svgAnimation: false })
const renderer = motion({ initial: 'always', transition: { type: 'tween', duration: 600 } })

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" renderer={renderer} />
}

createRoot(getContainer()).render(<LineChart />)
