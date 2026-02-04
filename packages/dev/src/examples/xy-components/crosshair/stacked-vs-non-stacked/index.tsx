import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisArea, VisCrosshair, VisGroupedBar, VisLine, VisScatter, VisStackedBar, VisXYContainer } from '@unovis/react'
import React from 'react'
import s from './styles.module.css'


export const title = 'Stacked vs Non-Stacked'
export const subTitle = 'XY component comparison'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
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
      (Component, i) => (
        <div key={i} className={s.componentRow}>
          {[y, yStacked].map((accessors, j) => (
            <VisXYContainer key={j} data={data}>
              <Component x={x} y={accessors} duration={props.duration}/>
              <VisCrosshair/>
            </VisXYContainer>
          ))}
        </div>
      ))}
  </>)
}
