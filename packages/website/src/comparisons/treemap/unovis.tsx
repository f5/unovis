import React, { useState } from 'react'
import { Treemap, TreemapNode, getCSSColorVariable } from '@unovis/ts'
import { VisSingleContainer, VisTreemap, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

const tooltipTriggers = {
  [Treemap.selectors.tile]: (d: TreemapNode<DataRecord>) => `<b>${d.data.key}</b>: ${formatCost(d.value)}`,
}

export default function UnovisTreemap ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = teams.map(team => ({ name: team, inactive: hidden[team] }))
  const toggleTeam = (item: { name: string }): void => setHidden({ ...hidden, [item.name]: !hidden[item.name] })

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleTeam}/>
      <VisSingleContainer data={data.filter(d => !hidden[d.team])} height={296}>
        <VisTreemap
          value={(d: DataRecord) => d.cost}
          layers={[(d: DataRecord) => d.team, (d: DataRecord) => d.service]}
          // Teams keep their legend color when another team is hidden; services get lighter shades of it
          tileColor={(d: TreemapNode<DataRecord>) => d.depth === 1 ? `var(${getCSSColorVariable(teams.indexOf(d.data.key))})` : undefined}
          tileLabel={(d: TreemapNode<DataRecord>) => `${d.data.key}: ${formatCost(d.value)}`}
          tileShowHtmlTooltip={false}
          labelInternalNodes={preset === 'groups'}
          tilePaddingTop={preset === 'groups' ? 20 : undefined}
          tilePadding={preset === 'rounded' ? 6 : 2}
          tileBorderRadius={preset === 'rounded' ? 8 : 2}
          enableLightnessVariance={preset === 'shades'}
        />
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
