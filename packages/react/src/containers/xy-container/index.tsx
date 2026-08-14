/* eslint-disable @typescript-eslint/naming-convention */
import React, { ReactNode, useEffect, useMemo, useRef, useState, PropsWithChildren } from 'react'
import { XYContainer } from '@unovis/ts/containers/xy-container'
import { XYContainerConfigInterface } from '@unovis/ts/containers/xy-container/config'
import { XYComponentCore } from '@unovis/ts/core/xy-component'
import { Tooltip } from '@unovis/ts/components/tooltip'
import { Crosshair } from '@unovis/ts/components/crosshair'
import { Axis } from '@unovis/ts/components/axis'
import { AxisType } from '@unovis/ts/components/axis/types'
import { Annotations } from '@unovis/ts/components/annotations'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { VisContainerContext, VisContainerContextValue } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYContainerProps<Datum> = XYContainerConfigInterface<Datum> & {
  data?: Datum[];
  className?: string;
  style?: React.CSSProperties | Record<`--${string}`, string | number>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisXYContainerFC<Datum> (props: PropsWithChildren<VisXYContainerProps<Datum>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const prevPropsRef = useRef<PropsWithChildren<VisXYContainerProps<Datum>>>({})
  const chartRef = useRef<XYContainer<Datum> | undefined>(undefined)
  const dataRef = useRef<Datum[] | undefined>(undefined)
  const animationFrameRef = useRef<number | null>(null)
  const renderRequestFrameRef = useRef<number | null>(null)

  // Children ask for a re-render when their own config changes. We coalesce the requests into a single
  // frame, and skip them when this container's props changed too, because the `updateContainer` call
  // scheduled below renders on its own.
  const containerContext = useMemo<VisContainerContextValue>(() => ({
    requestRender: () => {
      if (renderRequestFrameRef.current !== null) return
      renderRequestFrameRef.current = requestAnimationFrame(() => {
        renderRequestFrameRef.current = null
        if (animationFrameRef.current !== null) return
        chartRef.current?.render()
      })
    },
  }), [])

  const getConfig = (): XYContainerConfigInterface<Datum> => ({
    components: Array
      .from(container.current?.querySelectorAll<VisComponentElement<XYComponentCore<Datum>>>('vis-component') ?? [])
      .map(c => c.__component__)
      .filter(Boolean) as XYComponentCore<Datum>[],
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
    crosshair: container.current?.querySelector<VisComponentElement<Crosshair<Datum>>>('vis-crosshair')?.__component__,
    annotations: container.current?.querySelector<VisComponentElement<Annotations>>('vis-annotations')?.__component__,
    xAxis: Array
      .from(container.current?.querySelectorAll<VisComponentElement<Axis<Datum>>>('vis-axis') ?? [])
      .map(c => c.__component__)
      .find(c => c.config.type === AxisType.X),
    yAxis: Array
      .from(container.current?.querySelectorAll<VisComponentElement<Axis<Datum>>>('vis-axis') ?? [])
      .map(c => c.__component__)
      .find(c => c.config.type === AxisType.Y),
    margin: { top: 5, left: 5, right: 5, bottom: 5 },
    ...props,
  })

  // On Mount
  useEffect(() => {
    const c = new XYContainer<Datum>(container.current as HTMLDivElement, getConfig(), props.data)
    chartRef.current = c
    prevPropsRef.current = props
    dataRef.current = props.data

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
        prevPropsRef.current = {}
      }
      if (renderRequestFrameRef.current !== null) {
        cancelAnimationFrame(renderRequestFrameRef.current)
        renderRequestFrameRef.current = null
      }
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    if (props.data && (props.data !== dataRef.current)) {
      chartRef.current?.setData(props.data, preventRender)
      dataRef.current = props.data
    }

    // Update and render
    // ! Experimental: we use `requestAnimationFrame` to make the wrapper compatible with React 18 Strict Mode.
    // React 18 in Strict Mode renders components twice. At the same time, this container will get updated only after
    // the first render of its children (VisLine, VisArea, ...) meaning that their wrong instances (the ones
    // that will be destroyed soon) are stored in the `__component__` property of their elements at that moment.
    // So we delay the container update with `requestAnimationFrame` to wait till the new instances of children
    // components are available at `__component__`.
    if (!arePropsEqual(prevPropsRef.current, props)) { // Checking whether the props have changed do avoid multiple renders
      prevPropsRef.current = props
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = null
        chartRef.current?.updateContainer(getConfig())
      })
    }
  })

  return (
    <div ref={container} className={props.className} style={props.style}>
      <VisContainerContext.Provider value={containerContext}>
        {props.children}
      </VisContainerContext.Provider>
    </div>
  )
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisXYContainer: (<Datum>(props: PropsWithChildren<VisXYContainerProps<Datum>>) => JSX.Element | null) =
  React.memo(VisXYContainerFC, arePropsEqual)
