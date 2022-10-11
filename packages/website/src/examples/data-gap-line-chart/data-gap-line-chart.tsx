import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisXYLabels, VisBulletLegend } from '@unovis/react'

import { countries, data, legendItems, Country, DataRecord } from './data'

import './styles.css'

export default function BasicLineChart (): JSX.Element {
  const [current, setCurrent] = useState(0)
  const [fallbackValue, setFallbackValue] = useState<number | null | undefined>()
  const [items, setLegendItems] = useState([])

  const getY = useCallback<(c: Country) => ((d: DataRecord) => number)>(
    (c) => (d: DataRecord) => d[c.id],
  []
  )

  useEffect(() => {
    setFallbackValue(legendItems[current].value)
    setLegendItems(legendItems.map((o, i) => ({
      name: o.name,
      inactive: current !== i,
      color: countries[0].color,
    })))
  }, [current])

  return (<>
    <div className="fallbackValueSwitch">
      Select a fallback value for missing data points
      <VisBulletLegend items={items} onLegendItemClick={useCallback((_, i: number) => setCurrent(i), [])}/>
    </div>
    <VisXYContainer height={300} xDomain={[1961, 2022]} yDomain={[0, 650]}>
      <VisLine
        data={data}
        x={useCallback((d: DataRecord) => d.year, [])}
        y={useMemo(() => countries.map(getY), [])}
        fallbackValue={fallbackValue}
      />
      <VisXYLabels
        data={countries}
        x={2019.5}
        y={useCallback((c: Country) => getY(c)(data[data.length - 1]), [])}
        label={useCallback((c: Country) => c.label, [])}
        backgroundColor='none'
      />
      <VisAxis type="x" numTicks={10}/>
      <VisAxis
        type="y"
        label="National Cereal Production, tons"
        tickFormat={(d: number) => `${d}${d ? 'M' : ''}`}
        tickValues={[0, 200, 400, fallbackValue, 600]}
      />
    </VisXYContainer>
  </>)
}
