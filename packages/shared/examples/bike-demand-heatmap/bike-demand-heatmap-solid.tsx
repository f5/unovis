import { createSignal, createMemo, JSX } from 'solid-js'
import { VisRollingPinLegend, VisHeatmap, VisSingleContainer, VisTooltip } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function BikeDemandHeatmap (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeRider = (event: Event): void => {
    update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Riders
          <select value={state().rider} onChange={changeRider}>
            {c.riderOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisRollingPinLegend rects={c.colorRange} leftLabelText="0" rightLabelText={view().maxLabel} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Average trip starts · weekday × hour</p>
        <VisSingleContainer height={330} duration={600}>
          <VisHeatmap
            data={view().data}
            value={c.value}
            numRows={7}
            colorRange={c.colorRange}
            colorDomain={view().colorDomain}
            rowLabel={c.weekdayLabel}
            columnLabel={c.hourLabel}
            cellPadding={3}
            cellCornerRadius={3}
            cursor={'pointer'}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
