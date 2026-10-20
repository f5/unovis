import React, { useState } from 'react'
import { VisArea, VisAxis, VisBrush, VisBulletLegend, VisCrosshair, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function SolarCycleForecast (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const reset = (): void => setState(c.initialState)
  const view = c.getView(state, update)

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
      <VisBulletLegend items={c.legend} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Sunspot number</p>
        <VisXYContainer height={420} duration={600} xDomain={state.domain}>
          <VisArea
            data={view.prediction}
            x={c.time}
            y={c.bandHeight}
            baseline={c.bandBaseline}
            color={'var(--vis-color1)'}
            opacity={0.18}
          />
          <VisLine
            data={view.observed}
            x={c.time}
            y={c.observed}
            color={'var(--vis-color0)'}
            lineWidth={1.4}
            curveType={c.CurveType.Linear}
          />
          <VisLine
            data={view.prediction}
            x={c.time}
            y={c.predicted}
            color={'var(--vis-color1)'}
            lineDashArray={c.forecastDash}
            curveType={c.CurveType.Linear}
          />
          <VisPlotline
            axis={'x'}
            value={view.forecastStart}
            labelText={'Forecast snapshot'}
            labelPosition={c.PlotlineLabelPosition.TopRight}
          />
          <VisCrosshair template={c.crosshairTemplate} data={view.data} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} />
          <VisAxis type={'x'} tickFormat={c.yearLabel} numTicks={7} />
          <VisAxis type={'y'} label={'Monthly sunspot number'} />
        </VisXYContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Drag the overview to explore the record</p>
        <VisXYContainer height={85} duration={600}>
          <VisLine data={view.data} x={c.time} y={c.observed} lineWidth={1} color={'var(--vis-color0)'} />
          <VisBrush draggable={true} selection={state.domain} onBrush={view.onBrush} />
          <VisAxis type={'x'} tickFormat={c.yearLabel} numTicks={8} />
        </VisXYContainer>
      </div>
    </div>
  )
}
