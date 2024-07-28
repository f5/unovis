import { SingleContainer } from '@unovis/ts'
import type {
  Annotations,
  Tooltip,
  SingleContainerConfigInterface,
  ComponentCore,
} from '@unovis/ts'
import type { JSX, ParentProps } from 'solid-js'
import { createEffect, createSignal, on, onCleanup, splitProps } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import type { VisContainerContextProps } from '../../utils/context'
import { VisContainerContext } from '../../utils/context'
import { createTrigger } from '../../utils/trigger'

type VisSingleContainerProps<Datum> = ParentProps<
  SingleContainerConfigInterface<Datum> & {
    data?: Datum
    class?: string
    style?: JSX.CSSProperties
  }
>

export function VisSingleContainer<Datum>(
  props: VisSingleContainerProps<Datum>
) {
  const [divProps, other, rest] = splitProps(
    props,
    ['children', 'class', 'style'],
    ['data']
  )
  const [ref, setRef] = createSignal<HTMLDivElement>()
  const [chart, setChart] = createSignal<SingleContainer<Datum>>()
  const [config, setConfig] = createStore<
    SingleContainerConfigInterface<Datum>
  >({
    component: undefined,
    annotations: undefined,
    tooltip: undefined,
  })
  const [track, dirty] = createTrigger()

  const init = () => {
    const c = chart()
    const r = ref()

    if (c) return
    if (r && config.component)
      setChart(new SingleContainer(r, config, other.data))
  }

  onCleanup(() => chart()?.destroy())

  createEffect(
    on(
      () => other.data,
      (data) => {
        if (data) chart()?.setData(data)
      }
    )
  )

  createEffect(() => {
    init()
    // track the changes
    track()
    chart()?.updateContainer({...config, ...rest})
  })

  const update: VisContainerContextProps['update'] = (key, value) => {
    setConfig(
      produce((c) => {
        switch (key) {
          case 'component':
            c.component = value() as ComponentCore<Datum>
            break
          case 'annotations':
            c.annotations = value() as Annotations
            break
          case 'tooltip':
            c.tooltip = value() as Tooltip
        }
      })
    )
  }

  const destroy: VisContainerContextProps['destroy'] = (key) => {
    setConfig(
      produce((c) => {
        switch (key) {
          case 'component':
            c.component = undefined
            break
          case 'annotations':
            c.annotations = undefined
            break
          case 'tooltip':
            c.tooltip = undefined
        }
      })
    )
  }

  return (
    <VisContainerContext.Provider value={{ update, destroy, dirty }}>
      <div
        data-vis-singe-container
        ref={setRef}
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
        }}
        {...divProps}
      />
    </VisContainerContext.Provider>
  )
}
