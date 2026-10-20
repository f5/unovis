<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { GroupedBar as GroupedBarCore } from '@unovis/ts/components/grouped-bar'
  import type { GroupedBarConfigInterface } from '@unovis/ts/components/grouped-bar/config'
  import type { NumericAccessor } from '@unovis/ts/types/accessor'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let prevConfig: GroupedBarConfigInterface<Datum>
  let config: GroupedBarConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: GroupedBarCore<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new GroupedBarCore<Datum>(config)
    return () => component?.destroy()
  })
  $: if (data !== undefined) { component?.setData(data); dirty?.() }
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): GroupedBarCore<Datum> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

