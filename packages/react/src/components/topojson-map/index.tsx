// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { TopoJSONMap } from '@unovis/ts/components/topojson-map'
import { TopoJSONMapConfigInterface } from '@unovis/ts/components/topojson-map/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderRequest } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum> = {
  component?: TopoJSONMap<AreaDatum, PointDatum, LinkDatum>;
}

export type VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> & {
  data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]};
  ref?: Ref<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>;
}

export const VisTopoJSONMapSelectors = TopoJSONMap.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTopoJSONMapFC<AreaDatum, PointDatum, LinkDatum> (props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>, fRef: ForwardedRef<VisTopoJSONMapRef<AreaDatum, PointDatum, LinkDatum>>): ReactElement {
  const ref = useRef<VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>>(null)
  const componentRef = useRef<TopoJSONMap<AreaDatum, PointDatum, LinkDatum> | undefined>(undefined)
  const requestContainerRender = useContainerRenderRequest()
  const prevPropsRef = useRef<VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>)

    const c = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(props)
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
    // A config change has to drive the render itself. The container re-renders only when its own props
    // change, which doesn't happen when the new config reaches this component through React context or
    // a parent's state. Skipped on the first run: the container renders on mount.
    if (prevPropsRef.current !== undefined && !arePropsEqual(prevPropsRef.current, props)) requestContainerRender()
    prevPropsRef.current = props
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisTopoJSONMap: (<AreaDatum, PointDatum, LinkDatum>(props: VisTopoJSONMapProps<AreaDatum, PointDatum, LinkDatum>) => JSX.Element | null) = React.memo(React.forwardRef(VisTopoJSONMapFC), arePropsEqual)
