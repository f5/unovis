// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Timeline, TimelineConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTimelineRef<Datum> = {
  component?: Timeline<Datum>;
}

export type VisTimelineProps<Datum> = TimelineConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisTimelineRef<Datum>>;
}

export const VisTimelineSelectors = Timeline.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTimelineFC<Datum> (props: VisTimelineProps<Datum>, fRef: ForwardedRef<VisTimelineRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Timeline<Datum>>>(null)
  const componentRef = useRef<Timeline<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Timeline<Datum>>)

    const c = new Timeline<Datum>(props)
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
export const VisTimeline: (<Datum>(props: VisTimelineProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisTimelineFC), arePropsEqual)
