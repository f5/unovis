/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react'
import { VisGraph, VisSingleContainer } from '@unovis/react'
import { GraphElkLayoutSettings, GraphNodeShape } from '@unovis/ts'

export const title = 'Layout: ELK'
export const subTitle = 'Layered hierarchical layout'


export type NodeDatum = {
  id: string;
  group?: string;
  subGroup?: string;
  shape?: string;
}

export type LinkDatum = {
  source: string;
  target: string;
}

const data = {
  nodes: [
    { id: 'vpc', icon: '&#xf0c2;' },
    { id: '192.168.0.0/25', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: '192.168.3.192/26', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: '192.8.3.191/33', group: 'us-east-2a', subGroup: 'subnets', icon: '&#xf233;' },
    { id: 'master-0', group: 'us-east-2a', subGroup: 'nodes', icon: '&#xf1b2;' },
    { id: 'workload-name', group: 'us-east-2a', subGroup: 'nodes', icon: '&#xf1b3;' },
    { id: 'us-east-2b', group: 'us-east-2b', icon: '&#xf009;' },
    { id: 'us-east-2c', group: 'us-east-2c', icon: '&#xf009;' },
  ],
  links: [
    { source: 'vpc', target: '192.168.0.0/25' },
    { source: 'vpc', target: '192.168.3.192/26' },
    { source: 'vpc', target: '192.8.3.191/33' },
    { source: 'vpc', target: 'us-east-2b' },
    { source: 'vpc', target: 'us-east-2c' },
    { source: '192.168.0.0/25', target: 'master-0' },
    { source: '192.168.3.192/26', target: 'master-0' },
    { source: '192.8.3.191/33', target: 'workload-name' },
  ],
}
export const component = (): JSX.Element => {
  return (
    <>
      <VisSingleContainer data={data} height={'100vh'}>
        <VisGraph<NodeDatum, LinkDatum>
          nodeLabel={(n: NodeDatum) => n.id}
          nodeShape={GraphNodeShape.Square}
          nodeStrokeWidth={1.5}
          layoutType="elk"
          layoutElkNodeGroups={[
            (d: NodeDatum) => d.group ?? null,
            (d: NodeDatum) => d.subGroup ?? null,
          ]}
          layoutElkSettings={(group): GraphElkLayoutSettings => {
            switch (group) {
              case 'us-east-2a':
                return {
                  'elk.padding': '[top=30.0,left=10.0,bottom=30.0,right=10.0]',
                }
              case 'root':
              default:
                return {
                  'layered.crossingMinimization.forceNodeModelOrder': 'true',
                  'spacing.nodeNodeBetweenLayers': '150',
                  'spacing.edgeNodeBetweenLayers': '50',
                  'spacing.edgeEdgeBetweenLayers': '50',
                  'spacing.nodeNode': '10',
                  'spacing.edgeNode': '100',
                  'spacing.edgeEdge': '100',
                }
            }
          }}
          panels={[
            {
              nodes: ['192.168.0.0/25', '192.168.3.192/26', '192.8.3.191/33', 'master-0', 'workload-name'],
              label: 'us-east-2a',
              dashedOutline: true,
              padding: { top: 45, right: 30, bottom: 30, left: 30 },
            },
            {
              nodes: ['192.168.0.0/25', '192.168.3.192/26', '192.8.3.191/33'],
              label: 'subnets',
              padding: { top: 5 },
            },
            {
              nodes: ['master-0', 'workload-name'],
              label: 'workload',
              padding: { top: 5 },
            },
          ]}
        />
      </VisSingleContainer>
    </>
  )
}

