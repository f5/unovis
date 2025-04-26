<template>
  <div>
    <div class="fallbackValueSwitch">
      <label>
        Select a fallback value for missing data points:
        <select @change="e => fallbackValue = fallbacks[Number(e.target.value)]">
          <option v-for="(option, i) in fallbacks" :key="i" :value="i">{{ String(option) }}</option>
        </select>
      </label>
      <label>
        Interpolate:<input type="checkbox" :checked="interpolation" @change="e => interpolation = e.target.checked" />
      </label>
      <label>
        Show Scatter: <input type="checkbox" :checked="showScatter" @change="e => showScatter = e.target.checked" />
      </label>
    </div>
    <div>
      <VisXYContainer :data="data" :xDomain="[1990, 2024]" width="100%">
        <VisLine
          :curveType="CurveType.Linear"
          :fallbackValue="fallbackValue"
          :interpolateMissingData="interpolation"
          :x="xCallback"
          :y="countriesYMemo"
        />
        <VisCrosshair
          :color="['var(--vis-color0)', 'var(--vis-color1)']"
          :template="crosshairTemplate"
        />
        <VisScatter
          v-for="(country, i) in countries"
          v-if="showScatter"
          :key="country.id"
          :size="5"
          :x="xCallback"
          :color="country.color || `var(--vis-color${i})`"
          :y="d => d[country.id]"
        />
        <VisTooltip />
        <VisAxis type="x" :numTicks="20" />
        <VisAxis
          type="y"
          label="Electric power consumption (kWh per capita)"
          :tickFormat="yAxisTickFormat"
          :tickValues="[100, 1000, 2000, 3000, 4000]"
        />
      </VisXYContainer>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisScatter, VisTooltip } from '@unovis/vue'
import { CurveType } from '@unovis/ts'
import { countries, data } from './data'

export default defineComponent({
  name: 'BasicPatchyLineChart',
  components: {
    VisXYContainer,
    VisLine,
    VisAxis,
    VisCrosshair,
    VisScatter,
    VisTooltip
  },
  setup() {
    const fallbacks = [null, undefined, 0, 2000]
    const fallbackValue = ref(fallbacks[0])
    const interpolation = ref(true)
    const showScatter = ref(true)

    const xCallback = (d) => d.year
    
    const getY = (c) => (d) => d[c.id]
    const countriesYMemo = computed(() => countries.map(getY))

    const crosshairTemplate = (d) => 
      `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`

    const yAxisTickFormat = (d) => `${d}${d ? 'kWh' : ''}`

    return {
      fallbacks,
      fallbackValue,
      interpolation,
      showScatter,
      countries,
      data,
      xCallback,
      countriesYMemo,
      CurveType,
      crosshairTemplate,
      yAxisTickFormat
    }
  }
})
</script>

<style>
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
</style>
