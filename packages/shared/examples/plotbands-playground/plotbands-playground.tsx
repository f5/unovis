import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/react'
import { LabelOverflow } from '@unovis/ts'
import React, { useState } from 'react'
import { data } from './data'

const fieldset: React.CSSProperties = { border: '1px solid #444', borderRadius: 4, padding: '8px 12px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }
const legendStyle: React.CSSProperties = { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 4px' }

export default function PlotbandsPlayground (): JSX.Element {
  const [yFrom, setYFrom] = useState(2)
  const [yTo, setYTo] = useState(4)
  const [yAutoPosition, setYAutoPosition] = useState(true)
  const [yOverflow, setYOverflow] = useState<LabelOverflow>(LabelOverflow.Smart)

  const [xFrom, setXFrom] = useState(7)
  const [xTo, setXTo] = useState(9)
  const [xAutoPosition, setXAutoPosition] = useState(true)
  const [xOverflow, setXOverflow] = useState<LabelOverflow>(LabelOverflow.Smart)

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot band on y-axis (extra)</legend>
          <label>
            from:{' '}
            <input
              type='range'
              min={0}
              max={9}
              step={0.1}
              value={yFrom}
              onChange={(e) => setYFrom(Number(e.target.value))}
            />
            {' '}{yFrom.toFixed(1)}
          </label>
          <label>
            to:{' '}
            <input
              type='range'
              min={0}
              max={9}
              step={0.1}
              value={yTo}
              onChange={(e) => setYTo(Number(e.target.value))}
            />
            {' '}{yTo.toFixed(1)}
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
          <legend style={legendStyle}>Plot band on x-axis (extra)</legend>
          <label>
            from:{' '}
            <input
              type='range'
              min={0}
              max={14}
              step={0.1}
              value={xFrom}
              onChange={(e) => setXFrom(Number(e.target.value))}
            />
            {' '}{xFrom.toFixed(1)}
          </label>
          <label>
            to:{' '}
            <input
              type='range'
              min={0}
              max={14}
              step={0.1}
              value={xTo}
              onChange={(e) => setXTo(Number(e.target.value))}
            />
            {' '}{xTo.toFixed(1)}
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
        <VisPlotband from={4} to={6} labelText="Plot band on x-axis" axis="x" labelPosition="top-inside" />
        <VisPlotband from={1} to={3} color="rgba(34, 99, 182, 0.3)" labelText='Plot band on y-axis' labelPosition="left-inside" />
        <VisPlotband
          from={yFrom}
          to={yTo}
          color="rgba(255, 165, 0, 0.3)"
          labelText={`Extra plot band on y-axis @ ${yFrom.toFixed(1)} – ${yTo.toFixed(1)}`}
          labelPosition="left-inside"
          labelAutoPosition={yAutoPosition}
          labelOverflow={yOverflow}
        />
        <VisPlotband
          from={xFrom}
          to={xTo}
          axis="x"
          color="rgba(220, 114, 0, 0.3)"
          labelText={`Extra plot band on x-axis @ ${xFrom.toFixed(1)} – ${xTo.toFixed(1)}`}
          labelPosition="top-inside"
          labelAutoPosition={xAutoPosition}
          labelOverflow={xOverflow}
        />
      </VisXYContainer>
    </div>
  )
}
