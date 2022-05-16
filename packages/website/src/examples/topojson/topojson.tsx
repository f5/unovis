import React, { useCallback } from 'react'
import { Orientation, Scale, TopoJSONMap, WorldMapTopoJSON } from '@volterra/vis'
import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisAxis, VisXYContainer, VisStackedBar } from '@volterra/vis-react'
import { data, ageRange, yearRange, AreaDatum } from './data'

export function YearSlider ({ current, range, onUpdate }): JSX.Element {
  return (
    <header>
      <h2>Life expectancy by Country, <em>{current}</em></h2>
      <input type="range" value={current} min={range[0]} max={range[1]} onChange={e => onUpdate(Number(e.target.value))}/>
    </header>
  )
}

export function GradientLegend ({ colors, range, title }): JSX.Element {
  return (
    <VisXYContainer data={[{}]} height={70} width={500} xDomain={range}>
      <VisStackedBar
        orientation={Orientation.Horizontal}
        x={0.5}
        y={Array(100).fill(1)}
        color={useCallback((_, i: number) => colors(i), [])}/>
      <VisAxis type="x" position="top" numTicks={(range[1] - range[0]) / 5} label={title} tickPadding={0}/>
    </VisXYContainer>
  )
}

export default function Topojson (): JSX.Element {
  const mapData = { areas: data }

  // current year being viewed
  const [year, setYear] = React.useState(2019)

  // scale functions
  const colorScale = Scale.scaleSequential(['#ffe991', '#006e8d']).domain(ageRange)
  const yearScale = Scale.scaleLinear()
    .domain(yearRange)
    .rangeRound([0, yearRange[1] - yearRange[0]])

  // accessor functions
  const getExpectancy = useCallback((d: AreaDatum) => d.age[yearScale(year)], [year])
  const getAreaColor = useCallback((d: AreaDatum) => colorScale(getExpectancy(d)), [getExpectancy])

  const tooltipTriggers = {
    [TopoJSONMap.selectors.feature]: d =>
      `${d.properties.name}: ${d.data ? getExpectancy(d.data) : 'no data'}`
    ,
  }

  return (
    <div id="vis-container">
      <YearSlider current={year} range={yearRange} onUpdate={setYear}/>
      <VisSingleContainer data={mapData} height={550}>
        <VisTopoJSONMap topojson={WorldMapTopoJSON} areaColor={getAreaColor} disableZoom/>
        <VisTooltip triggers={tooltipTriggers}/>
      </VisSingleContainer>
      <GradientLegend title="Life expectancy (years)" colors={colorScale} range={ageRange}/>
    </div>
  )
}
