// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipRef = {
  component?: Tooltip;
}

export type VisTooltipProps = TooltipConfigInterface & {
  data?: null;
  ref?: Ref<VisTooltipRef>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTooltipFC (props: VisTooltipProps, fRef: ForwardedRef<VisTooltipRef>): JSX.Element {
  const ref = useRef<VisComponentElement<Tooltip>>(null)
  const [component, setComponent] = useState<Tooltip>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Tooltip>)

    const c = new Tooltip(props)
    setComponent(c)
    element.__component__ = c

    return () => c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }), [component])
  return <vis-tooltip ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisTooltip: ((props: VisTooltipProps) => JSX.Element | null) = React.memo(React.forwardRef(VisTooltipFC), arePropsEqual)
