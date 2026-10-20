import React, { useState } from 'react'
import { VisRollingPinLegend, VisHeatmap, VisSingleContainer, VisTooltip } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function BikeDemandHeatmap (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state)
  const changeRider = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Riders
          <select value={state.rider} onChange={changeRider}>
            {c.riderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VisRollingPinLegend rects={c.colorRange} leftLabelText="0" rightLabelText={view.maxLabel} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Average trip starts · weekday × hour</p>
        <VisSingleContainer height={330} duration={600}>
          <VisHeatmap
            data={view.data}
            value={c.value}
            numRows={7}
            colorRange={c.colorRange}
            colorDomain={view.colorDomain}
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
