import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/react'
import { LabelOverflow } from '@unovis/ts'
import React, { useState } from 'react'
import { data } from './data'

const fieldset: React.CSSProperties = { border: '1px solid #444', borderRadius: 4, padding: '8px 12px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }
const legendStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 4px' }

export default function PlotlinesPlayground (): JSX.Element {
  const [yValue, setYValue] = useState(6)
  const [yAutoPosition, setYAutoPosition] = useState(true)
  const [yOverflow, setYOverflow] = useState<LabelOverflow>(LabelOverflow.Smart)

  const [xValue, setXValue] = useState(10)
  const [xAutoPosition, setXAutoPosition] = useState(true)
  const [xOverflow, setXOverflow] = useState<LabelOverflow>(LabelOverflow.Smart)

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot line on y-axis (extra)</legend>
          <label>
            value:{' '}
            <input
              type='range'
              min={4}
              max={8}
              step={0.1}
              value={yValue}
              onChange={(e) => setYValue(Number(e.target.value))}
            />
            {' '}{yValue.toFixed(1)}
          </label>
          <label>
            <input
              type='checkbox'
              checked={yAutoPosition}
              onChange={(e) => setYAutoPosition(e.target.checked)}
            />
            {' '}labelAutoPosition
          </label>
          <label style={{ opacity: yAutoPosition ? 1 : 0.4 }}>
            labelOverflow:{' '}
            <select
              value={yOverflow}
              disabled={!yAutoPosition}
              onChange={(e) => setYOverflow(e.target.value as LabelOverflow)}
            >
              <option value={LabelOverflow.Smart}>smart</option>
              <option value={LabelOverflow.Hide}>hide</option>
              <option value={LabelOverflow.Stack}>stack</option>
            </select>
          </label>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot line on x-axis (extra)</legend>
          <label>
            value:{' '}
            <input
              type='range'
              min={8}
              max={12}
              step={0.1}
              value={xValue}
              onChange={(e) => setXValue(Number(e.target.value))}
            />
            {' '}{xValue.toFixed(1)}
          </label>
          <label>
            <input
              type='checkbox'
              checked={xAutoPosition}
              onChange={(e) => setXAutoPosition(e.target.checked)}
            />
            {' '}labelAutoPosition
          </label>
          <label style={{ opacity: xAutoPosition ? 1 : 0.4 }}>
            labelOverflow:{' '}
            <select
              value={xOverflow}
              disabled={!xAutoPosition}
              onChange={(e) => setXOverflow(e.target.value as LabelOverflow)}
            >
              <option value={LabelOverflow.Smart}>smart</option>
              <option value={LabelOverflow.Hide}>hide</option>
              <option value={LabelOverflow.Stack}>stack</option>
            </select>
          </label>
        </fieldset>
      </div>

      <VisXYContainer height={600}>
        <VisLine data={data} x={d => d.x} y={d => d.y} />
        <VisAxis type='x' />
        <VisAxis type='y' />
        <VisPlotline value={6} color="rgba(7, 114, 21, 1)" labelText="Plot line on y-axis" labelPosition="top-left" />
        <VisPlotline value={10} color="rgba(220, 114, 0, 1)" axis="x" labelOrientation="vertical" labelText="Plot line on x-axis" />
        <VisPlotline
          value={yValue}
          color="rgba(7, 114, 21, 1)"
          labelText={`Extra plot line on y-axis @ ${yValue.toFixed(1)}`}
          labelPosition="top-left"
          labelAutoPosition={yAutoPosition}
          labelOverflow={yOverflow}
        />
        <VisPlotline
          value={xValue}
          color="rgba(220, 114, 0, 1)"
          axis="x"
          labelOrientation="vertical"
          labelText={`Extra plot line on x-axis @ ${xValue.toFixed(1)}`}
          labelPosition="top-right"
          labelAutoPosition={xAutoPosition}
          labelOverflow={xOverflow}
        />
      </VisXYContainer>
    </div>
  )
}
