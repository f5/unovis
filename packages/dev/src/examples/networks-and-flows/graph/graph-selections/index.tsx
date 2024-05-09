import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { Graph } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'

export const title = 'Graph: Node Selection'
export const subTitle = 'Select Node on Click'

export const component = (): JSX.Element => {
  const data = useMemo(() => generateNodeLinkData(50), [])
  const ref = useRef<VisGraphRef<NodeDatum, LinkDatum>>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[] | undefined>()
  const [text, setText] = useState<string>()

  const selectNode = useCallback((n: NodeDatum) => {
    setSelectedNodes([...selectedNodes ?? [], n.id])
  }, [selectedNodes])

  useEffect(() => {
    const external = selectedNodes ?? 'undefined'
    const internal = ref.current?.component?.selectedNodes ?? 'undefined'
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
          linkCurvature={1}
          nodeIcon={useCallback((n: NodeDatum) => n.id, [])}
          events={useMemo(() => ({
            [Graph.selectors.node]: {
              click: (n: NodeDatum) => { selectNode(n) },
            },
            [Graph.selectors.background]: {
              click: () => { setSelectedNodes(undefined) },
            },
          }), [selectedNodes])}
          // selectedNodeId={'1'}
          selectedNodeIds={selectedNodes}
        />
      </VisSingleContainer>

    </>
  )
}

