import type { LibraryId } from '../types'
import type { LibrarySupport } from './types'
import { unovisSupport } from './unovis'
import { rechartsSupport } from './recharts'
import { chartjsSupport } from './chartjs'
import { echartsSupport } from './echarts'
import { nivoSupport } from './nivo'
import { agChartsSupport } from './agcharts'
import { plotSupport } from './plot'
import { vegaLiteSupport } from './vegalite'
import { tanstackSupport } from './tanstack'

export { featureGroups } from './groups'
export type { Feature, FeatureGroup, SupportCell, SupportStatus } from './types'

export const support: Record<LibraryId, LibrarySupport> = {
  unovis: unovisSupport,
  recharts: rechartsSupport,
  chartjs: chartjsSupport,
  echarts: echartsSupport,
  nivo: nivoSupport,
  agcharts: agChartsSupport,
  plot: plotSupport,
  vegalite: vegaLiteSupport,
  tanstack: tanstackSupport,
}
