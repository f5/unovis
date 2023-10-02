<script setup lang="ts">
import { VisLeafletMap } from '@unovis/vue'
// Data
import { MapPointDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './constants'

const style = `https://api.maptiler.com/maps/streets/style.json?key=${mapKey}`
const pointLatitude = (d: MapPointDataRecord) => d.latitude
const pointLongitude = (d: MapPointDataRecord) => d.longitude
const pointBottomLabel = (d: MapPointDataRecord) => d.id
const pointColor = '#286e47'

</script>

<template>
  <VisLeafletMap height="50vh" :style="style" :data="data" :pointLatitude="pointLatitude" :pointLongitude="pointLongitude"
    :pointBottomLabel="pointBottomLabel" :pointColor="pointColor" :clusterExpandOnClick="false" :attribution="[
      `<a href='https://www.maptiler.com/copyright/' target='_blank'>MapTiler</a>`,
      `<a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>`
    ]" />
</template>
