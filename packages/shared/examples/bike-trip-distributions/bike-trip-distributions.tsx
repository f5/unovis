import React, { useState } from 'react'
import { VisAxis, VisBulletLegend, VisCrosshair, VisGroupedBar, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function BikeTripDistributions (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state)
  const changeRider = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeLimit = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ limit: (event.target as HTMLInputElement | HTMLSelectElement).value })
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
        <label className="gallery-select">
          Visible duration
          <select value={state.limit} onChange={changeLimit}>
            {c.limitOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={[]} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Trip-duration histogram · share of rides</p>
        <VisXYContainer height={270} duration={600} xDomain={view.domain}>
          <VisGroupedBar data={view.histogram} x={c.minute} y={c.share} color={'var(--vis-color0)'} groupPadding={0.05} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.histogramTooltipTriggers} />
          <VisAxis type={'x'} label={'Duration (minutes)'} />
          <VisAxis type={'y'} tickFormat={c.percent} label={'Share of rides'} />
        </VisXYContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Cumulative share · rides shorter than each bin edge</p>
        <VisXYContainer height={240} duration={600} xDomain={view.domain} yDomain={c.cumulativeDomain}>
          <VisLine data={view.cumulative} x={c.edge} y={c.cumulative} color={'var(--vis-color1)'} curveType={c.CurveType.StepAfter} />
          <VisPlotline value={0.5} labelText={'50% of rides'} labelPosition={c.PlotlineLabelPosition.TopLeft} />
          <VisCrosshair template={c.cumulativeTooltip} data={view.cumulative} />
          <VisTooltip className={c.tooltipClassName} />
          <VisAxis type={'x'} label={'Duration (minutes)'} />
          <VisAxis type={'y'} tickFormat={c.percent} label={'Cumulative share'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
