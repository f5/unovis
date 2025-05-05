// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { BulletLegend, BulletLegendConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

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
  const ref = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<BulletLegend>()

  // On Mount
  useEffect(() => {
    const c = new BulletLegend(ref.current as HTMLDivElement, { ...props, renderIntoProvidedDomNode: true })
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.update(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return component } }), [component])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisBulletLegend: ((props: VisBulletLegendProps) => JSX.Element | null) = React.memo(React.forwardRef(VisBulletLegendFC), arePropsEqual)
