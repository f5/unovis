// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Plotband } from '@unovis/ts/components/plotband'
import { PlotbandConfigInterface } from '@unovis/ts/components/plotband/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisPlotbandRef<Datum> = {
  component?: Plotband<Datum>;
}

export type VisPlotbandProps<Datum> = PlotbandConfigInterface<Datum> & {
  ref?: Ref<VisPlotbandRef<Datum>>;
}

export const VisPlotbandSelectors = Plotband.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisPlotbandFC<Datum> (props: VisPlotbandProps<Datum>, fRef: ForwardedRef<VisPlotbandRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Plotband<Datum>>>(null)
  const componentRef = useRef<Plotband<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Plotband<Datum>>)

    const c = new Plotband<Datum>(props)
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
export const VisPlotband: (<Datum>(props: VisPlotbandProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisPlotbandFC), arePropsEqual)
