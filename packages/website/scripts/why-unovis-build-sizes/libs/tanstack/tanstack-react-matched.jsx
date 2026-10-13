// TanStack Charts (React), reference build with Unovis' default line-chart behaviour and the update tween
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react'
import { getContainer } from '../shared/data.js'
import { makeMatchedDefinition } from './tanstack-matched-definition.js'

const definition = makeMatchedDefinition({ svgAnimation: true })

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" />
}

createRoot(getContainer()).render(<LineChart />)
