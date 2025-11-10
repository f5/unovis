// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { RollingPinLegend, RollingPinLegendConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisRollingPinLegendRef = {
  component?: RollingPinLegend;
}

export type VisRollingPinLegendProps = RollingPinLegendConfigInterface & {
  ref?: Ref<VisRollingPinLegendRef>;
  className?: string;
}

export const VisRollingPinLegendSelectors = RollingPinLegend.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisRollingPinLegendFC (props: VisRollingPinLegendProps, fRef: ForwardedRef<VisRollingPinLegendRef>): ReactElement {
  const ref = useRef<VisComponentElement<RollingPinLegend, HTMLDivElement>>(null)
  const componentRef = useRef<RollingPinLegend | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<RollingPinLegend, HTMLDivElement>)

    const c = new RollingPinLegend(ref.current as VisComponentElement<RollingPinLegend, HTMLDivElement>, props)
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
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisRollingPinLegend: ((props: VisRollingPinLegendProps) => JSX.Element | null) = React.memo(React.forwardRef(VisRollingPinLegendFC), arePropsEqual)
