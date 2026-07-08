<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Donut, DonutConfigInterface, NumericAccessor } from '@unovis/ts'
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
  let prevConfig: DonutConfigInterface<Datum>
  let config: DonutConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  // component declaration
  let component: Donut<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new Donut<Datum>(config)
    return () => component?.destroy()
  })
  $: { component?.setData(data); dirty?.() }
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
    dirty?.()
  }

  // component accessor
  export function getComponent (): Donut<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

