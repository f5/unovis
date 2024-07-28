import { Orientation, Scale, TopoJSONMap } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import { createSignal, JSX } from 'solid-js'
import { VisAxis, VisSingleContainer, VisStackedBar, VisTooltip, VisTopoJSONMap, VisXYContainer } from '@unovis/solid'

import './styles.css'

import { palette, data, ageRange, yearRange, AreaDatum } from './data'

const TopojsonMap = (): JSX.Element => {
  const mapData = { areas: data }
  const range = yearRange[1] - yearRange[0]

  // scale functions
  const yearScale = Scale.scaleLinear()
    .domain(yearRange)
    .rangeRound([0, range])

  const colorScale = Scale.scaleSequential(palette).domain(ageRange)

  const [year, setYear] = createSignal(2019)

  // accessor functions
  const color = (_: AreaDatum, i: number) => colorScale(i)
  const getExpectancy = (d: AreaDatum) => d.age[yearScale(year())]
  const getAreaColor = (y: number) => (d: AreaDatum) =>
    colorScale(d.age[yearScale(y)])

  const tooltipTriggers = {
    [TopoJSONMap.selectors.feature]: (d) =>
      `${d.properties.name}: ${d.data ? getExpectancy(d.data) : 'no data'}`,
  }

  const gradientSteps = Array(range).fill(1)

  return (
    <div class="topojson-map">
      {/* Year slider */}
      <header>
        <h2>
          Life expectancy by Country, <em>{year()}</em>
        </h2>
        <input
          type="range"
          value={year()}
          min={yearRange[0]}
          max={yearRange[1]}
          onInput={(e) => setYear(e.currentTarget.valueAsNumber)}
        />
      </header>
      {/* Topojson map */}
      <VisSingleContainer data={mapData} height="50dvh" duration={0}>
        <VisTopoJSONMap
          topojson={WorldMapTopoJSON}
          areaColor={getAreaColor(year())}
          disableZoom
        />
        <VisTooltip triggers={tooltipTriggers} />
      </VisSingleContainer>
      {/* Gradient legend */}
      <VisXYContainer data={[{}]} height={70} width={500}>
        <VisStackedBar
          x={0}
          y={gradientSteps}
          color={color}
          orientation={Orientation.Horizontal}
        />
        <VisAxis
          type="x"
          position="top"
          numTicks={range / 5}
          label="Life Expectancy (years)"
        />
      </VisXYContainer>
    </div>
  )
}

export default TopojsonMap
