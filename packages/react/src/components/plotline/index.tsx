// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Plotline, PlotlineConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisPlotlineRef<Datum> = {
  component?: Plotline<Datum>;
}

export type VisPlotlineProps<Datum> = PlotlineConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisPlotlineRef<Datum>>;
}

export const VisPlotlineSelectors = Plotline.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisPlotlineFC<Datum> (props: VisPlotlineProps<Datum>, fRef: ForwardedRef<VisPlotlineRef<Datum>>): JSX.Element {
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
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisPlotline: (<Datum>(props: VisPlotlineProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisPlotlineFC), arePropsEqual)
