import React, { useRef } from 'react'
import { VisXYContainer, VisAxis, VisTooltip, VisCrosshair, VisBulletLegend, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { Scale } from '@unovis/ts'

export const title = 'Multi Line Chart'
export const subTitle = 'Generated Data'

export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    () => Math.random(),
    () => Math.random(),
  ]
  return (
    <>
      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)}
        xScale={Scale.scaleTime()}
        margin={{ top: 5, left: 5, bottom: 40, right: 5 }}>
        <VisLine x={d => d.x} y={accessors}/>
        <VisAxis type='x'
          numTicks={15}
          tickFormat={(x: number) => `${Intl.DateTimeFormat().format(x)}`}
          // tickTextAngle={60}
          tickTextWidth={10}
          tickTextFitMode='wrap'
          // maxWidth={20}
          // position={'bottom'}
          tickTextAlign={'left'}
        />
        <VisAxis type='y'
          tickFormat={(y: number) => `${y * 100000000}`}
          // tickTextAngle={40}
          tickTextFitMode={'wrap'}
          // position={'right'}
        />
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} />
      </VisXYContainer>
    </>
  )
}
