// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { FlowLegend, FlowLegendConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisFlowLegendRef = {
  component?: FlowLegend;
}

export type VisFlowLegendProps = FlowLegendConfigInterface & {
  ref?: Ref<VisFlowLegendRef>;
  className?: string;
}

export const VisFlowLegendSelectors = FlowLegend.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisFlowLegendFC (props: VisFlowLegendProps, fRef: ForwardedRef<VisFlowLegendRef>): ReactElement {
  const ref = useRef<VisComponentElement<FlowLegend, HTMLDivElement>>(null)
  const componentRef = useRef<FlowLegend | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<FlowLegend, HTMLDivElement>)

    const c = new FlowLegend(ref.current as VisComponentElement<FlowLegend, HTMLDivElement>, { ...props, renderIntoProvidedDomNode: true })
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
export const VisFlowLegend: ((props: VisFlowLegendProps) => JSX.Element | null) = React.memo(React.forwardRef(VisFlowLegendFC), arePropsEqual)
