import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentConfig } from '@src/components/ExampleControls/useComponentConfig'
import { PlotlineConfigInterface, PlotlineLabelOrientation, PlotlineLabelPosition, isArray, isString } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord, randomNumberGenerator } from '@src/utils/data'
import { VisAxis, VisCrosshair, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/react'
import React, { useRef } from 'react'
import { PLOTLINE_LINE_STYLES } from './constants'
import s from './style.module.css'


export const title = 'Plot Line'
export const subTitle = 'Plot a line using the PlotLine component'

type PlotlineDataRecord = XYDataRecord & { y3: number; y4: number }

const data: PlotlineDataRecord[] = generateXYDataRecords(15).map(d => ({
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
    (d: PlotlineDataRecord) => d.y3,
    (d: PlotlineDataRecord) => d.y4,
  ]

  const axis = ['x', 'y']
  const lineStyle = PLOTLINE_LINE_STYLES
  const textPosition = Object.values(PlotlineLabelPosition)
  const textOrientation = Object.values(PlotlineLabelOrientation)

  const { config, setConfig, reset } = useComponentConfig<PlotlineConfigInterface<PlotlineDataRecord>>('plotline', {
    axis: 'x',
    value: 3,
    color: '#FF8400',
    lineWidth: 2,
    lineStyle: lineStyle[0],
    labelText: 'x label',
    labelPosition: PlotlineLabelPosition.Left,
    labelOffsetX: 14,
    labelOffsetY: 14,
    labelOrientation: PlotlineLabelOrientation.Horizontal,
    labelColor: undefined,
    labelSize: 12,
    duration: props.duration,
  })

  return (
    <>
      <ExampleControls onReset={reset}/>
      <div >
        <div>
          <h3>Line Props</h3>
          <div className={s.controls}>
            <label>
              Style:
              <select value={isArray(config.lineStyle) ? 'custom' : config.lineStyle ? lineStyle.indexOf(config.lineStyle) : ''}
                onChange={e => setConfig('lineStyle', lineStyle[Number(e.target.value)])}
              >
                <option value='' disabled>Default</option>
                {isArray(config.lineStyle) && <option value='custom' disabled>Custom ({config.lineStyle.join(', ')})</option>}
                {lineStyle.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
              <button onClick={() => setConfig('lineStyle', undefined)}>Clear</button>
            </label>
            <label>
              Axis:
              <select value={axis.indexOf(config.axis ?? '')} onChange={e => setConfig('axis', axis[Number(e.target.value)])}>
                {axis.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
              </select>
            </label>
            <label>
              Width ({config.lineWidth}):
              <input type='range'
                min={Math.min(1, config.lineWidth ?? 1)} max={Math.max(5, config.lineWidth ?? 5)} step={Number.isInteger(config.lineWidth) ? 1 : 'any'} value={config.lineWidth ?? ''}
                onChange={e => setConfig('lineWidth', Number(e.target.value))}
              />
            </label>
            <label>
              Value ({config.value}):
              <input type='range'
                min={Math.min(1, config.value ?? 1)} max={Math.max(10, config.value ?? 10)} step={Number.isInteger((config.value ?? 0) * 2) ? 0.5 : 'any'} value={config.value ?? ''}
                onChange={e => setConfig('value', Number(e.target.value))}
              />
            </label>
            <label>
              Color ({config.color}):
              <input type='color' value={config.color ?? '#000000'} onChange={e => setConfig('color', e.target.value)}/>
              <button onClick={() => setConfig('color', undefined)}>Clear</button>
            </label>
          </div>
        </div>
        <div>
          <h3>Label Props</h3>
          <div className={s.controls}>
            <label>
              Text:
              <input type='text' value={isString(config.labelText) ? config.labelText : JSON.stringify(config.labelText) ?? ''} onChange={e => setConfig('labelText', e.target.value)}/>
            </label>
            <label>
              Position:
              <select value={config.labelPosition} onChange={e => setConfig('labelPosition', textPosition[e.target.selectedIndex])}>
                {textPosition.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Offset X:
              <input type='range'
                min={Math.min(0, config.labelOffsetX ?? 0)} max={Math.max(50, config.labelOffsetX ?? 50)} step={Number.isInteger(config.labelOffsetX) ? 1 : 'any'} value={config.labelOffsetX ?? ''}
                onChange={e => setConfig('labelOffsetX', Number(e.target.value))}
              />
              ({config.labelOffsetX})
            </label>
            <label>
              Offset Y:
              <input type='range'
                min={Math.min(0, config.labelOffsetY ?? 0)} max={Math.max(50, config.labelOffsetY ?? 50)} step={Number.isInteger(config.labelOffsetY) ? 1 : 'any'} value={config.labelOffsetY ?? ''}
                onChange={e => setConfig('labelOffsetY', Number(e.target.value))}
              />
              ({config.labelOffsetY})
            </label>
            <label>
              Orientation:
              <select value={config.labelOrientation} onChange={e => setConfig('labelOrientation', textOrientation[e.target.selectedIndex])}>
                {textOrientation.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </label>
            <label>
              Color ({config.labelColor}):
              <input type='color' value={config.labelColor ?? '#000000'} onChange={e => setConfig('labelColor', e.target.value)}/>
              <button onClick={() => setConfig('labelColor', undefined)}>Clear</button>
            </label>
            <label>
              Label Size ({config.labelSize}):
              <input type='range'
                min={Math.min(10, config.labelSize ?? 10)} max={Math.max(20, config.labelSize ?? 20)} step={Number.isInteger(config.labelSize) ? 1 : 'any'} value={config.labelSize ?? ''}
                onChange={e => setConfig('labelSize', Number(e.target.value))}
              />
            </label>
          </div>
        </div>
      </div>
      <div>
        <VisXYContainer<PlotlineDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
          <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
          <VisPlotline {...config}/>

          <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
          <VisTooltip ref={tooltipRef} />
        </VisXYContainer>
      </div>
    </>
  )
}
