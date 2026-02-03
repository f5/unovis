// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Plotband, PlotbandConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from '@/utils/react'

// Types
import { VisComponentElement } from '@/types/dom'

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

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisPlotband: (<Datum>(props: VisPlotbandProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisPlotbandFC), arePropsEqual)
