<script lang="ts">
  import Chart from './RunesChart.svelte'
  import { createState, updateState } from './state'

  const model = $state(createState())
  let chart = $state<Chart>()

  export function update (action: string): void {
    updateState(model, action)
  }

  export function components (): Record<string, unknown> {
    return chart.components() as Record<string, unknown>
  }
</script>

<Chart state={model} bind:this={chart}/>
