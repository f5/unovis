import type { TooltipConfigInterface, TooltipContent, TooltipContentMap } from '@unovis/ts'
import { Tooltip, getTooltipContentTargets } from '@unovis/ts'
import type { Accessor, JSX } from 'solid-js'
import { Show, createMemo, createSignal, onCleanup, createEffect, on, onMount } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useVisContainer } from '../../utils/context'

export type VisTooltipProps<Datum = any> = Omit<TooltipConfigInterface, 'content'> & {
  content?: TooltipContentMap<(context: Accessor<TooltipContent<Datum>>) => JSX.Element>;
}

export const VisTooltipSelectors = Tooltip.selectors

export function VisTooltip<Datum = any> (props: VisTooltipProps<Datum>): JSX.Element {
  const [component, setComponent] = createSignal<Tooltip>()
  const [context, setContext] = createSignal<TooltipContent<Datum> | null>(null)
  const ctx = useVisContainer()
  const renderer = createMemo(() => {
    const target = context()?.trigger
    return target !== undefined ? props.content?.[target] : undefined
  })

  function renderContent (value: TooltipContent | null): void {
    setContext(value as TooltipContent<Datum> | null)
  }

  onMount(() => {
    const { content, ...config } = props
    const tooltip = new Tooltip(config)
    tooltip.setContentRenderer(renderContent, getTooltipContentTargets(content))
    setComponent(tooltip)
    ctx.update('tooltip', component)
  })

  onCleanup(() => {
    component()?.setContentRenderer(undefined)
    component()?.destroy()
    ctx.destroy('tooltip')
  })

  createEffect(on(
    () => ({ tooltip: component(), props: { ...props } }),
    ({ tooltip, props: { content, ...config } }) => {
      if (tooltip) {
        tooltip.setConfig(config)
        tooltip.setContentRenderer(renderContent, getTooltipContentTargets(content))
        ctx.dirty()
      }
    },
  ))

  return <>
    <div data-vis-tooltip />
    <Show when={component()}>{tooltip =>
      <Portal mount={tooltip().contentElement}>
        <Show when={context()}>{value =>
          <Show when={renderer()} keyed>{render => render(value)}</Show>
        }</Show>
      </Portal>
    }</Show>
  </>
}
