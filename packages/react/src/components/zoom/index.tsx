// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Zoom } from '@unovis/ts/components/zoom'
import { ZoomConfigInterface } from '@unovis/ts/components/zoom/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisZoomRef<Datum> = {
  component?: Zoom<Datum>;
}

export type VisZoomProps<Datum> = ZoomConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisZoomRef<Datum>>;
}

export const VisZoomSelectors = Zoom.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisZoomFC<Datum> (props: VisZoomProps<Datum>, fRef: ForwardedRef<VisZoomRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Zoom<Datum>>>(null)
  const componentRef = useRef<Zoom<Datum> | undefined>(undefined)
  // Separate the config properties from the props that should not be passed to the component
  const { data, ...config } = props

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Zoom<Datum>>)

    const c = new Zoom<Datum>(config)
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
    if (data !== undefined) component?.setData(data)
    component?.setConfig(config)
  })

  // Ask the container to re-render when this component's config changes (see `useContainerRenderOnUpdate`)
  useContainerRenderOnUpdate()

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-zoom ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisZoom: (<Datum>(props: VisZoomProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisZoomFC), arePropsEqual)
