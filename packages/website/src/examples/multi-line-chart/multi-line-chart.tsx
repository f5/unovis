import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisBulletLegend } from '@volterra/vis-react'

import { data, labels, CityTemps } from './data'

export default function MultiLineChart (): JSX.Element {
  const legendItems = ['austin', 'ny', 'sf'].map(city => ({ name: labels[city] }))
  return (
    <VisXYContainer data={data} height={300}>
      <VisLine
        x={useCallback((d: CityTemps) => new Date(d.date), [])}
        y={[
          useCallback((d: CityTemps) => d.austin, []),
          useCallback((d: CityTemps) => d.ny, []),
          useCallback((d: CityTemps) => d.sf, []),
        ]}/>
      <VisAxis type="x" label="Date" numTicks={6} tickFormat={Intl.DateTimeFormat().format}/>
      <VisAxis type="y" label="Temperature (celsius)"/>
      <VisBulletLegend items={legendItems}/>
    </VisXYContainer>
  )
}
