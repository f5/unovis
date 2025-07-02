import React, { useCallback, useMemo, useState } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisScatter, VisTooltip } from '@unovis/react'
import { CurveType } from '@unovis/ts'
import './styles.css'
import { countries, Country, data, DataRecord } from './data'


export default function BasicPatchyLineChart (): JSX.Element {
  type Datum = Record<string, number>
  const fallbacks = [null, undefined, 0, 2000]
  const [fallbackValue, setFallbackValue] = useState(fallbacks[0])
  const [interpolation, setInterpolation] = useState(true)
  const [showScatter, setShowScatter] = useState(true)

  const getY = useCallback<(c: Country) => ((d: DataRecord) => number)>(
    (c) => (d: DataRecord) => d[c.id],
  []
  )

  const xCallback = useCallback((d: DataRecord) => d.year, [])
  const countriesYMemo = useMemo(() => countries.map(getY), [])

  return (<>
    <div className="controls-container">
      <label>
        Select a fallback value for missing data points:
        <select onChange={e => setFallbackValue(fallbacks[Number(e.target.value)])}>
          {fallbacks.map((o, i) => <option key={i} value={i}>{String(o)}</option>)}
        </select>
      </label>
      <label>
          Interpolate:<input type='checkbox' checked={interpolation} onChange={e => setInterpolation(e.target.checked)}/>
      </label>
      <label>
          Show Scatter: <input type='checkbox' checked={showScatter} onChange={e => setShowScatter(e.target.checked)}/>
      </label>
    </div>
    <div>
      {
        <VisXYContainer<Datum> data={data} xDomain={[1989, 2024]} width='100%' height={'50vh'}>
          <VisLine
            curveType={CurveType.Linear}
            fallbackValue={fallbackValue}
            interpolateMissingData={interpolation}
            x={xCallback}
            y={countriesYMemo}
          />
          <VisCrosshair
            color={['var(--vis-color0)', 'var(--vis-color1)']}
            template={(d: DataRecord) => `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`} // Custom text displayed at the tooltip
          />
          {showScatter && countries.map((country, i) => (
            <VisScatter
              key={country.id}
              size={5}
              x={xCallback}
              color={country.color || `var(--vis-color${i})`}
              y={(d: DataRecord) => d[country.id]}
            />
          ))}
          <VisTooltip/>
          <VisAxis type="x" numTicks={10}/>
          <VisAxis
            type="y"
            label="Electric power consumption (kWh per capita)"
            tickFormat={(d: number) => `${d}${d ? 'kWh' : ''}`}
            tickValues={[100, 1000, 2000, 3000, 4000]}
          />
        </VisXYContainer>
      }
    </div>
  </>)
}
