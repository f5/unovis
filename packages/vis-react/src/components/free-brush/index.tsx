/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { FreeBrush, FreeBrushConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisFreeBrushProps<Datum> = FreeBrushConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisFreeBrushFC<Datum> (props: VisFreeBrushProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<FreeBrush<Datum>>>(null)
  const [component] = useState<FreeBrush<Datum>>(new FreeBrush(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<FreeBrush<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
const memoizedComponent = React.memo(VisFreeBrushFC, arePropsEqual)
export const VisFreeBrush = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof FreeBrush.selectors>
VisFreeBrush.selectors = FreeBrush.selectors
