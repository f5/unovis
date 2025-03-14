import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { VisGraph, VisSingleContainer } from '@unovis/react'
import type { GraphLink } from 'packages/ts'
import React, { useState } from 'react'

export const title = 'Graph: Link Offset'
export const subTitle = 'Source and target offset'

type SampleNode = {
  id: string;
  icon: string;
  fillColor: string;
  label: string;
  size: number;
}

type SampleLink = {
  source: number;
  target: number;
}

export const component = (props: ExampleViewerDurationProps): React.ReactElement => {
  const nodes: SampleNode[] = [
    { id: 'lettuce', icon: '🥬', fillColor: '#DFFAFD', label: 'Lettuce', size: 75 },
    { id: 'onion', icon: '🧅', fillColor: '#E3DEFC', label: 'Onion', size: 35 },
  ]

  const links: SampleLink[] = [
    { source: 0, target: 1 },
  ]

  const [data] = useState({ nodes, links })

  const linkSourcePointOffset = (l: GraphLink<SampleNode, SampleLink>): [number, number] => {
    return [0, -l.source.size / 2]
  }

  const linkTargetPointOffset = (l: GraphLink<SampleNode, SampleLink>): [number, number] => {
    return [0, l.target.size / 2]
  }

  return (
    <VisSingleContainer height={600}>
      <VisGraph<typeof nodes[number], typeof links[number]>
        data={data}
        nodeIcon={(n) => n.icon}
        nodeIconSize={n => n.size / 2}
        nodeStroke={'none'}
        nodeFill={n => n.fillColor}
        nodeLabel={n => n.label}
        nodeSize={n => n.size}
        linkArrow={true}
        linkCurvature={1}
        duration={props.duration}
        linkSourcePointOffset={linkSourcePointOffset}
        linkTargetPointOffset={linkTargetPointOffset}
      />
    </VisSingleContainer>
  )
}
