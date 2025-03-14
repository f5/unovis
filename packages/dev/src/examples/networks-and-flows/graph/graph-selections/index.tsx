import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateNodeLinkData, LinkDatum, NodeDatum } from '@/utils/data'
import { VisGraph, VisGraphRef, VisSingleContainer } from '@unovis/react'
import { Graph, GraphNodeSelectionHighlightMode } from '@unovis/ts'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const title = 'Graph: Node Selection'
export const subTitle = 'Select Node on Click'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateNodeLinkData(50), [])
  const ref = useRef<VisGraphRef<NodeDatum, LinkDatum>>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[] | undefined>()
  const [text, setText] = useState<string>()

  const selectNode = useCallback((n: NodeDatum, e: PointerEvent) => {
    setSelectedNodes([...(selectedNodes && e.metaKey ? selectedNodes : []), n.id])
  }, [selectedNodes])

  useEffect(() => {
    const external = selectedNodes ?? 'undefined'
    const internal = ref.current?.component?.selectedNodes?.map(d => d.id) ?? 'undefined' // Delayed by a render
    setText([external, internal].join(' | '))
  }, [selectedNodes])

  return (
    <>
      <div>Selected node: {text}</div>
      <VisSingleContainer data={data} height={600}>
        <VisGraph
          ref={ref}
          forceLayoutSettings={useMemo(() => ({
            fixNodePositionAfterSimulation: true,
          }), [])}
          nodeSelectionHighlightMode={GraphNodeSelectionHighlightMode.Greyout}
          linkCurvature={1}
          nodeIcon={useCallback((n: NodeDatum) => n.id, [])}
          events={useMemo(() => ({
            [Graph.selectors.node]: {
              click: selectNode,
            },
            [Graph.selectors.background]: {
              click: () => { setSelectedNodes(undefined) },
            },
          }), [selectedNodes])}
          selectedNodeIds={selectedNodes}
          duration={props.duration}
        />
      </VisSingleContainer>

    </>
  )
}
