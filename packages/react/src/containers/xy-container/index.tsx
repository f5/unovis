/* eslint-disable @typescript-eslint/naming-convention */
import React, { ReactNode, useEffect, useRef, useState, PropsWithChildren } from 'react'
import { XYContainer, XYContainerConfigInterface, XYComponentCore, Tooltip, Crosshair, Axis, AxisType, Annotations } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYContainerProps<Datum> = XYContainerConfigInterface<Datum> & {
  data?: Datum[];
  className?: string;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisXYContainerFC<Datum> (props: PropsWithChildren<VisXYContainerProps<Datum>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const prevPropsRef = useRef<PropsWithChildren<VisXYContainerProps<Datum>>>({})
  const chartRef = useRef<XYContainer<Datum> | undefined>(undefined)
  const dataRef = useRef<Datum[] | undefined>(undefined)
  const animationFrameRef = useRef<number | null>(null)

  const getConfig = (): XYContainerConfigInterface<Datum> => ({
    components: Array
      .from(container.current?.querySelectorAll<VisComponentElement<XYComponentCore<Datum>>>('vis-component') ?? [])
      .map(c => c.__component__),
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
    crosshair: container.current?.querySelector<VisComponentElement<Crosshair<Datum>>>('vis-crosshair')?.__component__,
    annotations: container.current?.querySelector<VisComponentElement<Annotations<any>>>('vis-annotations')?.__component__,
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
        chartRef.current?.updateContainer(getConfig())
      })
    }
  })

  return (
    <div ref={container} className={props.className} style={props.style}>
      {props.children}
    </div>
  )
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisXYContainer: (<Datum>(props: PropsWithChildren<VisXYContainerProps<Datum>>) => JSX.Element | null) =
  React.memo(VisXYContainerFC, arePropsEqual)
