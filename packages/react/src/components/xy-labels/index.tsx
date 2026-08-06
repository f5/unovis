// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { XYLabels } from '@unovis/ts/components/xy-labels'
import { XYLabelsConfigInterface } from '@unovis/ts/components/xy-labels/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderRequest } from 'src/utils/container'

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
function VisXYLabelsFC<Datum> (props: VisXYLabelsProps<Datum>, fRef: ForwardedRef<VisXYLabelsRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<XYLabels<Datum>>>(null)
  const componentRef = useRef<XYLabels<Datum> | undefined>(undefined)
  const requestContainerRender = useContainerRenderRequest()
  const prevPropsRef = useRef<VisXYLabelsProps<Datum> | undefined>(undefined)

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
export const VisXYLabels: (<Datum>(props: VisXYLabelsProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisXYLabelsFC), arePropsEqual)
