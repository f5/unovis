import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { FitMode } from '@unovis/ts'

export const title = 'Treemap: Huge'
export const subTitle = 'Lots of data'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
  subgroup?: string;
}

export const component = (): React.ReactElement => {
  const data: TreemapExampleDatum[] = Array.from({ length: 2000 }, (_, i) => {
    const groupIndex = i % 10
    const subgroupIndex = Math.floor(i / 10) % 5
    return {
      name: `Item ${i + 1}`,
      value: 100 + groupIndex * 100 + subgroupIndex * 10 + (i % 50) + 1,
      group: `Group ${groupIndex + 1}`,
      subgroup: `Subgroup ${subgroupIndex + 1}`,
    }
  })

  return (
    <VisSingleContainer height={'95vh'}>
      <VisTreemap
        data={data}
        value={(d: TreemapExampleDatum) => d.value}
        layers={[
          (d: TreemapExampleDatum) => d.group,
          (d: TreemapExampleDatum) => d.subgroup,
          (d: TreemapExampleDatum) => d.name,
        ]}
        tilePadding={5}
        tilePaddingTop={24}
        labelOffsetX={6}
        labelOffsetY={6}
        labelInternalNodes={true}
        tileLabelLargeFontSize={16}
        minTileSizeForLabel={40}
        labelFit={FitMode.Wrap}
      />
    </VisSingleContainer>
  )
}
