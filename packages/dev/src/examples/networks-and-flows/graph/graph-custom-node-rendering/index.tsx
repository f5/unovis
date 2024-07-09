import React from 'react'
import { CustomGraph } from './component'
import { CustomGraphNodeType } from './enums'
import type { CustomGraphLink, CustomGraphNode } from './types'


export const title = 'Graph: Custom Nodes'
export const subTitle = 'User provided rendering functions'

export const component = (): JSX.Element => {
  const nodes: CustomGraphNode[] = [
    {
      id: '0',
      type: CustomGraphNodeType.Identity,
      subLabel: 'External User',
      label: 'jdoe@acme.com',
      aggregationCount: 2,
      numFindings: { medium: 12, high: 3, critical: 1 },
      starred: true,
      numSessions: 150,
      status: ['admin', 'high-data-access'],
    },
    { id: '1', type: CustomGraphNodeType.Identity, subLabel: 'Role', label: 'AWSReservedSSO_Something' },
    { id: '2', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-0a1b2c3d4e5f6g7h8' },
    { id: '3', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-1a1b2c3d4e5f6g7h8' },
    { id: '4', type: CustomGraphNodeType.Resource, subLabel: 'File', label: 'my-file' },
    { id: '5', type: CustomGraphNodeType.Secret, subLabel: 'Secret', label: 'tests-ansible-ssm-file-transfer' },
  ]

  const links: CustomGraphLink[] = [
    { source: '0', target: '1' },
    { source: '0', target: '2' },
    { source: '0', target: '3' },
    { source: '0', target: '4' },
    { source: '1', target: '5' },
  ]

  return (
    <CustomGraph nodes={nodes} links={links} zoomScaleExtent={[0.25, 2]} height={'100vh'} />
  )
}

