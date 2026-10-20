# Unovis framework bindings

[Fundamentals](fundamentals.md) · [API reference](api/index.md) · [Discovery index](../llms.txt)

The same core configuration drives each integration, but data binding, lifecycle, and composition syntax differ. These complete minimal line-chart examples use numeric X/Y records and a 320px chart height. Import shared enums and types from `@unovis/ts`; import declarative components from the matching wrapper package.

## React

Install `@unovis/ts @unovis/react`. Pass data and configuration as props and compose components inside a container. Use stable callbacks when appropriate; update props rather than recreating the chart manually.

```tsx
import React from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

type Row = { x: number; y: number }
const x = (d: Row): number => d.x
const y = (d: Row): number => d.y

export function Chart ({ data }: { data: Row[] }): React.ReactElement {
  return (
    <VisXYContainer data={data} height={320} duration={600}>
      <VisLine<Row> x={x} y={y} />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  )
}
```

## Angular

Install `@unovis/ts @unovis/angular`. Import the visualization modules into the Angular module (or the appropriate standalone-component imports). Use `vis-` element names and Angular property bindings for functions, data, and numbers. This example uses an NgModule.

```ts
import { Component, NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule } from '@unovis/angular'

type Row = { x: number; y: number }

@Component({
  selector: 'app-chart',
  standalone: false,
  template: `
    <vis-xy-container [data]="data" [height]="320" [duration]="600">
      <vis-line [x]="x" [y]="y"></vis-line>
      <vis-axis type="x"></vis-axis>
      <vis-axis type="y"></vis-axis>
    </vis-xy-container>
  `,
})
export class ChartComponent {
  data: Row[] = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]
  x = (d: Row): number => d.x
  y = (d: Row): number => d.y
}

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule],
  declarations: [ChartComponent],
  exports: [ChartComponent],
})
export class ChartModule {}
```

## Svelte

Install `@unovis/ts @unovis/svelte`. Use Svelte components, reactive data, and function-valued props. This uses legacy component syntax, also supported by Svelte 5.

```svelte
<script lang="ts">
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte'

  type Row = { x: number; y: number }
  export let data: Row[] = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]
  const x = (d: Row): number => d.x
  const y = (d: Row): number => d.y
</script>

<VisXYContainer {data} height={320} duration={600}>
  <VisLine {x} {y} />
  <VisAxis type="x" />
  <VisAxis type="y" />
</VisXYContainer>
```

## Vue

Install `@unovis/ts @unovis/vue`. Use refs/reactive state and `:` bindings for accessors, data, numbers, and arrays. Templates unwrap refs. Keep the component mounted during data changes.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'

type Row = { x: number; y: number }
const data = ref<Row[]>([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }])
const x = (d: Row): number => d.x
const y = (d: Row): number => d.y
</script>

<template>
  <VisXYContainer :data="data" :height="320" :duration="600">
    <VisLine :x="x" :y="y" />
    <VisAxis type="x" />
    <VisAxis type="y" />
  </VisXYContainer>
</template>
```

## Solid

Install `@unovis/ts @unovis/solid`. Use Solid signals and pass their current values in JSX. Preserve reactive reads, such as `data()`, rather than taking a nonreactive snapshot.

```tsx
import { createSignal, JSX } from 'solid-js'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/solid'

type Row = { x: number; y: number }
const x = (d: Row): number => d.x
const y = (d: Row): number => d.y

export function Chart (): JSX.Element {
  const [data] = createSignal<Row[]>([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }])
  return (
    <VisXYContainer data={data()} height={320} duration={600}>
      <VisLine x={x} y={y} />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  )
}
```

## Vanilla TypeScript / JavaScript

Install `@unovis/ts`. Core classes have no `Vis` prefix. Instantiate components, pass them to a container, and supply data separately. Call `setData` for updates and `destroy` when removing the chart. JavaScript uses the same API with type annotations removed.

```ts
import { XYContainer, Line, Axis } from '@unovis/ts'

type Row = { x: number; y: number }
const data: Row[] = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }]
const host = document.getElementById('chart')
if (!host) throw new Error('Create a <div id="chart"></div> before mounting')

const chart = new XYContainer<Row>(host, {
  height: 320,
  duration: 600,
  components: [new Line<Row>({ x: d => d.x, y: d => d.y })],
  xAxis: new Axis<Row>({ type: 'x' }),
  yAxis: new Axis<Row>({ type: 'y' }),
}, data)

chart.setData([{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 4 }])
// Call chart.destroy() when the host is unmounted.
```

## Composition differences

Framework wrappers use container children for axes and visualization components. Core TypeScript uses actual instances in container configuration. Do not pass an imperative `new Line()` to a React child, or copy React props verbatim into Angular templates.

Shared container data can feed multiple XY components. To show distinct record arrays in one container, omit its shared data binding and bind the appropriate data to each plot. For a Graph/Sankey, use the documented `{ nodes, links }` shape; for maps and hierarchies, follow the selected component's data contract. See the [generated references](api/index.md) for exact properties and accessor types.
