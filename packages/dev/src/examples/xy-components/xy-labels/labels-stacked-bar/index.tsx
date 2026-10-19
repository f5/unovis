import React, { useRef, useState } from 'react'
import { XYLabels } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair, VisXYLabels } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords, randomNumberGenerator } from '@src/utils/data'
import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentConfig } from '@src/components/ExampleControls/useComponentConfig'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Style
import s from './style.module.css'

export const title = 'Stacked Bar with Labels'
export const subTitle = 'Alerts and Data Labels'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const { config, setConfig, reset } = useComponentConfig('xyLabels', {
    showLabels: true,
    clustering: true,
    labelFontSize: 12,
  })
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  const [data] = useState(() => generateXYDataRecords(10))

  type AlertDataRecord = { x: number; label: string }
  const [alerts] = useState<AlertDataRecord[]>(() => Array(10).fill(null).map(() => ({
    x: data[Math.floor(randomNumberGenerator() * data.length)].x,
    label: '❕',
  })))

  const labelAccessor = (d: AlertDataRecord): string => d.label


  return (
    <div className={s.stackBarLabels}>
      <ExampleControls onReset={reset}/>
      <div className={s.xyLabelControls}>
        <label>
          <input type='checkbox' checked={config.showLabels} onChange={e => setConfig('showLabels', e.target.checked)}/> Data labels
        </label>
        <label>
          <input type='checkbox' checked={config.clustering} onChange={e => setConfig('clustering', e.target.checked)}/> Clustering
        </label>
        <label>
          Label font size: <input type='range' min={Math.min(8, config.labelFontSize ?? 8)} max={Math.max(24, config.labelFontSize ?? 24)}
            step={Number.isInteger(config.labelFontSize) ? 1 : 'any'} value={config.labelFontSize ?? ''}
            onChange={e => setConfig('labelFontSize', Number(e.target.value))}/>
          {config.labelFontSize}px
        </label>
      </div>
      <VisXYContainer className={s.stackBarLabels} margin={{ top: 5, left: 5 }}>
        <VisStackedBar<XYDataRecord> data={data} x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={10} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
        <VisCrosshair template={(d?: XYDataRecord) => (d ? `${d.x}` : '')}/>
        <VisTooltip ref={tooltipRef}/>
        {config.showLabels && <VisXYLabels<XYDataRecord>
          data={data}
          clustering={config.clustering}
          labelFontSize={config.labelFontSize}
          y={d => d.y / 2}
          x={d => d.x}
          label={d => `${d.y.toFixed(1)} bps`}
          duration={props.duration}
        />}

        <VisXYLabels<AlertDataRecord>
          data={alerts}
          clustering={config.clustering}
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
          duration={props.duration}
        />
      </VisXYContainer>
    </div>
  )
}
