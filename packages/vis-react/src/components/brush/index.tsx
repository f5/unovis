// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Brush, BrushConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBrushProps<Datum> = BrushConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisBrushFC<Datum> (props: VisBrushProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Brush<Datum>>>(null)
  const [component] = useState<Brush<Datum>>(new Brush(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Brush<Datum>>).__component__ = component
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
export const VisBrush: (<Datum>(props: VisBrushProps<Datum>) => JSX.Element | null) = React.memo(VisBrushFC, arePropsEqual)
