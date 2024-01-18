// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Donut, DonutConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisDonutRef<Datum> = {
  component?: Donut<Datum>;
}

export type VisDonutProps<Datum> = DonutConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisDonutRef<Datum>>;
}

export const VisDonutSelectors = Donut.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisDonutFC<Datum> (props: VisDonutProps<Datum>, fRef: ForwardedRef<VisDonutRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Donut<Datum>>>(null)
  const componentRef = useRef<Donut<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Donut<Datum>>)

    const c = new Donut<Datum>(props)
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

  useImperativeHandle(fRef, () => ({ component: componentRef.current }), [componentRef.current])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisDonut: (<Datum>(props: VisDonutProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisDonutFC), arePropsEqual)
