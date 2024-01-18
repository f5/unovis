// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { XYLabels, XYLabelsConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYLabelsRef<Datum> = {
  component?: XYLabels<Datum>;
}

export type VisXYLabelsProps<Datum> = XYLabelsConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisXYLabelsRef<Datum>>;
}

export const VisXYLabelsSelectors = XYLabels.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisXYLabelsFC<Datum> (props: VisXYLabelsProps<Datum>, fRef: ForwardedRef<VisXYLabelsRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<XYLabels<Datum>>>(null)
  const componentRef = useRef<XYLabels<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<XYLabels<Datum>>)

    const c = new XYLabels<Datum>(props)
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
export const VisXYLabels: (<Datum>(props: VisXYLabelsProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisXYLabelsFC), arePropsEqual)
