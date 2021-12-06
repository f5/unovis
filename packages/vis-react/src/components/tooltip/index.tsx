/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipProps = TooltipConfigInterface & { data?: null }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTooltipFC (props: VisTooltipProps): JSX.Element {
  const ref = useRef<VisComponentElement<Tooltip>>(null)
  const [component] = useState<Tooltip>(new Tooltip(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Tooltip>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setConfig(props)
  })

  return <vis-tooltip ref={ref} />
}
const memoizedComponent = React.memo(VisTooltipFC, arePropsEqual)
export const VisTooltip = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Tooltip.selectors>
VisTooltip.selectors = Tooltip.selectors
