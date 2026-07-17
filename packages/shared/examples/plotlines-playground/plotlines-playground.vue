<script setup lang="ts">
import { ref } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/vue'
import { LabelOverflow } from '@unovis/ts'
import { data } from './data'

const yValue = ref(6)
const yAutoPosition = ref(true)
const yOverflow = ref<LabelOverflow>(LabelOverflow.Smart)

const xValue = ref(10)
const xAutoPosition = ref(true)
const xOverflow = ref<LabelOverflow>(LabelOverflow.Smart)
</script>

<template>
  <div>
    <div class="controls">
      <fieldset>
        <legend>Plot line on y-axis (extra)</legend>
        <label>value: <input type="range" min="4" max="8" step="0.1" v-model.number="yValue" /> {{ yValue.toFixed(1) }}</label>
        <label><input type="checkbox" v-model="yAutoPosition" /> labelAutoPosition</label>
        <label :style="{ opacity: yAutoPosition ? 1 : 0.4 }">labelOverflow:
          <select v-model="yOverflow" :disabled="!yAutoPosition">
            <option :value="LabelOverflow.Smart">smart</option>
            <option :value="LabelOverflow.Hide">hide</option>
            <option :value="LabelOverflow.Stack">stack</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Plot line on x-axis (extra)</legend>
        <label>value: <input type="range" min="8" max="12" step="0.1" v-model.number="xValue" /> {{ xValue.toFixed(1) }}</label>
        <label><input type="checkbox" v-model="xAutoPosition" /> labelAutoPosition</label>
        <label :style="{ opacity: xAutoPosition ? 1 : 0.4 }">labelOverflow:
          <select v-model="xOverflow" :disabled="!xAutoPosition">
            <option :value="LabelOverflow.Smart">smart</option>
            <option :value="LabelOverflow.Hide">hide</option>
            <option :value="LabelOverflow.Stack">stack</option>
          </select>
        </label>
      </fieldset>
    </div>

    <VisXYContainer :height="600">
      <VisLine :data :x="d => d.x" :y="d => d.y" />
      <VisAxis type="x" />
      <VisAxis type="y" />
      <VisPlotline :value="6" color="rgba(7, 114, 21, 1)" labelText="Plot line on y-axis" labelPosition="top-left" />
      <VisPlotline :value="10" color="rgba(220, 114, 0, 1)" axis="x" labelOrientation="vertical" labelText="Plot line on x-axis" />
      <VisPlotline
        :value="yValue"
        color="rgba(7, 114, 21, 1)"
        :labelText="`Extra plot line on y-axis @ ${yValue.toFixed(1)}`"
        labelPosition="top-left"
        :labelAutoPosition="yAutoPosition"
        :labelOverflow="yOverflow"
      />
      <VisPlotline
        :value="xValue"
        color="rgba(220, 114, 0, 1)"
        axis="x"
        labelOrientation="vertical"
        :labelText="`Extra plot line on x-axis @ ${xValue.toFixed(1)}`"
        labelPosition="top-right"
        :labelAutoPosition="xAutoPosition"
        :labelOverflow="xOverflow"
      />
    </VisXYContainer>
  </div>
</template>

<style scoped>
.controls { margin-bottom: 12px; display: flex; gap: 20px; flex-wrap: wrap; }
fieldset { border: 1px solid #444; border-radius: 4px; padding: 8px 12px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
legend { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px; }
</style>
