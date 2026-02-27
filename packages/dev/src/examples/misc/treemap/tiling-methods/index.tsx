import React, { useState } from 'react'
import { treemapBinary, treemapDice, treemapResquarify, treemapSlice, treemapSliceDice, treemapSquarify } from 'd3-hierarchy'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import type { TreemapDatum, TreemapTileFunction } from '@unovis/ts'

export const title = 'Treemap: Tiling Methods'
export const subTitle = 'D3 tiling methods with sorting'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
  subgroup?: string;
}

const data: TreemapExampleDatum[] = [
  { name: 'Enterprise', value: 22, group: 'Revenue', subgroup: 'Subscriptions' },
  { name: 'Starter', value: 14, group: 'Revenue', subgroup: 'Subscriptions' },
  { name: 'Free Trial', value: 5, group: 'Revenue', subgroup: 'Subscriptions' },
  { name: 'Onboarding', value: 12, group: 'Revenue', subgroup: 'Services' },
  { name: 'Consulting', value: 8, group: 'Revenue', subgroup: 'Services' },
  { name: 'Compute', value: 16, group: 'Expenses', subgroup: 'Infrastructure' },
  { name: 'Storage', value: 9, group: 'Expenses', subgroup: 'Infrastructure' },
  { name: 'Networking', value: 6, group: 'Expenses', subgroup: 'Infrastructure' },
  { name: 'Paid Search', value: 1, group: 'Expenses', subgroup: 'Marketing' },
  { name: 'Events', value: 4, group: 'Expenses', subgroup: 'Marketing' },
  { name: 'Platform', value: 18, group: 'Engineering', subgroup: 'Core' },
  { name: 'Mobile', value: 10, group: 'Engineering', subgroup: 'Core' },
  { name: 'ML Pipeline', value: 13, group: 'Engineering', subgroup: 'Data' },
  { name: 'Analytics', value: 7, group: 'Engineering', subgroup: 'Data' },
]

const TILE_OPTIONS: { key: string; label: string; tile: TreemapTileFunction<TreemapDatum<TreemapExampleDatum>> }[] = [
  { key: 'squarify', label: 'Squarify (default)', tile: treemapSquarify },
  { key: 'resquarify', label: 'Resquarify (stable for animation)', tile: treemapResquarify },
  { key: 'binary', label: 'Binary', tile: treemapBinary },
  { key: 'dice', label: 'Dice (horizontal)', tile: treemapDice },
  { key: 'slice', label: 'Slice (vertical)', tile: treemapSlice },
  { key: 'sliceDice', label: 'Slice-Dice (alternating)', tile: treemapSliceDice },
]

export const component = (): React.ReactElement => {
  const [selectedKey, setSelectedKey] = useState('squarify')
  const selected = TILE_OPTIONS.find(o => o.key === selectedKey)

  return (
    <>
      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
        style={{ marginBottom: 10, padding: '6px 10px' }}
      >
        {TILE_OPTIONS.map(({ key, label }) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <VisSingleContainer height={360}>
        <VisTreemap
          data={data}
          value={(d: TreemapExampleDatum) => d.value}
          layers={[
            (d: TreemapExampleDatum) => d.group,
            (d: TreemapExampleDatum) => d.subgroup,
            (d: TreemapExampleDatum) => d.name,
          ]}
          tileFunction={selected?.tile}
          timeSort={(a, b) => {
            return b.value - a.value
          }}
          tilePadding={8}
          tilePaddingTop={20}
          labelOffsetX={6}
          labelOffsetY={6}
          labelInternalNodes
          minTileSizeForLabel={32}
        />
      </VisSingleContainer>
    </>
  )
}
