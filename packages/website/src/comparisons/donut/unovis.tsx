import React, { useState } from 'react'
import { Donut } from '@unovis/ts'
import { VisSingleContainer, VisDonut, VisTooltip, VisBulletLegend } from '@unovis/react'

import { DataRecord, formatValue, getTotal } from './data'

const tooltipTriggers = {
  [Donut.selectors.segment]: (d: { data: DataRecord }) => `<b>${d.data.source}</b>: ${formatValue(d.data.sessions)}`,
}

export default function UnovisDonutChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = data.map(d => ({ name: d.source, inactive: hidden[d.source] }))
  const toggleSource = (item: { name: string }): void => setHidden({ ...hidden, [item.name]: !hidden[item.name] })

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSource}/>
      <VisSingleContainer data={data} height={296} margin={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <VisDonut
          value={(d: DataRecord) => hidden[d.source] ? 0 : d.sessions}
          arcWidth={60}
          centralLabel={formatValue(getTotal(data))}
          centralSubLabel="Total sessions"
        />
        <VisTooltip triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
