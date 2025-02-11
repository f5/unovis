import React, { useState } from 'react'
import { format } from 'd3-format'
import { VisSingleContainer, VisTooltip, VisTreemap } from '@unovis/react'
import { Position, Treemap, TreemapNode } from '@unovis/ts'
import s from './styles.module.css'


export const title = 'Treemap: Search'
export const subTitle = 'Demo of search by nodes feature'

// Number formatter for population values,
// using B for billions and M for millions.
const populationFormatRaw = format('.3s')
const populationFormat = (value: number): string => populationFormatRaw(value)
  .replace('G', 'B')

const getTooltipContent = (d: TreemapNode<TreemapExampleDatum>): string => {
  return `
    <div class="${s.tooltipTitle}">${d.data[0]}</div>
    <div>Total Population: ${populationFormat(d.value)}</div>
  `
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


export const component = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')

  // Match the search term against the data
  const filteredData = React.useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase()
    return data.filter(d => {
      const nameLower = d.name.toLowerCase()
      const groupLower = d.group.toLowerCase()
      return nameLower.includes(searchTermLower) || groupLower.includes(searchTermLower)
    })
  }, [searchTerm])

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
        />
        <VisTooltip
          horizontalPlacement={Position.Center}
          triggers={{
            [Treemap.selectors.tile]: getTooltipContent,
          }}
        />
      </VisSingleContainer>
    </div>
  )
}
