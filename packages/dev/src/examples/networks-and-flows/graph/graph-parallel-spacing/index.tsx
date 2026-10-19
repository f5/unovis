import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import React, { useMemo } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData, LinkDatum, NodeDatum } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import * as s from './styles'

export const title = 'Parallel Layout Spacing'
export const subTitle = 'Custom Node and Sub-group Spacing'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  // Generate sample data with more nodes using the utility function
  const { nodes } = useMemo(() => generateNodeLinkData(124), []) // Generate 124 nodes with links

  // State for spacing controls
  const [nodeSpacing, setNodeSpacing] = useComponentState<[number, number]>('graph', 'layoutParallelNodeSpacing', [40, 60])
  const [horizontalNodeSpacing, verticalNodeSpacing] = nodeSpacing
  const [subGroupSpacing, setSubGroupSpacing] = useComponentState('graph', 'layoutParallelSubGroupSpacing', 80)
  const [groupSpacing, setGroupSpacing] = useComponentState('graph', 'layoutParallelGroupSpacing', 300)

  return (
    <div className={s.mainContainer}>
      <div className={s.controlsContainer}>
        <ExampleControls components={['graph']}/>
        <h4 className={s.controlsTitle}>Spacing Controls</h4>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Horizontal Node Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min={Math.min(5, horizontalNodeSpacing ?? 5)}
            max={Math.max(100, horizontalNodeSpacing ?? 100)}
            step={Number.isInteger(horizontalNodeSpacing) ? 1 : 'any'}
            value={horizontalNodeSpacing}
            onChange={(e) => setNodeSpacing([Number(e.target.value), verticalNodeSpacing])}
          />
          <span className={s.sliderValue}>{horizontalNodeSpacing}px</span>
        </div>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Vertical Node Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min={Math.min(5, verticalNodeSpacing ?? 5)}
            max={Math.max(100, verticalNodeSpacing ?? 100)}
            step={Number.isInteger(verticalNodeSpacing) ? 1 : 'any'}
            value={verticalNodeSpacing}
            onChange={(e) => setNodeSpacing([horizontalNodeSpacing, Number(e.target.value)])}
          />
          <span className={s.sliderValue}>{verticalNodeSpacing}px</span>
        </div>

        <div className={s.sliderRow}>
          <label className={s.sliderLabel}>Sub-group Spacing:</label>
          <input
            className={s.sliderInput}
            type="range"
            min={Math.min(10, subGroupSpacing ?? 10)}
            max={Math.max(150, subGroupSpacing ?? 150)}
            step={Number.isInteger(subGroupSpacing) ? 1 : 'any'}
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
            min={Math.min(50, groupSpacing ?? 50)}
            max={Math.max(500, groupSpacing ?? 500)}
            step={Number.isInteger(groupSpacing) ? 1 : 'any'}
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
