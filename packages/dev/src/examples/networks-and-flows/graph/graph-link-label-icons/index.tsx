import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { sample } from '@/utils/array'
import { VisGraph, VisSingleContainer } from '@unovis/react'
import React, { useEffect, useState } from 'react'
import bucketIcon from './bucket.svg?raw'
import instanceIcon from './instance.svg?raw'
import personIcon from './person.svg?raw'
import roleIcon from './role.svg?raw'


export const title = 'Graph: Link Label Icons'
export const subTitle = 'SVG icons in link labels'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const svgDefs = `
    ${personIcon}
    ${roleIcon}
    ${instanceIcon}
    ${bucketIcon}
  `

  const nodes = [
    { id: 'jdoe@acme.com', icon: '#personIcon', fillColor: '#DFFAFD', label: 'External User', sublabel: 'jdoe@acme.com' },
    { id: 'AWSReservedSSO_Something', icon: '#roleIcon', fillColor: '#E3DEFC', label: 'Role', sublabel: 'AWSReservedSSO_Something' },
  ]

  const links = [
    { source: 0, target: 1, label: { text: '～' } },
  ]

  const [data, setData] = useState({ nodes, links })

  // Re-render the component here to test how the link label updates
  useEffect(() => {
    const interval = setInterval(() => {
      const links = [
        { source: 0, target: 1, label: { text: sample(['#personIcon', '#roleIcon', '#instanceIcon', '#bucketIcon', '2', 'long label']) } },
      ]

      setData({ nodes, links })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <VisSingleContainer svgDefs={svgDefs} height={600}>
      <VisGraph<typeof nodes[number], typeof links[number]>
        data={data}
        nodeIcon={(n) => n.icon}
        nodeIconSize={18}
        nodeStroke={'none'}
        nodeFill={n => n.fillColor}
        nodeLabel={n => n.label}
        nodeSubLabel={n => n.sublabel}
        layoutType='dagre'
        dagreLayoutSettings={{
          rankdir: 'LR',
          ranksep: 120,
          nodesep: 20,
        }}
        linkArrow={'single'}
        linkLabel={(l: typeof links[0]) => l.label}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
