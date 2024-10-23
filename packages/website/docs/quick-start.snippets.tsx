import React from 'react'
import CodeBlock from '@theme/CodeBlock'
import BrowserOnly from '@docusaurus/BrowserOnly'

export const reactImport = <CodeBlock language="ts">
  {'import { VisXYContainer, VisLine, VisAxis } from \'@unovis/react\''}
</CodeBlock>

export const angularImport = <CodeBlock language="ts">
  {'import { VisXYContainerModule, VisLineModule, VisAxisModule } from \'@unovis/angular\''}
</CodeBlock>

export const svelteImport = <CodeBlock language="ts">
  {'import { VisXYContainer, VisLine, VisAxis } from \'@unovis/svelte\''}
</CodeBlock>

export const vueImport = <CodeBlock language="ts">
  {'import { VisXYContainer, VisLine, VisAxis } from \'@unovis/vue\''}
</CodeBlock>

export const solidImport = <CodeBlock language="ts">
  {'import { VisXYContainer, VisLine, VisAxis } from \'@unovis/solid\''}
</CodeBlock>

export const tsImport = <CodeBlock language="ts">
  {'import { XYContainer, Line, Axis } from \'@unovis/ts\''}
</CodeBlock>

export const reactIndividualImport = <CodeBlock language="ts">
  {`import { VisXYContainer } from '@unovis/react/containers/xy-container'
import { VisLine } from '@unovis/react/components/line'
import { VisAxis } from '@unovis/react/components/axis'`}
</CodeBlock>

export const angularIndividualImport = <CodeBlock language="ts">
  {`import { VisXYContainerModule } from '@unovis/angular/esm2015/containers/xy-container'
import { VisLineModule } from '@unovis/angular/esm2015/components/line'
import { VisAxisModule } from '@unovis/angular/esm2015/components/axis'`}
</CodeBlock>

export const svelteIndividualImport = <CodeBlock language="ts">
  {`import { VisXYContainer } from '@unovis/svelte/containers/xy-container'
import { VisLine } from '@unovis/svelte/components/line'
import { VisAxis } from '@unovis/svelte/components/axis'`}
</CodeBlock>

export const vueIndividualImport = <CodeBlock language="ts">
  {`import { VisXYContainer } from '@unovis/vue/containers/xy-container'
import { VisLine } from '@unovis/vue/components/line'
import { VisAxis } from '@unovis/vue/components/axis'`}
</CodeBlock>

export const solidIndividualImport = <CodeBlock language="ts">
  {`import { VisXYContainer } from '@unovis/solid/containers/xy-container'
import { VisLine } from '@unovis/solid/components/line'
import { VisAxis } from '@unovis/solid/components/axis'`}
</CodeBlock>

export const tsIndividualImport = <CodeBlock language="ts">
  {`import { XYContainer } from '@unovis/ts/containers/xy-container'
import { Line } from '@unovis/ts/components/line'
import { Axis } from '@unovis/ts/components/axis'`}
</CodeBlock>

export const reactLineChartCode = <CodeBlock language="tsx">
  {`import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

type DataRecord = { x: number; y: number }
const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

export function BasicLineChart (): JSX.Element {
  return (
    <VisXYContainer data={data}>
      <VisLine<DataRecord>
        x={useCallback(d => d.x, [])}
        y={useCallback(d => d.y, [])}
      ></VisLine>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
    </VisXYContainer>
  )
}`}
</CodeBlock>

export const angularLineChartCode = <>
  <CodeBlock language="html" title={'basic-line-chart.html'}>
    {`<vis-xy-container>
    <vis-line [data]="data" [x]="x" [y]="y"></vis-line>
    <vis-axis type="x"></vis-axis>
    <vis-axis type="y"></vis-axis>
</vis-xy-container>`}
  </CodeBlock>

  <CodeBlock language="ts" title={'basic-line-chart.component.ts'}>
    {`import { Component } from '@angular/core'

type DataRecord = { x: number; y: number }

@Component({
  selector: 'basic-line-chart',
  templateUrl: './basic-line-chart.component.html'
})
export class BasicLineChartComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data: DataRecord[] = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ]
}`}
  </CodeBlock>

  <CodeBlock language="ts" title={'basic-line-chart.module.ts'}>
    {`import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule } from '@unovis/angular'

import { BasicLineChartComponent } from './basic-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule],
  declarations: [BasicLineChartComponent],
  exports: [BasicLineChartComponent],
})
export class BasicLineChartModule { }`}
  </CodeBlock>
</>

export const svelteLineChartCode = <CodeBlock language="ts">
  {`<script lang="ts">
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte'

  type DataRecord = { x: number, y: number }
  export let data: DataRecord[] = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ]
</script>

<VisXYContainer>
  <VisLine {data} x={d => d.x} y={d => d.y}/>
  <VisAxis type="x"/>
  <VisAxis type="y"/>
</VisXYContainer>`}
</CodeBlock>

export const vueLineChartCode = <CodeBlock language="ts">
  {`<script setup lang="ts">
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
  import { ref } from 'vue'

  type DataRecord = { x: number, y: number }
  const data = ref<DataRecord[]>([
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 1 },
  ])
</script>

<VisXYContainer>
  <VisLine :data="data" :x="d => d.x" :y="d => d.y" />
  <VisAxis type="x" />
  <VisAxis type="y" />
</VisXYContainer>`}
</CodeBlock>

export const solidLineChartCode = <CodeBlock language="tsx">
  {`import { VisXYContainer, VisLine, VisAxis } from '@unovis/solid'

type DataRecord = { x: number; y: number }
const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const BasicLineChart = () => {
  return (
    <VisXYContainer height='50dvh'>
      <VisLine data={data} x={(d) => d.x} y={(d) => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  )
}

export default BasicLineChart`}
</CodeBlock>


export const tsLineChartCode = <CodeBlock language="ts">
  {`import { Axis, Line, XYContainer } from '@unovis/ts'

type DataRecord = { x: number; y: number }

const data: DataRecord[] = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const container = document.getElementById('vis-container')
const chart = new XYContainer(container, {
  components: [line],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)`}
</CodeBlock>


export const BasicLineChartExample = (): JSX.Element => (<BrowserOnly fallback={<div>Loading...</div>}>
  {() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/naming-convention
    const { VisXYContainer, VisLine, VisAxis } = require('@unovis/react')
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 1 },
    ]
    return (
      <VisXYContainer data={data} height={200}>
        <VisLine
          x={d => d.x}
          y={d => d.y}
        ></VisLine>
        <VisAxis type="x"></VisAxis>
        <VisAxis type="y"></VisAxis>
      </VisXYContainer>
    )
  }}
</BrowserOnly>)
