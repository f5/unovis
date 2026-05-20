import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { FitMode } from '@unovis/ts'

export const title = 'Treemap: Many Labels Stress Test'
export const subTitle = 'Text-measurement cache stress test'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
  subgroup?: string;
}

const WORDS = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
  'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
  'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
  'X-ray', 'Yankee', 'Zulu', 'Observability', 'Latency', 'Throughput',
  'Pipeline', 'Inference', 'Backfill', 'Dashboard',
]

function makeLabel (i: number): string {
  const a = WORDS[i % WORDS.length]
  const b = WORDS[(i * 7) % WORDS.length]
  const c = WORDS[(i * 13) % WORDS.length]
  // Vary length so wrapping/trimming exercises different paths
  return i % 3 === 0 ? `${a} ${b} ${c}` : `${a} ${b}`
}

export const component = (): React.ReactElement => {
  const NUM_TILES = 800
  const data: TreemapExampleDatum[] = Array.from({ length: NUM_TILES }, (_, i) => {
    const groupIndex = i % 12
    const subgroupIndex = Math.floor(i / 12) % 8
    return {
      name: makeLabel(i),
      value: 50 + (i % 200),
      group: `Group ${WORDS[groupIndex]}`,
      subgroup: `Subgroup ${WORDS[subgroupIndex]} ${WORDS[(subgroupIndex + 3) % WORDS.length]}`,
    }
  })

  return (
    <VisSingleContainer height={'180vh'}>
      <VisTreemap
        data={data}
        value={(d: TreemapExampleDatum) => d.value}
        layers={[
          (d: TreemapExampleDatum) => d.group,
          (d: TreemapExampleDatum) => d.subgroup,
          (d: TreemapExampleDatum) => d.name,
        ]}
        tilePadding={4}
        tilePaddingTop={22}
        labelOffsetX={6}
        labelOffsetY={6}
        labelInternalNodes={true}
        tileLabelLargeFontSize={14}
        minTileSizeForLabel={30}
        labelFit={FitMode.Wrap}
      />
    </VisSingleContainer>
  )
}
