<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Line, LineConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'

  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  // config
  let prevConfig: LineConfigInterface<Datum>
  let config: LineConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: Line<Datum>
  const { setComponent, removeComponent } = getContext('container')

  onMount(() => {
    component = new Line<Datum>(config)
    setComponent(component)
    return () => { removeComponent(component) as void }
  })

  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Line<Datum> { return component }

</script>

<vis-component/>

