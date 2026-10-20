import React, { useState } from 'react'
import { VisAxis, VisBulletLegend, VisScatter, VisSingleContainer, VisStackedBar, VisTooltip, VisTopoJSONMap, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function EarthquakeExplorer (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeMinimum = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ minimum: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeHalf = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ half: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Minimum magnitude
          <select value={state.minimum} onChange={changeMinimum}>
            {c.magnitudeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="gallery-select">
          Dates
          <select value={state.half} onChange={changeHalf}>
            {c.dateOptions.map(option => (
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
        <p className="gallery-caption">Epicenters · click a point to select</p>
        <VisSingleContainer height={300} duration={600}>
          <VisTopoJSONMap
            data={view.mapData}
            topojson={c.world}
            pointId={c.id}
            pointRadius={view.pointRadius}
            pointColor={view.pointColor}
            pointStrokeWidth={1}
            events={view.mapEvents}
            disableZoom={true}
            latitude={c.latitude}
            longitude={c.longitude}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.mapTooltipTriggers} />
        </VisSingleContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Depth and magnitude · click a point to select</p>
        <VisXYContainer autoMargin={false} margin={c.chartMargin} height={230} duration={600}>
          <VisScatter
            data={view.data}
            x={c.depth}
            y={c.magnitude}
            size={view.pointSize}
            color={view.pointColor}
            events={view.scatterEvents}
          />
          <VisTooltip className={c.tooltipClassName} triggers={c.scatterTooltipTriggers} />
          <VisAxis type={'x'} label={'Depth (km)'} />
          <VisAxis type={'y'} label={'Magnitude'} />
        </VisXYContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Daily event counts · UTC</p>
        <VisXYContainer autoMargin={false} margin={c.chartMargin} height={140} duration={600}>
          <VisStackedBar data={view.daily} x={c.day} y={c.count} color={'var(--vis-color0)'} barPadding={0.2} />
          <VisAxis type={'x'} tickFormat={c.dayLabel} numTicks={8} />
          <VisAxis type={'y'} numTicks={3} />
        </VisXYContainer>
      </div>
    </div>
  )
}
