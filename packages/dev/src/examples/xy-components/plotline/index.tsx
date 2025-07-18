import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/react'
import { PlotlineLegendOrientation, PlotlineLegendPosition, PlotlineLineStylePresets } from '@unovis/ts'
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
  const textPosition: PlotlineLegendPosition[] = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left']
  const textOrientation: PlotlineLegendOrientation[] = ['horizontal', 'vertical']

  const [plotlineAxis, setPlotlineAxis] = useState(axis[0])
  const [plotlineLineStyle, setPlotlineLineStyle] = useState(lineStyle[0])
  const [plotlineWidth, setPlotlineWidth] = useState(2)
  const [plotlineValue, setPlotlineValue] = useState(3)
  const [plotlineColor, setPlotlineColor] = useState('#FF8400')

  const [plotlineText, setPlotlineText] = useState('x label')
  const [plotlineTextPosition, setPlotlineTextPosition] = useState(textPosition[7])
  const [plotlineTextOffsetX, setPlotlineTextOffsetX] = useState(14)
  const [plotlineTextOffsetY, setPlotlineTextOffsetY] = useState(14)
  const [plotlineTextOrientation, setPlotlineTextOrientation] = useState(textOrientation[0])
  const [plotlineLabelColor, setPlotlineLabelColor] = useState()
  const [plotlineLabelSize, setPlotlineLabelSize] = useState(12)

  return (
    <>
      <div >
        <div>
          <h3>Line Props</h3>
          <div className={s.controls}>
            <label>
              Style:
              <select onChange={e => setPlotlineLineStyle(lineStyle[Number(e.target.value)])}>
                {lineStyle.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
              <button onClick={() => setPlotlineLineStyle(undefined)}>Clear</button>
            </label>
            <label>
              Axis:
              <select onChange={e => setPlotlineAxis(axis[Number(e.target.value)])}>
                {axis.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
            </label>
            <label>
              Width ({plotlineWidth}):
              <input type='range' min={1} max={5} value={plotlineWidth} onChange={e => setPlotlineWidth(Number(e.target.value))}/>
            </label>
            <label>
              Value ({plotlineValue}):
              <input type='range' min={1} max={10} step="0.5" value={plotlineValue} onChange={e => setPlotlineValue(Number(e.target.value))}/>
            </label>
            <label>
              Color ({plotlineColor}):
              <input type='color' value={plotlineColor} onChange={e => setPlotlineColor(e.target.value)}/>
              <button onClick={() => setPlotlineColor(undefined)}>Clear</button>
            </label>
          </div>
        </div>
        <div>
          <h3>Label Props</h3>
          <div className={s.controls}>
            <label>
              Text:
              <input type='text' value={plotlineText} onChange={e => setPlotlineText(e.target.value)}/>
            </label>
            <label>
              Position:
              <select value={plotlineTextPosition} onChange={e => setPlotlineTextPosition(e.target.value)}>
                {textPosition.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Offset X:
              <input type='range' min={0} max={50} value={plotlineTextOffsetX} onChange={e => setPlotlineTextOffsetX(Number(e.target.value))}/>
              ({plotlineTextOffsetX})
            </label>
            <label>
              Offset Y:
              <input type='range' min={0} max={50} value={plotlineTextOffsetY} onChange={e => setPlotlineTextOffsetY(Number(e.target.value))}/>
              ({plotlineTextOffsetY})
            </label>
            <label>
              Orientation:
              <select value={plotlineTextOrientation} onChange={e => setPlotlineTextOrientation(e.target.value)}>
                {textOrientation.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Color ({plotlineLabelColor}):
              <input type='color' value={plotlineColor} onChange={e => setPlotlineLabelColor(e.target.value)}/>
              <button onClick={() => setPlotlineLabelColor(undefined)}>Clear</button>
            </label>
            <label>
              Label Size ({plotlineLabelSize}):
              <input type='range' min={10} max={20} value={plotlineLabelSize} onChange={e => setPlotlineLabelSize(Number(e.target.value))}/>
            </label>
          </div>
        </div>
      </div>
      <div>
        <VisXYContainer<XYDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
          <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
          <VisPlotline
            axis={plotlineAxis}
            value={plotlineValue}
            color={plotlineColor}
            lineWidth={plotlineWidth}
            lineStyle={plotlineLineStyle}
            labelText={plotlineText}
            labelPosition={plotlineTextPosition}
            labelOffsetX={plotlineTextOffsetX}
            labelOffsetY={plotlineTextOffsetY}
            labelOrientation={plotlineTextOrientation}
            labelColor={plotlineLabelColor}
            labelSize={plotlineLabelSize}
          />

          <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
          <VisTooltip ref={tooltipRef} />
        </VisXYContainer>
      </div>
    </>
  )
}
