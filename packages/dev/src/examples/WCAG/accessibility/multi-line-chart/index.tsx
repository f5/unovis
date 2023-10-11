/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React, { useCallback, useMemo } from 'react'
import { Scale } from '@unovis/ts'
import { VisXYContainer, VisLine, VisAxis, VisBulletLegend } from '@unovis/react'

import { data, labels, CityTemps } from './data'

export const category = 'accessibility'
export const title = 'Multi Line Chart'
export const subTitle = 'Generated Data'


export const component = (): JSX.Element => {
  const legendItems = ['austin', 'ny', 'sf'].map(city => ({ name: (labels as any)[city] }))
  const xScale = useMemo(() => Scale.scaleTime(), [])
  return (
    <>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer data={data} height={'50vh'} xScale={xScale}>
        <VisLine
          x={useCallback((d: CityTemps) => +(new Date(d.date)), [])}
          y={[
            useCallback((d: CityTemps) => d.austin, []),
            useCallback((d: CityTemps) => d.ny, []),
            useCallback((d: CityTemps) => d.sf, []),
          ]}/>
        <VisAxis type="x" label="Date" numTicks={6} tickFormat={Intl.DateTimeFormat().format}/>
        <VisAxis type="y" label="Temperature (celsius)"/>
      </VisXYContainer>
    </>
  )
}
