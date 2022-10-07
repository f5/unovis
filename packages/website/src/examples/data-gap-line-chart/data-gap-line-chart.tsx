import React, { useCallback, useEffect, useState } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisXYLabels, VisBulletLegend } from '@unovis/react'

import { countries, data, legendItems, Country, DataRecord } from './data'

function getY (c: Country): (d: DataRecord) => number {
  return (d: DataRecord) => d[c.id]
}

export default function BasicLineChart (): JSX.Element {
  const [current, setCurrent] = useState(0)
  const [fallbackValue, setFallbackValue] = useState()
  const [items, setLegendItems] = useState([])

  useEffect(() => {
    setFallbackValue(legendItems[current].value)
    setLegendItems(legendItems.map((o, i) => ({
      name: o.name,
      inactive: current !== i,
      color: countries[0].color,
    })))
  }, [current])

  return (
    <VisXYContainer height={300} xDomain={[1961, 2022]}>
      Select a fallback value for missing data points:
      <VisBulletLegend items={items} onLegendItemClick={useCallback((_, i: number) => setCurrent(i), [])}/>
      <VisLine
        data={data}
        x={useCallback((d: DataRecord) => d.year, [])}
        y={countries.map(useCallback(getY, []))}
        fallbackValue={fallbackValue}
      />
      <VisXYLabels
        data={countries}
        x={2019.5}
        y={useCallback((c: Country) => getY(c)(data[data.length - 1]), [])}
        label={useCallback((c: Country) => c.label, [])}
        backgroundColor='none'/>
      <VisAxis type="x" numTicks={10}/>
      <VisAxis type="y" tickValues={[fallbackValue, 600]}/>
    </VisXYContainer>
  )
}
