import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import { useComponentConfig } from '@src/components/ExampleControls/useComponentConfig'
import React from 'react'
import { NestedDonutSegmentLabelAlignment } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import s from './styles.module.css'

export const title = 'Segment labels'
export const subTitle = 'Alignment and hiding'

const lengths = ['Short', 'Medium length', `L${'o'.repeat(10)}ng`]
const data = Array(15).fill(0).map((_, i) => ({
  type: lengths[Math.floor(i / 5)],
  label: Array(i % 5 + 1).fill(lengths[Math.floor(i / 5)].split(' ')[0]).join(' '),
}))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [hideLabels, setHideLabels] = useComponentState('example', 'hideLabels', false)
  const { config, reset } = useComponentConfig('nestedDonut', { hideOverflowingSegmentLabels: hideLabels })
  const toggleHiddenLabels = (): void => { setHideLabels(!config.hideOverflowingSegmentLabels); reset(['hideOverflowingSegmentLabels']) }

  return (<>
    <ExampleControls components={['example', 'nestedDonut']}/>
    <button onClick={toggleHiddenLabels}>{config.hideOverflowingSegmentLabels ? 'Show' : 'Hide'} Labels</button>
    <div className={s.flex}>
      {Object.values(NestedDonutSegmentLabelAlignment).map(labelAlignment =>
        <VisSingleContainer key={labelAlignment} height={500} width={500} data={data}>
          <VisNestedDonut
            direction='outwards'
            hideOverflowingSegmentLabels={hideLabels}
            layers={[d => d.type, d => d.label]}
            centralLabel={labelAlignment}
            layerSettings={{ width: 75, labelAlignment }}
            duration={props.duration}
          />
        </VisSingleContainer>
      )}
    </div>
  </>
  )
}

