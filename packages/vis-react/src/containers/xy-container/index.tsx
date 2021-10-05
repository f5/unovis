// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/naming-convention */
import { ReactNode, useEffect, useRef, useState } from 'react'
import { XYContainer, XYContainerConfigInterface, XYComponentCore, Tooltip, Crosshair, Axis, AxisType } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYContainerProps<Datum> = XYContainerConfigInterface<Datum> & {
  data?: Datum[];
  children?: ReactNode | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisXYContainer<Datum> (props: VisXYContainerProps<Datum>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<XYContainer<Datum>>()

  const getConfig = (): XYContainerConfigInterface<Datum> => ({
    components: Array
      .from(container.current?.querySelectorAll<VisComponentElement<XYComponentCore<Datum>>>('vis-component') ?? [])
      .map(c => c.__component__),
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
    crosshair: container.current?.querySelector<VisComponentElement<Crosshair<Datum>>>('vis-crosshair')?.__component__,
    xAxis: Array
      .from(container.current?.querySelectorAll<VisComponentElement<Axis<Datum>>>('vis-tooltip') ?? [])
      .map(c => c.__component__)
      .find(c => c.config.type === AxisType.X),
    yAxis: Array
      .from(container.current?.querySelectorAll<VisComponentElement<Axis<Datum>>>('vis-tooltip') ?? [])
      .map(c => c.__component__)
      .find(c => c.config.type === AxisType.Y),
    ...props,
  })

  // On Mount
  useEffect(() => {
    setChart(
      new XYContainer<Datum>(container.current as HTMLDivElement, getConfig(), props.data ?? [])
    )

    return () => chart?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    chart?.setData(props.data ?? [], preventRender)

    // Update Container and render
    chart?.updateContainer(getConfig())
  })

  return (
    <div ref={container} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {props.children}
    </div>
  )
}
