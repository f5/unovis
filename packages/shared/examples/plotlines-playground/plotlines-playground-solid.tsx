import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/solid'
import { LabelOverflow } from '@unovis/ts'
import { createSignal, JSX } from 'solid-js'
import { data } from './data'

const fieldset: JSX.CSSProperties = { border: '1px solid #444', 'border-radius': '4px', padding: '8px 12px', display: 'flex', gap: '14px', 'align-items': 'center', 'flex-wrap': 'wrap' }
const legendStyle: JSX.CSSProperties = { 'font-size': '11px', color: '#888', 'text-transform': 'uppercase', 'letter-spacing': '0.5px', padding: '0 4px' }

const PlotlinesPlayground = (): JSX.Element => {
  const [yValue, setYValue] = createSignal(6)
  const [yAutoPosition, setYAutoPosition] = createSignal(true)
  const [yOverflow, setYOverflow] = createSignal<LabelOverflow>(LabelOverflow.Smart)

  const [xValue, setXValue] = createSignal(10)
  const [xAutoPosition, setXAutoPosition] = createSignal(true)
  const [xOverflow, setXOverflow] = createSignal<LabelOverflow>(LabelOverflow.Smart)

  return (
    <div>
      <div style={{ 'margin-bottom': '12px', display: 'flex', gap: '20px', 'flex-wrap': 'wrap' }}>
        <fieldset style={fieldset}>
          <legend style={legendStyle}>Plot line on y-axis (extra)</legend>
          <label>value: <input type='range' min={4} max={8} step={0.1} value={yValue()} onInput={e => setYValue(Number(e.currentTarget.value))} /> {yValue().toFixed(1)}</label>
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
          <legend style={legendStyle}>Plot line on x-axis (extra)</legend>
          <label>value: <input type='range' min={8} max={12} step={0.1} value={xValue()} onInput={e => setXValue(Number(e.currentTarget.value))} /> {xValue().toFixed(1)}</label>
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
        <VisPlotline value={6} color='rgba(7, 114, 21, 1)' labelText='Plot line on y-axis' labelPosition='top-left' />
        <VisPlotline value={10} color='rgba(220, 114, 0, 1)' axis='x' labelOrientation='vertical' labelText='Plot line on x-axis' />
        <VisPlotline
          value={yValue()}
          color='rgba(7, 114, 21, 1)'
          labelText={`Extra plot line on y-axis @ ${yValue().toFixed(1)}`}
          labelPosition='top-left'
          labelAutoPosition={yAutoPosition()}
          labelOverflow={yOverflow()}
        />
        <VisPlotline
          value={xValue()}
          color='rgba(220, 114, 0, 1)'
          axis='x'
          labelOrientation='vertical'
          labelText={`Extra plot line on x-axis @ ${xValue().toFixed(1)}`}
          labelPosition='top-right'
          labelAutoPosition={xAutoPosition()}
          labelOverflow={xOverflow()}
        />
      </VisXYContainer>
    </div>
  )
}

export default PlotlinesPlayground
