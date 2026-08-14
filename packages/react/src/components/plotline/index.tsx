// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Plotline } from '@unovis/ts/components/plotline'
import { PlotlineConfigInterface } from '@unovis/ts/components/plotline/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisPlotlineRef<Datum> = {
  component?: Plotline<Datum>;
}

export type VisPlotlineProps<Datum> = PlotlineConfigInterface<Datum> & {
  ref?: Ref<VisPlotlineRef<Datum>>;
}

export const VisPlotlineSelectors = Plotline.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisPlotlineFC<Datum> (props: VisPlotlineProps<Datum>, fRef: ForwardedRef<VisPlotlineRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Plotline<Datum>>>(null)
  const componentRef = useRef<Plotline<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Plotline<Datum>>)

    const c = new Plotline<Datum>(props)
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

    component?.setConfig(props)
  })

  // A config change has to drive the render itself: the container re-renders only when its own props
  // change, which doesn't happen when new config reaches this component through React context or a
  // parent's state. See `useContainerRenderOnUpdate` for how updates are detected.
  useContainerRenderOnUpdate()

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisPlotline: (<Datum>(props: VisPlotlineProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisPlotlineFC), arePropsEqual)
