// TanStack Charts (React), reference build: the same chart animated by the built-in `svgAnimation` tween instead of
// `motion()`. It's lighter, but only animates data updates, not the first render
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react'
import { getContainer } from '../shared/data.js'
import { makeMatchedDefinition } from './tanstack-definition.js'

const definition = makeMatchedDefinition({ svgAnimation: true })

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" />
}

createRoot(getContainer()).render(<LineChart />)
