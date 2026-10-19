import React, { ForwardedRef, useCallback, useLayoutEffect, useRef } from 'react'
import { GraphInputNode, GraphInputLink } from '@unovis/ts'
import { VisGraph as OriginalGraph, VisGraphProps, VisGraphRef } from '../../../react/src/components/graph'
import { VisTopoJSONMap as OriginalMap, VisTopoJSONMapProps, VisTopoJSONMapRef } from '../../../react/src/components/topojson-map'

import { arePropsEqual } from '../../../react/src/utils/react'

import { getInitialPlaying } from '../components/PlaybackControl'

import { getCaptureSettings } from './settings'

export * from '../../../react/src'

// eslint-disable-next-line @typescript-eslint/naming-convention
function CaptureGraph<N extends GraphInputNode, L extends GraphInputLink> (props: React.PropsWithChildren<VisGraphProps<N, L>>, ref: ForwardedRef<VisGraphRef<N, L>>): React.ReactElement {
  const status = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => { status.current?.setAttribute('aria-busy', 'true') })
  const onRenderComplete = useCallback<NonNullable<VisGraphProps<N, L>['onRenderComplete']>>((...args) => {
    props.onRenderComplete?.(...args)
    status.current?.setAttribute('aria-busy', 'false')
  }, [props.onRenderComplete])

  return <>
    <span ref={status} hidden aria-busy="true" />
    <OriginalGraph {...props} ref={ref} duration={0} linkFlow={getInitialPlaying() ? props.linkFlow : false} onRenderComplete={onRenderComplete} />
  </>
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function CaptureMap<A, P, L> (props: VisTopoJSONMapProps<A, P, L>, ref: ForwardedRef<VisTopoJSONMapRef<A, P, L>>): React.ReactElement {
  return <OriginalMap {...props} ref={ref} duration={0} zoomDuration={0} enableFlowAnimation={getInitialPlaying() ? props.enableFlowAnimation : false} />
}

// Only the dev webpack build resolves @unovis/react through this adapter.
export const VisGraph: typeof OriginalGraph = getCaptureSettings() ? (React.memo(React.forwardRef(CaptureGraph), arePropsEqual) as typeof OriginalGraph) : OriginalGraph
export const VisTopoJSONMap: typeof OriginalMap = getCaptureSettings() ? (React.forwardRef(CaptureMap) as typeof OriginalMap) : OriginalMap
