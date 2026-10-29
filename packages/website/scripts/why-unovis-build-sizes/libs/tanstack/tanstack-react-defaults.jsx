// TanStack Charts (React), reference build with the library's defaults: straight lines, no crosshair, no animation
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react'
import { getContainer } from '../shared/data.js'
import { definition } from './tanstack-defaults-definition.js'

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" />
}

createRoot(getContainer()).render(<LineChart />)
