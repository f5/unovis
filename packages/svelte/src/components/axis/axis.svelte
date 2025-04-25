<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis, AxisConfigInterface } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'
  
  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic
  
  // data and required props
  // eslint-disable-next-line no-undef-init
export let data: Datum[] = undefined

  // config
  let prevConfig: AxisConfigInterface<Datum>
  let config: AxisConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Axis<Datum>
  const lifecycle = getContext<Lifecycle>('axis')

  onMount(() => {
    component = new Axis<Datum>(config)
    return () => component?.destroy()
    })
  $: component?.setData(data)
  $: if(!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Axis<Datum> { return component }

</script>

<vis-axis use:lifecycle={component}/>

