// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { StackedBar, StackedBarConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisStackedBarProps<Datum> = StackedBarConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisStackedBarFC<Datum> (props: VisStackedBarProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<StackedBar<Datum>>>(null)
  const [component] = useState<StackedBar<Datum>>(new StackedBar(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<StackedBar<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisStackedBar: (<Datum>(props: VisStackedBarProps<Datum>) => JSX.Element | null) = React.memo(VisStackedBarFC, arePropsEqual)
