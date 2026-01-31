import React, { useState } from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { FitMode } from '@unovis/ts'

export const title = 'Treemap: Data Update'
export const subTitle = 'Test data updates on button click'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
  subgroup?: string;
}

const generateData = (): TreemapExampleDatum[] => {
  const count = 15 + Math.floor(Math.random() * 20) // 15-34 items
  return Array.from({ length: count }, (_, i) => {
    const groupIndex = i % 3
    const subgroupIndex = Math.floor(i / 3) % 2
    return {
      name: `Item ${i + 1}`,
      value: Math.floor(50 + Math.random() * 200),
      group: `Group ${groupIndex + 1}`,
      subgroup: `Subgroup ${subgroupIndex + 1}`,
    }
  })
}

export const component = (): React.ReactElement => {
  const [data, setData] = useState(() => generateData(0))

  const handleUpdate = (): void => {
    setData(generateData())
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleUpdate} style={{ padding: '8px 16px', fontSize: 14 }}>
          Update Data ({data.length} items)
        </button>
      </div>
      <VisSingleContainer height={'80vh'}>
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
          minTileSizeForLabel={20}
          labelFit={FitMode.Wrap}
        />
      </VisSingleContainer>
    </div>
  )
}

