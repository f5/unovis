import { color } from 'd3-color'
import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord, randomNumberGenerator } from '@src/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisPlotband, VisTooltip, VisXYContainer } from '@unovis/react'
import { PlotbandLabelOrientation, PlotbandLabelPosition } from '@unovis/ts'
import React, { useRef } from 'react'
import s from './style.module.css'

type LineDataRecord = XYDataRecord & { y3: number; y4: number }

export const title = 'Plotband'
export const subTitle = 'Plot a band using the Plotband component'

const data: LineDataRecord[] = generateXYDataRecords(15).map(d => ({
  ...d,
  y3: randomNumberGenerator(),
  y4: randomNumberGenerator(),
}))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    (d: LineDataRecord) => d.y3,
    (d: LineDataRecord) => d.y4,
  ]
  const axis = ['x', 'y']

  const textOrientation: PlotbandLabelOrientation[] = [
    PlotbandLabelOrientation.Horizontal,
    PlotbandLabelOrientation.Vertical,
  ]
  const textPosition: PlotbandLabelPosition[] = [
    PlotbandLabelPosition.TopLeftOutside,
    PlotbandLabelPosition.TopLeftInside,
    PlotbandLabelPosition.TopInside,
    PlotbandLabelPosition.TopOutside,
    PlotbandLabelPosition.TopRightInside,
    PlotbandLabelPosition.TopRightOutside,
    PlotbandLabelPosition.RightInside,
    PlotbandLabelPosition.RightOutside,
    PlotbandLabelPosition.BottomRightInside,
    PlotbandLabelPosition.BottomRightOutside,
    PlotbandLabelPosition.BottomInside,
    PlotbandLabelPosition.BottomOutside,
    PlotbandLabelPosition.BottomLeftInside,
    PlotbandLabelPosition.BottomLeftOutside,
    PlotbandLabelPosition.LeftInside,
    PlotbandLabelPosition.LeftOutside,
  ]
  const [plotbandAxis, setPlotbandAxis] = useComponentState('plotband', 'axis', axis[1])
  const [plotbandFrom, setPlotbandFrom] = useComponentState('plotband', 'from', 2)
  const [plotbandTo, setPlotbandTo] = useComponentState('plotband', 'to', 3)
  const [plotbandColor, setPlotbandColor] = useComponentState<string | undefined>('plotband', 'color', 'rgba(255, 132, 0, 0.2)')

  const [plotbandText, setPlotbandText] = useComponentState('plotband', 'labelText', 'x label')
  const [plotbandTextPosition, setPlotbandTextPosition] = useComponentState('plotband', 'labelPosition', textPosition[0])
  const [plotbandTextOffsetX, setPlotbandTextOffsetX] = useComponentState('plotband', 'labelOffsetX', 14)
  const [plotbandTextOffsetY, setPlotbandTextOffsetY] = useComponentState('plotband', 'labelOffsetY', 14)
  const [plotbandTextOrientation, setPlotbandTextOrientation] = useComponentState('plotband', 'labelOrientation', textOrientation[1])
  const [plotbandLabelColor, setPlotbandLabelColor] = useComponentState<string | undefined>('plotband', 'labelColor', undefined)
  const [plotbandLabelSize, setPlotbandLabelSize] = useComponentState('plotband', 'labelSize', 12)

  const parsedColor = plotbandColor ? color(plotbandColor) : null
  const plotbandColorAlpha = parsedColor?.opacity ?? 0.2
  const setPlotbandColorAlpha = (alpha: number): void => {
    if (!parsedColor) return
    parsedColor.opacity = alpha
    setPlotbandColor(parsedColor.formatRgb())
  }

  return (
    <>
      <ExampleControls components={['plotband']}/>
      <div>
        <div>
          <h3>Plotband Props</h3>
          <div className={s.controls}>
            <label>
               Axis:
              <select
                value={axis.indexOf(plotbandAxis)}
                onChange={e => setPlotbandAxis(axis[Number(e.target.value)])}
              >
                {axis.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Color ({plotbandColor}):
                <input
                  type='color'
                  value={parsedColor?.formatHex() ?? '#000000'}
                  onChange={e => {
                    const next = color(e.target.value)
                    if (!next) return
                    next.opacity = plotbandColorAlpha
                    setPlotbandColor(next.formatRgb())
                  }}
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
              <input type='range'
                min={Math.min(1, plotbandFrom ?? 1)}
                max={Math.max(5, plotbandFrom ?? 5)}
                step={Number.isInteger(plotbandFrom) ? 1 : 'any'}
                value={plotbandFrom} onChange={e => setPlotbandFrom(Number(e.target.value))}/>
            </label>
            <label>
              To ({plotbandTo}):
              <input type='range'
                min={Math.min(1, plotbandTo ?? 1)}
                max={Math.max(10, plotbandTo ?? 10)}
                step={Number.isInteger((plotbandTo ?? 0) / 0.5) ? 0.5 : 'any'}
                value={plotbandTo} onChange={e => setPlotbandTo(Number(e.target.value))}/>
            </label>
          </div>
        </div>
        <div>
          <h3>Label Props</h3>
          <div className={s.controls}>
            <label>
              Text:
              <input type='text' value={plotbandText} onChange={e => setPlotbandText(e.target.value)}/>
            </label>
            <label>
              Position:
              <select value={plotbandTextPosition} onChange={e => setPlotbandTextPosition(e.target.value)}>
                {textPosition.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Offset X:
              <input type='range'
                min={Math.min(0, plotbandTextOffsetX ?? 0)}
                max={Math.max(50, plotbandTextOffsetX ?? 50)}
                step={Number.isInteger(plotbandTextOffsetX) ? 1 : 'any'}
                value={plotbandTextOffsetX} onChange={e => setPlotbandTextOffsetX(Number(e.target.value))}/>
              ({plotbandTextOffsetX})
            </label>
            <label>
              Offset Y:
              <input type='range'
                min={Math.min(0, plotbandTextOffsetY ?? 0)}
                max={Math.max(50, plotbandTextOffsetY ?? 50)}
                step={Number.isInteger(plotbandTextOffsetY) ? 1 : 'any'}
                value={plotbandTextOffsetY} onChange={e => setPlotbandTextOffsetY(Number(e.target.value))}/>
              ({plotbandTextOffsetY})
            </label>
            <label>
              Orientation:
              <select value={plotbandTextOrientation} onChange={e => setPlotbandTextOrientation(e.target.value)}>
                {textOrientation.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Color ({plotbandLabelColor}):
              <input type='color' value={plotbandLabelColor ?? '#000000'} onChange={e => setPlotbandLabelColor(e.target.value)}/>
              <button onClick={() => setPlotbandLabelColor(undefined)}>Clear</button>
            </label>
            <label>
              Label Size ({plotbandLabelSize}):
              <input type='range'
                min={Math.min(10, plotbandLabelSize ?? 10)}
                max={Math.max(20, plotbandLabelSize ?? 20)}
                step={Number.isInteger(plotbandLabelSize) ? 1 : 'any'}
                value={plotbandLabelSize} onChange={e => setPlotbandLabelSize(Number(e.target.value))}/>
            </label>
          </div>
        </div>
      </div>
      <div>
        <VisXYContainer<LineDataRecord> data={data}>
          <VisPlotband
            axis={plotbandAxis}
            color={plotbandColor}
            from={plotbandFrom}
            to={plotbandTo}
            labelText={plotbandText}
            labelPosition={plotbandTextPosition}
            labelOffsetX={plotbandTextOffsetX}
            labelOffsetY={plotbandTextOffsetY}
            labelOrientation={plotbandTextOrientation}
            labelColor={plotbandLabelColor}
            labelSize={plotbandLabelSize}
          />
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
