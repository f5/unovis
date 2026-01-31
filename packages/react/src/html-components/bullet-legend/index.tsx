// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { BulletLegend, BulletLegendConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBulletLegendRef = {
  component?: BulletLegend;
}

export type VisBulletLegendProps = BulletLegendConfigInterface & {
  ref?: Ref<VisBulletLegendRef>;
  className?: string;
}

export const VisBulletLegendSelectors = BulletLegend.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisBulletLegendFC (props: VisBulletLegendProps, fRef: ForwardedRef<VisBulletLegendRef>): ReactElement {
  const ref = useRef<VisComponentElement<BulletLegend, HTMLDivElement>>(null)
  const componentRef = useRef<BulletLegend | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<BulletLegend, HTMLDivElement>)

    const c = new BulletLegend(ref.current as VisComponentElement<BulletLegend, HTMLDivElement>, { ...props, renderIntoProvidedDomNode: true })
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
export const VisBulletLegend: ((props: VisBulletLegendProps) => JSX.Element | null) = React.memo(React.forwardRef(VisBulletLegendFC), arePropsEqual)
