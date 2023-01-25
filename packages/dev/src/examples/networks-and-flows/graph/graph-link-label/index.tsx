import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'
import { GraphCircleLabel } from '@unovis/ts'

export const title = 'Node and Link Circle Labels'
export const subTitle = 'with custom configuration'
export const category = 'Graph'

export const component = (): JSX.Element => {
  const data = generateNodeLinkData(15)
  const linkLabels: GraphCircleLabel[] = data.links.map((link, i) => {
    const hasCustomAppearance = Math.random() > 0.8
    return {
      text: hasCustomAppearance ? `${i}${i}${i}` : `${i * 10}`,
      fontSize: hasCustomAppearance ? '8px' : undefined,
      radius: hasCustomAppearance ? 0 : 5 + 10 * Math.random(),
      cursor: 'pointer',
      textColor: hasCustomAppearance ? 'blue' : undefined,
    }
  })

  const getNodeSideLabels = (d: NodeDatum, i: number): GraphCircleLabel[] => i === 5
    ? [{ text: '🏈', color: '#eee' }, { text: '⚾️', color: '#ff351d' }]
    : [{ text: String.fromCharCode(70 + i), color: '#eee', radius: 8 }]

  return (
    <>
      <VisSingleContainer data={data} height={600}>
        <VisGraph<NodeDatum, LinkDatum>
          nodeIcon={n => n.id}
          linkLabel={(l, i) => linkLabels[i as number]}
          nodeSideLabels={getNodeSideLabels}
        />
      </VisSingleContainer>
    </>
  )
}

