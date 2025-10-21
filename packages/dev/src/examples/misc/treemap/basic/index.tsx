import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'

export const title = 'Treemap: Basic'
export const subTitle = 'Hierarchical data visualization with custom colors'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
  subgroup?: string;
}

export const component = (): React.ReactElement => {
  const data: TreemapExampleDatum[] = [
    // Group 1
    { name: 'Q1', value: 20, group: 'Revenue — Annual Subscription', subgroup: 'Enterprise Tier — North America' },
    { name: 'Q2', value: 15, group: 'Revenue — Annual Subscription', subgroup: 'Enterprise Tier — North America' },
    { name: 'Q3', value: 8, group: 'Revenue — Annual Subscription', subgroup: 'Enterprise Tier — North America' },
    { name: 'New Deployments', value: 12, group: 'Revenue — Professional Services', subgroup: 'Global Services — Implementation & Onboarding' },
    { name: 'Remote Delivery', value: 10, group: 'Revenue — Professional Services', subgroup: 'Global Services — Training Workshops' },
    { name: 'Certified Partners', value: 6, group: 'Revenue — Professional Services', subgroup: 'Partner Ecosystem — Custom Integrations' },
    // Group 2
    { name: 'Core Compute', value: 14, group: 'Operating Expenses — Cloud Infrastructure', subgroup: 'Compute Instances — Production Cluster' },
    { name: 'Snapshot Retention', value: 9, group: 'Operating Expenses — Cloud Infrastructure', subgroup: 'Block Storage — Long‑Term Snapshots' },
    { name: 'Brand Terms', value: 7, group: 'Operating Expenses — Marketing', subgroup: 'Paid Search Campaigns — Brand Keywords' },
    { name: 'Articles', value: 5, group: 'Operating Expenses — Marketing', subgroup: 'Content Production — Technical Blog' },
    { name: 'Regional Events', value: 3, group: 'Operating Expenses — Marketing', subgroup: 'Conferences & Sponsorships — Tier 2' },
    // Group 3
    { name: 'Prototype A', value: 11, group: 'Research & Development', subgroup: 'Experimental Features — Prototypes' },
    { name: 'Prototype B', value: 8, group: 'Research & Development', subgroup: 'Experimental Features — Prototypes' },
    { name: 'P1 Incidents', value: 13, group: 'Customer Support', subgroup: 'Priority Tickets — Enterprise Accounts' },
    { name: 'Article Updates', value: 6, group: 'Customer Support', subgroup: 'Self‑Service Knowledge Base' },
    { name: 'Moderation Queue', value: 6, group: 'Customer Support', subgroup: 'Community Forum Moderation' },
  ]

  return (
    <VisSingleContainer height={400}>
      <VisTreemap
        data={data}
        value={(d: TreemapExampleDatum) => d.value}
        layers={[
          (d: TreemapExampleDatum) => d.group,
          (d: TreemapExampleDatum) => d.subgroup,
          (d: TreemapExampleDatum) => d.name,
        ]}
        tilePadding={10}
        tilePaddingTop={24}
        labelOffsetX={6}
        labelOffsetY={6}
        labelInternalNodes={true}
        tileLabelLargeFontSize={16}
        minTileSizeForLabel={40}
      />
    </VisSingleContainer>
  )
}
