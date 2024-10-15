import React, { useCallback, useState } from 'react'
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

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [hideLabels, setHideLabels] = useState(false)
  const toggleHiddenLabels = useCallback(() => setHideLabels(!hideLabels), [hideLabels])

  return (<>
    <button onClick={toggleHiddenLabels}>{hideLabels ? 'Show' : 'Hide'} Labels</button>
    <div className={s.flex}>
      {Object.values(NestedDonutSegmentLabelAlignment).map(labelAlignment =>
        <VisSingleContainer height={500} width={500} data={data}>
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

