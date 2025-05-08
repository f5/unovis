import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisPlotband, VisTooltip, VisXYContainer } from '@unovis/react'
import React, { useRef, useState } from 'react'
import s from './style.module.css'

export const title = 'Plotband'
export const subTitle = 'Plot a band using the Plotband component'

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

  const [plotlineAxis, setPlotlineAxis] = useState(axis[0])
  const [plotbandFrom, setPlotbandFrom] = useState(2)
  const [plotbandTo, setPlotbandTo] = useState(3)
  const [plotbandColor, setPlotbandColor] = useState('#ff8400')
  const [plotbandColorAlpha, setPlotbandColorAlpha] = useState(0.2)

  function formPlotbandFinalColor (color: string | undefined, alpha: number): string | undefined {
    if (!color || !/^#?[0-9A-Fa-f]{6}$/.test(color)) return undefined

    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const finalColor = formPlotbandFinalColor(plotbandColor, plotbandColorAlpha)

  return (
    <>
      <div>
        <div>
          <h3>Plotband Props</h3>
          <div className={s.controls}>
            <label>
               Axis:
              <select onChange={e => setPlotlineAxis(axis[Number(e.target.value)])}>
                {axis.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Color ({plotbandColor}):
                <input
                  type='color'
                  value={plotbandColor ?? '#000000'}
                  onChange={e => setPlotbandColor(e.target.value)}
                />
                <button onClick={() => setPlotbandColor(undefined)}>Clear</button>
              </label>
              <label>
                Color Alpha ({plotbandColorAlpha})
                <input type='range' min={0} max={1} step="0.1" value={plotbandColorAlpha} onChange={e => setPlotbandColorAlpha(Number(e.target.value))}/>
              </label>
            </div>
            <label>
              From ({plotbandFrom}):
              <input type='range' min={1} max={5} value={plotbandFrom} onChange={e => setPlotbandFrom(Number(e.target.value))}/>
            </label>
            <label>
              To ({plotbandTo}):
              <input type='range' min={1} max={10} step="0.5" value={plotbandTo} onChange={e => setPlotbandTo(Number(e.target.value))}/>
            </label>
          </div>
        </div>
        <div>
          <h3>Label Props</h3>
          <div className={s.controls}>

          </div>
        </div>
      </div>
      <div>
        <VisXYContainer<XYDataRecord> data={data}>
          <VisPlotband axis={plotlineAxis} color={finalColor} from={plotbandFrom} to={plotbandTo} />
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
          <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
          <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
          <VisTooltip ref={tooltipRef} />
        </VisXYContainer>
      </div>
    </>
  )
}
