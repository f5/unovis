import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/react'
import { PlotlineLineStylePresets } from '@unovis/ts'
import React, { useRef, useState } from 'react'
import s from './style.module.css'


export const title = 'Plot Line'
export const subTitle = 'Plot a line using the PlotLine component'

const data = generateXYDataRecords(15)

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    () => Math.random(),
    () => Math.random(),
  ]

  const axis = ['x', 'y']
  const lineStyle: PlotlineLineStylePresets[] = ['solid', 'shortDash', 'shortDot', 'shortDashDot', 'shortDashDotDot', 'dot', 'dash', 'longDash', 'dashDot', 'longDashDot', 'longDashDotDot']
  const [plotlineAxis, setPlotlineAxis] = useState(axis[0])
  const [plotlineLineStyle, setPlotlineLineStyle] = useState(lineStyle[0])
  const [plotlineWidth, setPlotlineWidth] = useState(2)
  const [plotlineValue, setPlotlineValue] = useState(3)
  const [plotlineColor, setPlotlineColor] = useState('#FF8400')

  return (
    <>
      <div className={s.controls}>
        <label>
          Line Style:
          <select onChange={e => setPlotlineLineStyle(lineStyle[Number(e.target.value)])}>
            {lineStyle.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
          </select>
        </label>
        <label>
          Fallback value:
          <select onChange={e => setPlotlineAxis(axis[Number(e.target.value)])}>
            {axis.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
          </select>
        </label>
        <label>
          Line Width ({plotlineWidth}):
          <input type='range' min={1} max={5} value={plotlineWidth} onChange={e => setPlotlineWidth(Number(e.target.value))}/>
        </label>
        <label>
          Line Value ({plotlineValue}):
          <input type='range' min={1} max={10} value={plotlineValue} onChange={e => setPlotlineValue(Number(e.target.value))}/>
        </label>
        <label>
          Line Color ({plotlineColor}):
          <input type='color' value={plotlineColor} onChange={e => setPlotlineColor(e.target.value)}/>
        </label>
      </div>
      <div>
        <VisXYContainer<XYDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
          <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
          <VisPlotline
            axis={plotlineAxis}
            lineWidth={plotlineWidth}
            value={plotlineValue}
            lineStyle={plotlineLineStyle}
            color={plotlineColor}
          />

          <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
          <VisTooltip ref={tooltipRef} />
        </VisXYContainer>
      </div>
    </>
  )
}
