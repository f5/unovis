import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisSingleContainer, VisStackedBar, VisTooltip, VisTopoJSONMap, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function AirportPassengerFlows (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeHub = (event: Event): void => {
    update({ hub: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Origin airport
          <select value={state().hub} onChange={changeHub}>
            {c.hubOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={[]} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-route-layout">
        <div class="gallery-panel">
          <p class="gallery-caption">Busiest destinations · passengers</p>
          <VisXYContainer height={470} duration={600} yDirection={'south'}>
            <VisStackedBar
              data={view().data}
              x={c.rank}
              y={c.passengers}
              orientation={'horizontal'}
              color={'var(--vis-color0)'}
              barPadding={0.25}
            />
            <VisAxis numTicks={3} type={'x'} tickFormat={c.compact} label={'Passengers'} />
            <VisAxis type={'y'} tickValues={c.rankTicks} tickFormat={view().destinationLabel} gridLine={false} />
          </VisXYContainer>
        </div>
        <div class="gallery-panel">
          <p class="gallery-caption">Passengers from the selected hub</p>
          <VisSingleContainer height={470} duration={600}>
            <VisTopoJSONMap
              data={view().mapData}
              topojson={c.usa}
              mapFeatureName={'states'}
              projection={view().projection}
              disableZoom={true}
              pointId={c.id}
              pointBottomLabel={c.pointLabel}
              pointRadius={c.radius}
              pointColor={'var(--vis-color0)'}
              linkSource={c.linkSource}
              linkTarget={c.linkTarget}
              linkWidth={c.linkWidth}
              linkColor={'var(--vis-color0)'}
              sourceLatitude={c.sourceLatitude}
              sourceLongitude={c.sourceLongitude}
              targetLatitude={c.targetLatitude}
              targetLongitude={c.targetLongitude}
              flowParticleDensity={view().density}
              flowParticleColor={'var(--vis-color1)'}
              flowParticleRadius={1.6}
              enableFlowAnimation={true}
              latitude={c.latitude}
              longitude={c.longitude}
            />
            <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          </VisSingleContainer>
        </div>
      </div>
    </div>
  )
}
