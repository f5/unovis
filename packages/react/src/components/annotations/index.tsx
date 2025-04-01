// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Annotations, AnnotationsConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAnnotationsRef = {
  component?: Annotations;
}

export type VisAnnotationsProps = AnnotationsConfigInterface & {
  ref?: Ref<VisAnnotationsRef>;
}

export const VisAnnotationsSelectors = Annotations.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAnnotationsFC (props: VisAnnotationsProps, fRef: ForwardedRef<VisAnnotationsRef>): ReactElement {
  const ref = useRef<VisComponentElement<Annotations>>(null)
  const componentRef = useRef<Annotations | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Annotations>)

    const c = new Annotations(props)
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
  return <vis-annotations ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisAnnotations: ((props: VisAnnotationsProps) => JSX.Element | null) = React.memo(React.forwardRef(VisAnnotationsFC), arePropsEqual)
