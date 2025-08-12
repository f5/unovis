import React, { useState, useCallback } from 'react'
import { format } from 'd3-format'
import { VisSingleContainer, VisTooltip, VisTreemap } from '@unovis/react'
import { Position, Treemap, TreemapNode } from '@unovis/ts'
import { colors } from '@unovis/ts/styles/colors'
import s from './styles.module.css'

export const title = 'Treemap: Search'
export const subTitle = 'Demo of search by nodes feature'

// Number formatter for population values,
// using B for billions and M for millions.
const populationFormatRaw = format('.3s')
const populationFormat = (value: number): string => populationFormatRaw(value)
  .replace('G', 'B')

const getTooltipContent = (d: TreemapNode<TreemapExampleDatum>): string => {
  const datum = d.data.datum as TreemapExampleDatum | undefined
  if (datum && typeof datum.value === 'number') {
    return `
      <div class="${s.tooltipTitle}">${datum.name}</div>
      <div>Total Population: ${populationFormat(datum.value)}</div>
    `
  }
  return ''
}

type TreemapExampleDatum = {
  name: string;
  value: number;
  group: string;
}

const data: TreemapExampleDatum[] = [
  { name: 'China', value: 1412600000, group: 'Asia' },
  { name: 'India', value: 1380004385, group: 'Asia' },
  { name: 'United States', value: 331002651, group: 'North America' },
  { name: 'Indonesia', value: 273523615, group: 'Asia' },
  { name: 'Brazil', value: 212559417, group: 'South America' },
  { name: 'Nigeria', value: 206139589, group: 'Africa' },
  { name: 'Pakistan', value: 225199937, group: 'Asia' },
  { name: 'Bangladesh', value: 164689383, group: 'Asia' },
  { name: 'Russia', value: 145912025, group: 'Europe' },
  { name: 'Mexico', value: 128932753, group: 'North America' },
  { name: 'Japan', value: 125836021, group: 'Asia' },
  { name: 'Ethiopia', value: 114907000, group: 'Africa' },
  { name: 'Philippines', value: 112007080, group: 'Asia' },
  { name: 'Egypt', value: 102334481, group: 'Africa' },
  { name: 'Vietnam', value: 97338583, group: 'Asia' },
  { name: 'Germany', value: 83783942, group: 'Europe' },
]

// Assign a unique color to each group using the Unovis color palette
const groupColorMap: { key: string; value: string }[] = []
let colorIdx = 0
for (const d of data) {
  if (!groupColorMap.find(g => g.key === d.group)) {
    groupColorMap.push({ key: d.group, value: colors[colorIdx % colors.length] })
    colorIdx++
  }
}

export const component = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('')
  const [clickedNode, setClickedNode] = useState<TreemapExampleDatum | null>(null)

  // Match the search term against the data
  const filteredData = React.useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase()
    return data.filter(d => {
      const nameLower = d.name.toLowerCase()
      const groupLower = d.group.toLowerCase()
      return nameLower?.includes(searchTermLower) || groupLower?.includes(searchTermLower)
    })
  }, [searchTerm])

  const handleClick = useCallback((d: TreemapNode<TreemapExampleDatum>): void => {
    const datum = d.data.datum as TreemapExampleDatum | undefined
    if (!datum) return
    setClickedNode(prev => (prev && prev.name === datum.name) ? null : datum)
  }, [])

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: '10px',
          padding: '8px',
          width: '200px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />

      <VisSingleContainer height={400}>
        <VisTreemap
          data={filteredData}
          value={(d: TreemapExampleDatum) => d.value}
          layers={[
            (d: TreemapExampleDatum) => d.group,
            (d: TreemapExampleDatum) => d.name,
          ]}
          numberFormat={populationFormat}
          tilePadding={5}
          tilePaddingTop={25}
          labelOffsetX={6}
          labelOffsetY={8}
          labelInternalNodes={true}
          showTileClickAffordance={true}
          events={{
            [Treemap.selectors.clickableTile]: {
              click: handleClick,
            },
          }}
          tileColor={(node: TreemapNode<TreemapExampleDatum>) => {
            const datum = node.data.datum as TreemapExampleDatum | undefined
            if (clickedNode) {
              // If this is the clicked node, use its group color
              if (datum && datum.name === clickedNode.name) {
                const entry = groupColorMap.find(g => g.key === datum.group)
                return entry ? entry.value : '#008877'
              }
              // Otherwise, grey out: lighter for internal nodes, darker for leaves
              return node.children ? '#eee' : '#ddd'
            } else {
              // No selection: use group color as before
              const group = datum ? datum.group : node.data.key
              const entry = groupColorMap.find(g => g.key === group)
              return entry ? entry.value : '#008877'
            }
          }}
        />
        <VisTooltip
          horizontalPlacement={Position.Center}
          triggers={{
            [Treemap.selectors.tile]: getTooltipContent,
          }}
        />
      </VisSingleContainer>
      {clickedNode && (
        <div style={{
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}>
          Selected: {clickedNode.name} ({populationFormat(clickedNode.value)})
        </div>
      )}
    </div>
  )
}
