// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { RollingPinLegend, RollingPinLegendConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

export type VisRollingPinLegendRef = {
  component?: RollingPinLegend;
}

export type VisRollingPinLegendProps = RollingPinLegendConfigInterface & {
  ref?: Ref<VisRollingPinLegendRef>;
  className?: string;
}

export const VisRollingPinLegendSelectors = RollingPinLegend.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisRollingPinLegendFC (props: VisRollingPinLegendProps, fRef: ForwardedRef<VisRollingPinLegendRef>): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<RollingPinLegend>()

  // On Mount
  useEffect(() => {
    const c = new RollingPinLegend(ref.current as HTMLDivElement, props)
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return component } }), [])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisRollingPinLegend: ((props: VisRollingPinLegendProps) => JSX.Element | null) = React.memo(React.forwardRef(VisRollingPinLegendFC), arePropsEqual)
