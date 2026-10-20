import React, { useState } from 'react'
import { VisBulletLegend, VisSingleContainer, VisTooltip, VisTreemap } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function StreetTreeTreemap (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeBorough = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ borough: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeQuery = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Borough
          <select value={state.borough} onChange={changeBorough}>
            {c.boroughOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Find a species
          <input type="search" value={state.query} onInput={changeQuery} />
        </label>
      </div>
      <VisBulletLegend items={[]} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Living trees · borough → species</p>
        <VisSingleContainer svgDefs={c.svgDefs} height={460} duration={600}>
          <VisTreemap
            data={view.data}
            value={c.value}
            layers={c.layers}
            numberFormat={c.compact}
            tilePadding={3}
            tilePaddingTop={22}
            labelInternalNodes={true}
            enableTileLabelFontSizeVariation={true}
            tileLabelMediumFontSize={c.tileLabelMediumFontSize}
            tileLabelLargeFontSize={c.tileLabelLargeFontSize}
            showTileClickAffordance={true}
            events={view.events}
            attributes={view.attributes}
            tileColor={view.tileColor}
            tileSort={c.tileSort}
            enableLightnessVariance={true}
            minTileSizeForLabel={20}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
