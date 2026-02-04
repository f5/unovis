// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Line, LineConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from '@/utils/react'

// Types
import { VisComponentElement } from '@/types/dom'

export type VisLineRef<Datum> = {
  component?: Line<Datum>;
}

export type VisLineProps<Datum> = LineConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisLineRef<Datum>>;
}

export const VisLineSelectors = Line.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisLineFC<Datum> (props: VisLineProps<Datum>, fRef: ForwardedRef<VisLineRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Line<Datum>>>(null)
  const componentRef = useRef<Line<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Line<Datum>>)

    const c = new Line<Datum>(props)
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
export const VisLine: (<Datum>(props: VisLineProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLineFC), arePropsEqual)
