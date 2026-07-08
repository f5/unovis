<script lang="ts">
  import { VisXYContainer, VisLine, VisAxis } from '@unovis/svelte'

  import { generateData, DEFAULT_NUM_POINTS, DEFAULT_LINE_WIDTH, THICK_LINE_WIDTH } from './data'

  // Reactivity smoke test: the data and lineWidth props live on the <VisLine> child
  // (not the container), so clicking the controls exercises child-level data and
  // config updates — the path that must trigger a chart re-render.
  let numPoints = DEFAULT_NUM_POINTS
  let seed = 0
  let lineWidth = DEFAULT_LINE_WIDTH
  $: data = generateData(numPoints, seed)

  function reset () {
    numPoints = DEFAULT_NUM_POINTS
    seed = 0
    lineWidth = DEFAULT_LINE_WIDTH
  }
</script>

<div>
  <div class="controls">
    <button on:click={() => numPoints++}>Add point ({numPoints})</button>
    <button on:click={() => seed++}>Shuffle</button>
    <button on:click={() => (lineWidth = lineWidth === DEFAULT_LINE_WIDTH ? THICK_LINE_WIDTH : DEFAULT_LINE_WIDTH)}>Toggle width</button>
    <button on:click={() => (numPoints = 0)}>Clear</button>
    <button on:click={reset}>Reset</button>
  </div>
  <VisXYContainer height={200} duration={0}>
    <VisLine {data} x={d => d.x} y={d => d.y} {lineWidth}/>
    <VisAxis type="x"/>
    <VisAxis type="y"/>
  </VisXYContainer>
</div>
