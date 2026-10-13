// TanStack Charts (vanilla): the framework-neutral DOM host
import { mountChart } from '@tanstack/charts/dom'
import { getContainer } from '../shared/data.js'
import { definition } from './tanstack-definition.js'

mountChart(getContainer(), { definition, height: 300, ariaLabel: 'Three series' })
