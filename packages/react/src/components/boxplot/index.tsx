// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef } from 'react'
import { Boxplot } from '@unovis/ts/components/boxplot'
import { BoxplotConfigInterface } from '@unovis/ts/components/boxplot/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBoxplotRef<Datum> = {
  component?: Boxplot<Datum>;
}

export type VisBoxplotProps<Datum> = BoxplotConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisBoxplotRef<Datum>>;
}

export const VisBoxplotSelectors = Boxplot.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisBoxplotFC<Datum> (props: VisBoxplotProps<Datum>, fRef: ForwardedRef<VisBoxplotRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Boxplot<Datum>>>(null)
  const componentRef = useRef<Boxplot<Datum> | undefined>(undefined)
  // Separate the config properties from the props that should not be passed to the component
  const { data, ...config } = props

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Boxplot<Datum>>)

    const c = new Boxplot<Datum>(config)
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
    if (data !== undefined) component?.setData(data)
    component?.setConfig(config)
  })

  // Ask the container to re-render when this component's config changes (see `useContainerRenderOnUpdate`)
  useContainerRenderOnUpdate()

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisBoxplot: (<Datum>(props: VisBoxplotProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisBoxplotFC), arePropsEqual)
