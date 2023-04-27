import React, { useRef } from 'react'
import { XYLabels } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair, VisXYLabels } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

// Style
import s from './style.module.css'

export const title = 'Stacked Bar with Labels'
export const subTitle = 'Alerts and Data Labels'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  const data = generateXYDataRecords(10)

  type AlertDataRecord = { x: number; label: string }
  const alerts: AlertDataRecord[] = Array(10).fill(null).map(() => ({
    x: data[Math.floor(Math.random() * data.length)].x,
    label: '❕',
  }))

  const labelAccessor = (d: AlertDataRecord): string => d.label


  return (
    <div className={s.stackBarLabels}>
      <VisXYContainer className={s.stackBarLabels} margin={{ top: 5, left: 5 }}>
        <VisStackedBar<XYDataRecord> data={data} x={d => d.x} y={accessors} />
        <VisAxis type='x' numTicks={10}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}bps`}/>
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
        <VisTooltip ref={tooltipRef}/>
        <VisXYLabels<XYDataRecord>
          data={data}
          y={d => d.y / 2}
          x={d => d.x}
          label={d => `${d.y.toFixed(1)} bps`}
        />

        <VisXYLabels<AlertDataRecord>
          data={alerts}
          y={0}
          x={d => d.x}
          label={labelAccessor}
          yPositioning='absolute_percentage'
          backgroundColor='#F64627'
          clusterBackgroundColor='#F64627'
          labelFontSize={8}
          clusterFontSize={12}
          attributes={{
            [XYLabels.selectors.labelGroup]: {
              alert: true,
            },
            [XYLabels.selectors.cluster]: {
              cluster: true,
            },
          }}
        />
      </VisXYContainer>
    </div>
  )
}
