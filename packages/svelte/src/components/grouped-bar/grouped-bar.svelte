<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { GroupedBar, GroupedBarConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  // config
  let prevConfig: GroupedBarConfigInterface<Datum>
  let config: GroupedBarConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  const component = new GroupedBar<Datum>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): GroupedBar<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

