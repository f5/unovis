import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateNodeLinkData, LinkDatum, NodeDatum, randomNumberGenerator } from '@/utils/data'
import { VisGraph, VisSingleContainer } from '@unovis/react'
import { GraphCircleLabel } from '@unovis/ts'
import React from 'react'

export const title = 'Node and Link Circle Labels'
export const subTitle = 'with custom configuration'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateNodeLinkData(15)
  const linkLabels: GraphCircleLabel[] = data.links.map((link, i) => {
    const hasCustomAppearance = randomNumberGenerator() > 0.8
    return {
      text: hasCustomAppearance ? `${i}${i}${i}` : `${i * 10}`,
      fontSize: hasCustomAppearance ? '8px' : undefined,
      radius: hasCustomAppearance ? 0 : 5 + 10 * randomNumberGenerator(),
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
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
