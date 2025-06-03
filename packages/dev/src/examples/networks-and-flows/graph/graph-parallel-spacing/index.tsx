import React, { useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData, LinkDatum, NodeDatum } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import * as s from './styles'

export const title = 'Parallel Layout Spacing'
export const subTitle = 'Custom Node and Sub-group Spacing'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  // Generate sample data with more nodes using the utility function
  const { nodes } = generateNodeLinkData(124) // Generate 124 nodes with links

  // State for spacing controls
  const [horizontalNodeSpacing, setHorizontalNodeSpacing] = useState(40)
  const [verticalNodeSpacing, setVerticalNodeSpacing] = useState(60)
  const [subGroupSpacing, setSubGroupSpacing] = useState(80)
  const [groupSpacing, setGroupSpacing] = useState(300)

  return (
    <div className={s.mainContainer}>
      <div className={s.controlsContainer}>
        <h4 className={s.controlsTitle}>Spacing Controls</h4>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Horizontal Node Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min="5"
            max="100"
            value={horizontalNodeSpacing}
            onChange={(e) => setHorizontalNodeSpacing(Number(e.target.value))}
          />
          <span className={s.sliderValue}>{horizontalNodeSpacing}px</span>
        </div>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Vertical Node Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min="5"
            max="100"
            value={verticalNodeSpacing}
            onChange={(e) => setVerticalNodeSpacing(Number(e.target.value))}
          />
          <span className={s.sliderValue}>{verticalNodeSpacing}px</span>
        </div>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Sub-group Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min="10"
            max="150"
            value={subGroupSpacing}
            onChange={(e) => setSubGroupSpacing(Number(e.target.value))}
          />
          <span className={s.sliderValue}>{subGroupSpacing}px</span>
        </div>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Group Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min="50"
            max="500"
            value={groupSpacing}
            onChange={(e) => setGroupSpacing(Number(e.target.value))}
          />
          <span className={s.sliderValue}>{groupSpacing}px</span>
        </div>
      </div>

      <VisSingleContainer data={{ nodes }} className={s.graphContainer}>
        <VisGraph<NodeDatum, LinkDatum>
          layoutType={GraphLayoutType.Parallel}
          layoutNodeGroup={n => n.group}
          layoutParallelNodeSubGroup={n => n.subgroup}
          layoutParallelNodesPerColumn={4}
          layoutParallelSubGroupsPerRow={2}
          layoutParallelGroupSpacing={groupSpacing}
          layoutParallelNodeSpacing={[horizontalNodeSpacing, verticalNodeSpacing]} // [horizontal, vertical] spacing between nodes
          layoutParallelSubGroupSpacing={subGroupSpacing} // spacing between sub-groups
          duration={props.duration}
        />
      </VisSingleContainer>
    </div>
  )
}
