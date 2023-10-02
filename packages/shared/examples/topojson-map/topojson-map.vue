<script setup lang="ts">
import { Orientation, Scale, TopoJSONMap } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisAxis, VisXYContainer, VisStackedBar } from '@unovis/vue'
import { palette, data, ageRange, yearRange, AreaDatum } from './data'
import { ref, watch, computed } from "vue"

const mapData = { areas: data }
const range = yearRange[1] - yearRange[0]

// scale functions
const yearScale = Scale.scaleLinear()
  .domain(yearRange)
  .rangeRound([0, range])

const colorScale = Scale.scaleSequential(palette).domain(ageRange)

const year = ref(2019)

// accessor functions
const color = (_, i: number) => colorScale(i)
const getExpectancy = (d: AreaDatum) => d.age[yearScale(Number(year.value))]
const areaColor = (y: number) => (d: AreaDatum) => colorScale(d.age[yearScale(y)])

const tooltipTriggers = {
  [TopoJSONMap.selectors.feature]: d => `${d.properties.name}: ${d.data ? getExpectancy(d.data) : 'no data'}`,
}

const gradientSteps = Array(range).fill(1)
</script>

<template>
  <div class="topojson-map">
    <!-- year slider -->
    <header class='year-slider'>
      <h2>Life expectancy by Country, <em>{{ year }}</em></h2>
      <input type="range" v-model="year" :min="yearRange[0]" :max="yearRange[1]" />
    </header>
    <!-- topojson map -->
    <VisSingleContainer :data="mapData" :height="550" :duration="0">
      <VisTopoJSONMap :topojson="WorldMapTopoJSON" :areaColor="areaColor(Number(year))" disableZoom />
      <VisTooltip :triggers="tooltipTriggers" />
    </VisSingleContainer>
    <!-- gradient legend-->
    <VisXYContainer :data="[{}]" :height="70" :width="500">
      <VisStackedBar :x="0" :y="gradientSteps" :color="color" :orientation="Orientation.Horizontal" />
      <VisAxis type="x" position="top" :numTicks="range / 5" label='Life Expectancy (years)' />
    </VisXYContainer>
  </div>
</template>

<style>
.topojson-map,
.year-slider {
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

.year-slider>input::before {
  position: absolute;
  content: attr(min);
  left: 0;
}

.year-slider>input::after {
  position: absolute;
  content: attr(max);
  right: 0;
}
</style>
