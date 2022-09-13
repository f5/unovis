<script lang='ts'>
  import { Orientation, Scale, TopoJSONMap } from '@unovis/ts'
  import { WorldMapTopoJSON } from '@unovis/ts/maps'
  import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisAxis, VisXYContainer, VisStackedBar } from '@unovis/svelte'
  import { palette, data, ageRange, yearRange, AreaDatum } from './data'

  const mapData = { areas: data }
  const range = yearRange[1] - yearRange[0]

  // scale functions
  const yearScale = Scale.scaleLinear()
    .domain(yearRange)
    .rangeRound([0, range])

  const colorScale = Scale.scaleSequential(palette).domain(ageRange)

  let year = 2019

  // accessor functions
  const color = (_, i: number) => colorScale(i)
  $: getExpectancy = (d: AreaDatum) => d.age[yearScale(year)]
  $: getAreaColor = (d: AreaDatum) => colorScale(getExpectancy(d))

  const tooltipTriggers = {
    [TopoJSONMap.selectors.feature]: d => `${d.properties.name}: ${d.data ? getExpectancy(d.data) : 'no data'}`
  }

  const gradientSteps = Array(100).fill(1)
</script>

<div class="topojson-map">
  <!-- year slider -->
  <header class='year-slider'>
    <h2>Life expectancy by Country, <em>{year}</em></h2>
    <input type="range" bind:value={year} min={yearRange[0]} max={yearRange[1]}/>
  </header>
  <!-- topojson map -->
  <VisSingleContainer data={mapData} height={550} duration={0}>
    <VisTopoJSONMap topojson={WorldMapTopoJSON} areaColor={getAreaColor} disableZoom/>
    <VisTooltip triggers={tooltipTriggers}/>
  </VisSingleContainer>
  <!-- gradient legend-->
  <VisXYContainer data={[0]} height={70} width={500}>
    <VisStackedBar x={0.5} y={gradientSteps} {color} orientation={Orientation.Horizontal}/>
    <VisAxis type="x" position="top" numTicks={range / 5} label='Life Expectancy (years)' tickPadding={0}/>
  </VisXYContainer>
</div>

<style>
  .topojson-map, .year-slider {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.year-slider {
  width: max-content;
  position: relative;
  margin-bottom: 20px;
}

.year-slider h2 {
  font-weight: 500;
}

.year-slider input {
  width: 75%;
}

.year-slider > input::before {
  position: absolute;
  content: attr(min);
  left: 0;
}

.year-slider > input::after {
  position: absolute;
  content: attr(max);
  right: 0;
}
</style>
