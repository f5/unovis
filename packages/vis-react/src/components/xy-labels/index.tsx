// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { XYLabels, XYLabelsConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisXYLabelsProps<Datum> = XYLabelsConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisXYLabelsFC<Datum> (props: VisXYLabelsProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<XYLabels<Datum>>>(null)
  const [component] = useState<XYLabels<Datum>>(new XYLabels(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<XYLabels<Datum>>).__component__ = component
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
export const VisXYLabels: (<Datum>(props: VisXYLabelsProps<Datum>) => JSX.Element | null) = React.memo(VisXYLabelsFC, arePropsEqual)
