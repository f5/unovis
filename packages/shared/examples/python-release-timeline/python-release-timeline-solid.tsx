import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisPlotline, VisTimeline, VisTooltip, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function PythonReleaseTimeline (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeStatus = (event: Event): void => {
    update({ status: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Show releases
          <select value={state().status} onChange={changeStatus}>
            {c.statusOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={c.legend} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Release → end of support</p>
        <VisXYContainer height={430} duration={600} xDomain={c.domain}>
          <VisTimeline
            data={view().data}
            id={c.id}
            x={c.start}
            lineDuration={c.duration}
            lineRow={c.row}
            color={c.color}
            lineWidth={12}
            showRowLabels={true}
            rowHeight={38}
            rowLabelWidth={100}
            rowLabelTextAlign={'left'}
            lineCap={true}
            pattern={c.pattern}
          />
          <VisPlotline axis={'x'} value={c.snapshot} labelText={'19 Oct 2026'} labelPosition={view().labelPosition} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} tickFormat={c.yearLabel} numTicks={8} />
        </VisXYContainer>
      </div>
    </div>
  )
}
