<script lang='ts'>
  import { Area, Donut, Line } from '@volterra/vis'
  /* eslint-disable import-newlines/enforce */
  import {
    VisSingleContainer,
    VisScatter,
    VisAxis,
    VisStackedBar,
    VisXYContainer,
    VisLine,
    VisGroupedBar,
    VisTooltip,
    VisDonut,
    VisArea,
    VisBrush
  // Using ts-ignore because the dev build can't resolve `../src/index` for no clear reason
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  } from '../src/index.ts'
  import Example from './example.svelte'

  type Datum = { x: number, y: number, y2: number, y3: number, value: number }

  const triggers = {
    [Donut.selectors.segment]: (d: Datum) => d.value,
    [Line.selectors.line]: (d: Datum) => [d.x, d.y].join(','),
    [Area.selectors.area]: (d: Datum) => [d.x, d.y].join(',')
  }

  const value = (d: Datum) => d.value
  const x = (d: { x: number, y: number }) => d.x
  const y = (d: Datum) => d.y
  const ys = [
    (d: Datum) => d.y,
    (d: Datum) => d.y2,
    (d: Datum) => d.y3
  ]

  $: dataGen = (_: unknown, i: number): Datum => ({
    x: i,
    y: Math.random() * 10,
    y2: Math.random() * -10,
    y3: -5 + Math.random() * 10,
    value: Math.random()
  })

  const xyComponents = {
    Line: { component: VisLine, props: { lineWidth: 12 } },
    Area: { component: VisArea, props: { } },
    StackedBar: { component: VisStackedBar, props: {} },
    GroupedBar: { component: VisGroupedBar, props: {} },
    Scatter: { component: VisScatter, props: {} }
  }

  const components = {
    Donut: { component: VisDonut, props: { centralLabel: 1, radius: 40 } }
  }

  let xy = 'Line'
  let misc = 'Donut'

  let xDomain = [undefined, undefined]
  function update (selection: [number, number]) {
    xDomain = selection
  }
</script>

<div class='previews'>
  <div class="menu">
    {#each Object.keys(xyComponents) as c}
      <label class:selected={xy === c}><input type='radio' bind:group={xy} value={c}/>{c}</label>
    {/each}
  </div>
  <Example inputs={xyComponents[xy].props} {dataGen} let:componentProps let:containerProps>
    <VisXYContainer {xDomain} {...containerProps} duration={0}>
      <svelte:component this={xyComponents[xy].component} {x} y={xy === 'Scatter' ? y : ys} {...componentProps}/>
      <VisAxis type='x'/>
      <VisAxis type='y'/>
      <VisTooltip {triggers}/>
    </VisXYContainer>
    <VisXYContainer {...containerProps} height={150} duration={0}>
      <svelte:component this={xyComponents[xy].component} {x} y={xy === 'Scatter' ? y : ys} {...componentProps}/>
      <VisBrush onBrush={update}/>
    </VisXYContainer>
  </Example>
  <div class="menu">
    {#each Object.keys(components) as c}
      <label class:selected={misc === c}><input type='radio' bind:group={misc} value={c}>{c}</label>
    {/each}
  </div>
  <Example inputs={components[misc].props} {dataGen} let:componentProps let:containerProps>
    <VisSingleContainer {...containerProps}>
      <svelte:component this={components[misc].component} {value} {...componentProps}/>
    </VisSingleContainer>
  </Example>
</div>

<style>
  :root {
    --color: #103de3;
  }
  .previews {
    display: grid;
    max-height: 75vh;
    grid-template-columns: 1fr 90vw;
  }

  input { appearance: none; }
  label {
    cursor: pointer;
    display: block;
  }
  label.selected, label:hover {
    color: var(--color);
  }

  label.selected::after {
    content: '_';
  }
</style>
