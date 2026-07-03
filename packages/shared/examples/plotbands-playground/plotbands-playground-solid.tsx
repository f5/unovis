import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/solid'
import { LabelOverflow } from '@unovis/ts'
import { createSignal, JSX } from 'solid-js'
import { data } from './data'

const fieldset: JSX.CSSProperties = { border: '1px solid #444', 'border-radius': '4px', padding: '8px 12px', display: 'flex', gap: '14px', 'align-items': 'center', 'flex-wrap': 'wrap' }
const legendStyle: JSX.CSSProperties = { 'font-size': '11px', color: '#888', 'text-transform': 'uppercase', 'letter-spacing': '0.5px', padding: '0 4px' }

const PlotbandsPlayground = (): JSX.Element => {
  const [yFrom, setYFrom] = createSignal(2)
  const [yTo, setYTo] = createSignal(4)
  const [yAutoPosition, setYAutoPosition] = createSignal(true)
  const [yOverflow, setYOverflow] = createSignal<LabelOverflow>(LabelOverflow.Smart)

  const [xFrom, setXFrom] = createSignal(7)
  const [xTo, setXTo] = createSignal(9)
  const [xAutoPosition, setXAutoPosition] = createSignal(true)
  const [xOverflow, setXOverflow] = createSignal<LabelOverflow>(LabelOverflow.Smart)

  return (
    <div>
      <div style={{ 'margin-bottom': '12px', display: 'flex', gap: '20px', 'flex-wrap': 'wrap' }}>
        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot band on y-axis (extra)</legend>
          <label>from: <input type='range' min={0} max={9} step={0.1} value={yFrom()} onInput={e => setYFrom(Number(e.currentTarget.value))} /> {yFrom().toFixed(1)}</label>
          <label>to: <input type='range' min={0} max={9} step={0.1} value={yTo()} onInput={e => setYTo(Number(e.currentTarget.value))} /> {yTo().toFixed(1)}</label>
          <label><input type='checkbox' checked={yAutoPosition()} onChange={e => setYAutoPosition(e.currentTarget.checked)} /> labelAutoPosition</label>
          <label style={{ opacity: yAutoPosition() ? 1 : 0.4 }}>labelOverflow:
            <select value={yOverflow()} disabled={!yAutoPosition()} onChange={e => setYOverflow(e.currentTarget.value as LabelOverflow)}>
              <option value={LabelOverflow.Smart}>smart</option>
              <option value={LabelOverflow.Hide}>hide</option>
              <option value={LabelOverflow.Stack}>stack</option>
            </select>
          </label>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot band on x-axis (extra)</legend>
          <label>from: <input type='range' min={0} max={14} step={0.1} value={xFrom()} onInput={e => setXFrom(Number(e.currentTarget.value))} /> {xFrom().toFixed(1)}</label>
          <label>to: <input type='range' min={0} max={14} step={0.1} value={xTo()} onInput={e => setXTo(Number(e.currentTarget.value))} /> {xTo().toFixed(1)}</label>
          <label><input type='checkbox' checked={xAutoPosition()} onChange={e => setXAutoPosition(e.currentTarget.checked)} /> labelAutoPosition</label>
          <label style={{ opacity: xAutoPosition() ? 1 : 0.4 }}>labelOverflow:
            <select value={xOverflow()} disabled={!xAutoPosition()} onChange={e => setXOverflow(e.currentTarget.value as LabelOverflow)}>
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
        <VisPlotband from={4} to={6} labelText='Plot band on x-axis' axis='x' labelPosition='top-inside' />
        <VisPlotband from={1} to={3} color='rgba(34, 99, 182, 0.3)' labelText='Plot band on y-axis' labelPosition='left-inside' />
        <VisPlotband
          from={yFrom()}
          to={yTo()}
          color='rgba(255, 165, 0, 0.3)'
          labelText={`Extra plot band on y-axis @ ${yFrom().toFixed(1)} – ${yTo().toFixed(1)}`}
          labelPosition='left-inside'
          labelAutoPosition={yAutoPosition()}
          labelOverflow={yOverflow()}
        />
        <VisPlotband
          from={xFrom()}
          to={xTo()}
          axis='x'
          color='rgba(220, 114, 0, 0.3)'
          labelText={`Extra plot band on x-axis @ ${xFrom().toFixed(1)} – ${xTo().toFixed(1)}`}
          labelPosition='top-inside'
          labelAutoPosition={xAutoPosition()}
          labelOverflow={xOverflow()}
        />
      </VisXYContainer>
    </div>
  )
}

export default PlotbandsPlayground
