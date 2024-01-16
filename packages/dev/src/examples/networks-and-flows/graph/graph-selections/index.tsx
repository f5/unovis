import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { Graph } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'

export const title = 'Graph: Node Selection'
export const subTitle = 'Select Node on Click'

export const component = (): JSX.Element => {
  const data = useMemo(() => generateNodeLinkData(), [])
  const ref = useRef<VisGraphRef<NodeDatum, LinkDatum>>(null)
  const [selectedNode, setSelectedNode] = useState<string | undefined>()
  const [text, setText] = useState<string>()

  useEffect(() => {
    const external = selectedNode ?? 'undefined'
    const internal = ref.current?.component?.config.selectedNodeId ?? 'undefined'
    setText([external, internal].join(' / '))
  }, [selectedNode])

  return (
    <>
      <div>Selected node: {text}</div>
      <VisSingleContainer data={data} height={600}>
        <VisGraph
          ref={ref}
          forceLayoutSettings={useMemo(() => ({
            fixNodePositionAfterSimulation: true,
          }), [])}
          linkCurvature={1}
          nodeIcon={useCallback((n: NodeDatum) => n.id, [])}
          events={useMemo(() => ({
            [Graph.selectors.node]: {
              click: (n: NodeDatum) => { setSelectedNode(n.id) },
            },
            [Graph.selectors.background]: {
              click: () => { setSelectedNode(undefined) },
            },
          }), [])}
          selectedNodeId={selectedNode}
        />
      </VisSingleContainer>

    </>
  )
}

