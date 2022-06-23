<script lang='ts'>
  export let inputs: Record<string, number>
  export let dataGen: (_: unknown, n: number) => any

  let data: Record<string, number>[]
  let count = 10
  let height = 300
  const margin = { top: 0, left: 0, bottom: 0, right: 0 }
  let containerData = false

  $: data = Array(count).fill(0).map(dataGen)
  $: containerProps = { height, margin, data: containerData && data }
  $: componentProps = { data: !containerData && data, ...inputs }

</script>

<div>
  <label>data points: {count}<input type='range' bind:value={count}/></label>
  <label>pass data to container <input type='checkbox' bind:value={containerData}/></label>
  <label>height: {height}<input type='range' min={50} max={800} bind:value={height}/></label>
  {#each Object.keys(margin) as k}
    <label>margin.{k}: {margin[k]}<input type='range' bind:value={margin[k]}/></label>
  {/each}
  <fieldset>
    <legend>Component props:</legend>
    {#each Object.keys(inputs) as k}
      <label>{k}: {inputs[k]}<input type='range' bind:value={inputs[k]}/></label>
    {/each}
  </fieldset>

  <div class='item'>
    <slot {containerProps} {componentProps}></slot>
  </div>
</div>

<style>
  .item {
    max-height: 800px;
    height: fit-content;
  }
</style>
