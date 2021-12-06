/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { GroupedBar, GroupedBarConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisGroupedBarProps<Datum> = GroupedBarConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisGroupedBarFC<Datum> (props: VisGroupedBarProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<GroupedBar<Datum>>>(null)
  const [component] = useState<GroupedBar<Datum>>(new GroupedBar(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<GroupedBar<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
const memoizedComponent = React.memo(VisGroupedBarFC, arePropsEqual)
export const VisGroupedBar = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof GroupedBar.selectors>
VisGroupedBar.selectors = GroupedBar.selectors
