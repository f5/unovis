import React from 'react'
import { VisXYContainer, VisArea, VisCrosshair, VisGroupedBar, VisLine, VisScatter, VisStackedBar } from '@unovis/react'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'

import s from './styles.module.css'

export const title = 'Stacked vs. Non-Stacked'
export const subTitle = 'XY component comparison'

export const component = (): JSX.Element => {
  const data = generateXYDataRecords(10)
  const x = (d: XYDataRecord): number => d.x
  const y = (d: XYDataRecord): number | undefined => d.y
  const yStacked = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]
  const components = [VisArea, VisGroupedBar, VisLine, VisScatter, VisStackedBar]
  return (<>

    {components.map(// eslint-disable-next-line @typescript-eslint/naming-convention
      Component => (
        <div className={s.componentRow}>
          {[y, yStacked].map(accessors => (
            <VisXYContainer data={data}>
              <Component x={x} y={accessors}/>
              <VisCrosshair/>
            </VisXYContainer>
          ))}
        </div>
      ))}
  </>)
}
