import React from 'react'
import { VisFlowLegend } from '@unovis/react'

import s from './styles.module.css'

export const title = 'Basic Flow Legend'
export const subTitle = ''

const legendItems = ['Source', 'Process', 'Destination']

export const component = (): React.ReactNode => {
  return (
    <>
      <p>Custom Width 400px</p>
      <div className={s.flowLegend}>
        <VisFlowLegend
          items={legendItems}
          customWidth={400}
        />
      </div>
      <div className={s.flowLegend}>
        <VisFlowLegend
          customWidth={400}
          items={[legendItems[0], legendItems[2]]}
        />
      </div>
      <div className={s.flowLegend}>
        <VisFlowLegend
          items={[legendItems[0]]}
          customWidth={400}
        />
      </div>
      <p>Configured Spacing 25px</p>
      <div className={s.flowLegend}>
        <VisFlowLegend
          spacing={25}
          items={legendItems}
        />
      </div>
    </>
  )
}


