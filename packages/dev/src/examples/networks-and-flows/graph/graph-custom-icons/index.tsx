import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { NodeDatum } from '@src/utils/data'

import personIcon from './person.svg?raw'
import roleIcon from './role.svg?raw'
import instanceIcon from './instance.svg?raw'
import bucketIcon from './bucket.svg?raw'

import s from './index.module.css'

export const title = 'Graph: SVG Node Icons'
export const subTitle = 'cured links, long labels'

export const component = (): JSX.Element => {
  const svgDefs = `
    ${personIcon}
    ${roleIcon}
    ${instanceIcon}
    ${bucketIcon}
  `

  const nodes = [
    { id: 'jdoe@acme.com', icon: '#personIcon', fillColor: '#DFFAFD', label: 'External User', sublabel: 'jdoe@acme.com' },
    { id: 'AWSReservedSSO_Something', icon: '#roleIcon', fillColor: '#E3DEFC', label: 'Role', sublabel: 'AWSReservedSSO_Something' },
    { id: 'i-0a1b2c3d4e5f6g7h8', icon: '#instanceIcon', fillColor: '#D0E1FC', label: 'EC2 Instance', sublabel: 'i-0a1b2c3d4e5f6g7h8' },
    { id: 'i-1a1b2c3d4e5f6g7h8', icon: '#instanceIcon', fillColor: '#D0E1FC', label: 'EC2 Instance', sublabel: 'i-1a1b2c3d4e5f6g7h8' },
    { id: 'my-bucket', icon: '#bucketIcon', fillColor: '#D4DBFB', label: 'S3 Bucket', sublabel: 'my-bucket' },
    { id: 'tests-ansible-ssm-file-transfer', icon: '#bucketIcon', fillColor: '#D4DBFB', label: 'S3 Bucket', sublabel: 'tests-ansible-ssm-file-transfer' },
  ]

  const links = [
    { source: 0, target: 1, label: { text: 'assume' } },
    { source: 1, target: 2, label: { text: '1' } },
    { source: 1, target: 3, label: { text: 'label' } },
    { source: 1, target: 4 },
    { source: 1, target: 5, label: { text: '2' } },
  ]

  const data = { nodes, links }
  return (
    <div className={s.graph}>
      <VisSingleContainer svgDefs={svgDefs} height={600}>
        <VisGraph
          data={data}
          nodeIcon={(n: NodeDatum) => n.icon}
          nodeIconSize={18}
          nodeStroke={'none'}
          nodeFill={(n: NodeDatum) => n.fillColor}
          nodeLabel={(n: NodeDatum) => n.label}
          nodeSubLabel={(n: NodeDatum) => n.sublabel}
          layoutType='dagre'
          dagreLayoutSettings={{
            rankdir: 'LR',
            ranksep: 120,
            nodesep: 20,
          }}
          linkBandWidth={6}
          linkFlow={true}
          linkCurvature={1}
          linkArrow={'single'}
          linkLabel={(l: typeof links[0]) => l.label}
        />
      </VisSingleContainer>
    </div>
  )
}

