import React, { useCallback } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType, GraphLinkArrowStyle, GraphLinkStyle } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import { generateNodeLinkData } from '@src/utils/data'

import s from './index.module.css'

export const title = 'Link Arrows'
export const subTitle = 'with varied styles and undefined labels'


const d = generateNodeLinkData()
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  // Types
  type LinkStyle = { type: string; direction?: GraphLinkArrowStyle; style: GraphLinkStyle; label: string }
  type NodeDatum = { id: string; group: string; subgroup: string }
  type LinkDatum = { source: string; target: string } & LinkStyle

  // Data
  const types: LinkStyle[] = ['Basic', 'Dashed', 'Directional', 'Bidirectional'].map((t, i) => ({
    type: t,
    direction: [undefined, undefined, GraphLinkArrowStyle.Single, GraphLinkArrowStyle.Double][i],
    style: i === 1 ? GraphLinkStyle.Dashed : GraphLinkStyle.Solid,
    label: ['A', 'B', 'C', 'D'][i],
  }))
  const legendData = {
    nodes: types.flatMap((group, i) =>
      ['src', 'dst'].map((subgroup) => ({
        id: `n${i}-${subgroup}`,
        group: group.type,
        subgroup,
      }))
    ),
    links: types.map((t, i) => ({
      source: `n${i}-src`,
      target: `n${i}-dst`,
      ...types[i],
    })),
  }
  const data = {
    nodes: d.nodes,
    links: [{ source: '1', target: '2' }].concat(d.links.map((l, i) => ({ ...l, ...types[i % types.length] }))),
  }

  // State and accessors
  const [showLegend, toggleLegend] = React.useState(true)
  const linkLabel = useCallback((l: LinkDatum) => ({ text: l.label }), [])
  const linkArrow = useCallback((l: LinkDatum) => l.direction, [])
  const linkStyle = useCallback((l: LinkDatum) => l.style, [])

  const sharedProps = { linkLabel, linkArrow, linkStyle }

  return (
    <div>
      <button onClick={() => toggleLegend(!showLegend)}>{ showLegend ? 'Hide' : 'Show'} Legend</button>
      <div className={showLegend ? s.container : s.hidden}>
        <div className={s.contents}>
          <VisSingleContainer margin={{ left: 100, right: 100 }} data={legendData}>
            <VisGraph<NodeDatum, LinkDatum>
              disableZoom={true}
              disableDrag={true}
              panels={legendData.links.map(l => ({ nodes: [l.source, l.target], label: l.type }))}
              layoutType={GraphLayoutType.Parallel}
              layoutParallelSubGroupsPerRow={2}
              layoutNodeGroup={n => n.group}
              layoutParallelNodeSubGroup={n => n.subgroup}
              {...sharedProps}
              duration={props.duration}
            />
          </VisSingleContainer>
        </div>
      </div>
      <VisSingleContainer data={data}>
        <VisGraph {...sharedProps} duration={props.duration}/>
      </VisSingleContainer>
    </div>
  )
}

