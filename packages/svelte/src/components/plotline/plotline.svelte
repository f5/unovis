<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Plotline, PlotlineConfigInterface, NumericAccessor } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'
  
  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic
  
  // data and required props
  // eslint-disable-next-line no-undef-init
export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  // config
  let prevConfig: PlotlineConfigInterface<Datum>
  let config: PlotlineConfigInterface<Datum>
  $: config = { x,  y, ...$$restProps }

  // component declaration
  let component: Plotline<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Plotline<Datum>(config)
    return () => component?.destroy()
    })
  $: component?.setData(data)
  $: if(!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Plotline<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

