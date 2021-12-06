/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Brush, BrushConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
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
const memoizedComponent = React.memo(VisBrushFC, arePropsEqual)
export const VisBrush = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Brush.selectors>
VisBrush.selectors = Brush.selectors
