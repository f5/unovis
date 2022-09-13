/* eslint-disable @typescript-eslint/naming-convention */
import React, { ReactNode, useEffect, useRef, useState, PropsWithChildren } from 'react'
import { XYContainer, XYContainerConfigInterface, XYComponentCore, Tooltip, Crosshair, Axis, AxisType } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYContainerProps<Datum> = XYContainerConfigInterface<Datum> & {
  data?: Datum[];
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisXYContainerFC<Datum> (props: PropsWithChildren<VisXYContainerProps<Datum>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<XYContainer<Datum>>()
  const [data, setData] = useState<Datum[] | undefined>(undefined)

  const getConfig = (): XYContainerConfigInterface<Datum> => ({
    components: Array
      .from(container.current?.querySelectorAll<VisComponentElement<XYComponentCore<Datum>>>('vis-component') ?? [])
      .map(c => c.__component__),
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
    crosshair: container.current?.querySelector<VisComponentElement<Crosshair<Datum>>>('vis-crosshair')?.__component__,
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
    setData(props.data)
    const c = new XYContainer<Datum>(container.current as HTMLDivElement, getConfig(), props.data)
    setChart(c)

    return () => c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    if (props.data && (props.data !== data)) {
      chart?.setData(props.data, preventRender)
      setData(props.data)
    }
    // Update Container and render
    chart?.updateContainer(getConfig())
  })

  return (
    <div ref={container} className={props.className}>
      {props.children}
    </div>
  )
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisXYContainer: (<Datum>(props: PropsWithChildren<VisXYContainerProps<Datum>>) => JSX.Element | null) =
  React.memo(VisXYContainerFC, arePropsEqual)
