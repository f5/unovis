// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Heatmap } from '@unovis/ts/components/heatmap'
import { HeatmapConfigInterface } from '@unovis/ts/components/heatmap/config'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisHeatmapRef<Datum> = {
  component?: Heatmap<Datum>;
}

export type VisHeatmapProps<Datum> = HeatmapConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisHeatmapRef<Datum>>;
}

export const VisHeatmapSelectors = Heatmap.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisHeatmapFC<Datum> (props: VisHeatmapProps<Datum>, fRef: ForwardedRef<VisHeatmapRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Heatmap<Datum>>>(null)
  const componentRef = useRef<Heatmap<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Heatmap<Datum>>)

    const c = new Heatmap<Datum>(props)
    componentRef.current = c
    element.__component__ = c

    return () => {
      componentRef.current = undefined
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const component = componentRef.current
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisHeatmap: (<Datum>(props: VisHeatmapProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisHeatmapFC), arePropsEqual)
