<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Heatmap, HeatmapConfigInterface, NumericAccessor } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let value: NumericAccessor<Datum>

  // config
  let prevConfig: HeatmapConfigInterface<Datum>
  let config: HeatmapConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  // component declaration
  let component: Heatmap<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Heatmap<Datum>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Heatmap<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

