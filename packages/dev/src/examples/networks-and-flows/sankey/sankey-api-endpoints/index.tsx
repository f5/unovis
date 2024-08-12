import React, { useRef, useState } from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import {
  Position,
  Sankey,
  SankeyEnterTransitionType,
  SankeyExitTransitionType,
  SankeyLink,
  SankeyNode,
  SankeyNodeAlign,
  SankeySubLabelPlacement,
  Sizing,
  VerticalAlign,
} from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import apiRawData from './apieplist.json'
import { getSankeyData, ApiEndpointNode, ApiEndpointLink } from './data'

export const title = 'API Endpoints Tree'
export const subTitle = 'Collapsible nodes'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const collapsedStateRef = useRef<{ [key: string]: boolean }>({})
  const rawData = apiRawData// .slice(25, 50)
  const [data, setData] = useState(getSankeyData(rawData))

  const nodeWidth = 30
  const nodeHorizontalSpacing = 260

  const compareStrings = (a = '', b = ''): number => {
    const strA = a.toUpperCase()
    const strB = b.toUpperCase()

    if (strA < strB) return -1
    if (strA > strB) return 1
    return 0
  }

  return (
    <>
      <VisSingleContainer data={data} sizing={Sizing.Extend}>
        <VisSankey<ApiEndpointNode, ApiEndpointLink>
          labelPosition={Position.Right}
          labelVerticalAlign={VerticalAlign.Middle}
          labelBackground={false}
          nodeHorizontalSpacing={nodeHorizontalSpacing}
          nodeWidth={nodeWidth}
          nodeAlign={SankeyNodeAlign.Left}
          nodeIconColor={'#e9edfe'}
          nodePadding={50}
          nodeMinHeight={6}
          labelColor={'#0D1C5B'}
          labelCursor={'pointer'}
          label={d => d.isLeafNode ? d.method : `${d.leafs} ${d.leafs === 1 ? 'Leaf' : 'Leaves'}`}
          subLabel={d => d.label}
          nodeColor={d => d.isLeafNode ? '#0D1C5B' : null}
          subLabelFontSize={14}
          labelFontSize={14}
          labelMaxWidth={nodeHorizontalSpacing - 40}
          subLabelPlacement={SankeySubLabelPlacement.Below}
          nodeCursor={'pointer'}
          linkCursor={'pointer'}
          nodeIcon={d => (d.sourceLinks?.[0] || (!d.sourceLinks?.[0] && d.collapsed)) ? (d.collapsed ? '+' : '') : null}
          exitTransitionType={SankeyExitTransitionType.ToAncestor}
          enterTransitionType={SankeyEnterTransitionType.FromAncestor}
          highlightSubtreeOnHover={false}
          duration={props.duration}
          nodeSort={(a: SankeyNode<ApiEndpointNode, ApiEndpointLink>, b: SankeyNode<ApiEndpointNode, ApiEndpointLink>) => {
            const aParent = a.targetLinks[0]?.source
            const bParent = b.targetLinks[0]?.source
            const aGrandparent = a.targetLinks[0]?.source?.targetLinks[0]?.source
            const bGrandparent = b.targetLinks[0]?.source?.targetLinks[0]?.source

            if ((aParent === bParent)) { // Same parent nodes are sorted by: value + alphabetically
              return (b.value - a.value) || compareStrings(a?.path, b?.path)
            } else { // Different parent nodes are sorted by: 1st grandparent value + 1st parent value + alphabetically
              return (bGrandparent?.value - aGrandparent?.value) || (bParent?.value - aParent?.value) || -compareStrings(aParent?.path, bParent?.path)
            }
          }}
          linkSort={(a: SankeyLink<ApiEndpointNode, ApiEndpointLink>, b: SankeyLink<ApiEndpointNode, ApiEndpointLink>) => {
            return b.value - a.value || compareStrings(a.target?.path, b.target?.path) // Links sorted by: value + alphabetically
          }}
          events={{
            [Sankey.selectors.background]: {
              // eslint-disable-next-line no-console
              click: () => { console.log('Background click!') },
            },
            [Sankey.selectors.nodeGroup]: {
              click: (d: SankeyNode<ApiEndpointNode, ApiEndpointLink>) => {
                if (!d.targetLinks?.[0] || (!collapsedStateRef.current[d.id] && !d.sourceLinks?.[0])) return
                collapsedStateRef.current[d.id] = !collapsedStateRef.current[d.id]
                setData(getSankeyData(rawData, collapsedStateRef.current))
              },
            },
          }}
        />
      </VisSingleContainer>
    </>
  )
}

