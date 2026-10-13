// TanStack Charts (React): the React adapter ships inside @tanstack/charts (`@tanstack/charts/react`)
import { createRoot } from 'react-dom/client'
import { Chart } from '@tanstack/charts/react'
import { getContainer } from '../shared/data.js'
import { definition } from './tanstack-definition.js'

function LineChart () {
  return <Chart definition={definition} height={300} ariaLabel="Three series" />
}

createRoot(getContainer()).render(<LineChart />)
