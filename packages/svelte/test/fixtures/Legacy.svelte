<script lang="ts">
  import Chart from './Chart.svelte'
  import { createState, updateState } from './state'

  let state = createState()
  let chart: Chart

  export function update (action: string): void {
    updateState(state, action)
    state = state
  }

  export function components (): Record<string, unknown> {
    return chart.components() as Record<string, unknown>
  }
</script>

<Chart {state} bind:this={chart}/>
