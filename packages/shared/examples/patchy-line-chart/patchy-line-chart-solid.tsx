import { createSignal, JSX, For } from 'solid-js'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisScatter, VisTooltip } from '@unovis/solid'
import { CurveType } from '@unovis/ts'
import { countries, Country, data, DataRecord } from './data'


const PatchyLineChart = (): JSX.Element => {
  const fallbacks = [null, undefined, 0, 2000]
  const [fallbackValue, setFallbackValue] = createSignal(fallbacks[0])
  const [interpolation, setInterpolation] = createSignal(true)
  const [showScatter, setShowScatter] = createSignal(true)

  const getY = (c: Country) => (d: DataRecord) => d[c.id]
  const xCallback = (d: DataRecord): number => d.year
  const countriesYMemo = countries.map(getY)

  return (
    <div>
      <div class="controls-container">
        <label>
          Select a fallback value for missing data points:
          <select
            value={fallbackValue()}
            onChange={(e) => setFallbackValue(fallbacks[e.target.selectedIndex])}
          >
            <For each={fallbacks}>
              {(option) => (
                <option value={option}>{String(option)}</option>
              )}
            </For>
          </select>
        </label>
        <label>
          Interpolate:
          <input
            type="checkbox"
            checked={interpolation()}
            onChange={(e) => setInterpolation(e.target.checked)}
          />
        </label>
        <label>
          Show Scatter:
          <input
            type="checkbox"
            checked={showScatter()}
            onChange={(e) => setShowScatter(e.target.checked)}
          />
        </label>
      </div>
      <VisXYContainer data={data} xDomain={[1989, 2024]} width="100%" height="50vh">
        <VisLine
          curveType={CurveType.Linear}
          fallbackValue={fallbackValue()}
          interpolateMissingData={interpolation()}
          x={xCallback}
          y={countriesYMemo}
        />
        <VisCrosshair
          color={['var(--vis-color0)', 'var(--vis-color1)']}
          template={(d) => `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`}
        />
        <VisTooltip />
        {showScatter() && (
          <For each={countries}>
            {(country, i) => {
              const colorIndex = i()
              const countryColor = country.color || `var(--vis-color${colorIndex})`

              return (
                <VisScatter
                  size={5}
                  x={xCallback}
                  color={countryColor}
                  y={(d) => d && country.id in d ? d[country.id] : null}
                />
              )
            }}
          </For>
        )}
        <VisAxis type="x" numTicks={10} />
        <VisAxis
          type="y"
          label="Electric power consumption (kWh per capita)"
          tickFormat={(d) => `${d}${d ? 'kWh' : ''}`}
          tickValues={[100, 1000, 2000, 3000, 4000]}
        />
      </VisXYContainer>

      <style>{`
        .controls-container {
          background-color: var(--ifm-code-background);
          padding: 10px 20px;
          border-radius: 5px;
          border: 1px solid var(--ifm-code-background);
          margin-bottom: 10px;
          display: flex;
          width: 100%;
          gap: 30px;
        }
      `}</style>
    </div>
  )
}

export default PatchyLineChart
