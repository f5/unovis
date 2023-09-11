<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unsafe-return */
  // !!! This code was automatically generated. You should not change it !!!
  import { Annotations, AnnotationsConfigInterface, AnnotationDatum } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic<AnnotationDatum>

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: AnnotationsConfigInterface<Datum>
  let config: AnnotationsConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Annotations<Datum>
  const lifecycle = getContext<Lifecycle>('annotations')

  onMount(() => {
    component = new Annotations<Datum>(config)
    return (): void => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Annotations<Datum> { return component }

</script>

<vis-annotations use:lifecycle={component}/>

