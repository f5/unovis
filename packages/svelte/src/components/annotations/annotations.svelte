<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Annotations, type AnnotationsConfigInterface, type AnnotationItem } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'


  // data and required props
  // eslint-disable-next-line no-undef-init
  export let items: AnnotationItem[] | undefined

  // config
  let prevConfig: AnnotationsConfigInterface
  let config: AnnotationsConfigInterface
  $: config = { items, ...$$restProps }

  // component declaration
  let component: Annotations
  const lifecycle = getContext<Lifecycle>('annotations')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new Annotations(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
    dirty?.()
  }

  // component accessor
  export function getComponent (): Annotations { return component }

</script>

<vis-annotations use:lifecycle={component}></vis-annotations>

