/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Axis, AxisConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisAxisProps<Datum> = AxisConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAxisFC<Datum> (props: VisAxisProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Axis<Datum>>>(null)
  const [component] = useState<Axis<Datum>>(new Axis(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Axis<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-axis ref={ref} />
}
const memoizedComponent = React.memo(VisAxisFC, arePropsEqual)
export const VisAxis = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Axis.selectors>
VisAxis.selectors = Axis.selectors
