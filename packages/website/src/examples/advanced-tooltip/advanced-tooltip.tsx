/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import { Area, Axis, Scatter, Crosshair, Line, Tooltip, CurveType, StackedBar, ContinuousScale, XYLabelPositioning, XYLabels } from '@unovis/ts'
import {
  VisXYContainer,
  VisLine,
  VisArea,
  VisScatter,
  VisTooltip,
  VisAxis,
  VisXYLabels,
  VisTooltipRef,
  VisStackedBar,
  VisCrosshair,
} from '@unovis/react'

import { data, currencies } from './data'

import './styles.css'

export default function SparklineChart (): JSX.Element {
  const [container, setContainer] = React.useState<HTMLElement | undefined>()
  const tooltip = useRef<VisTooltipRef>(null)
  const tt = new Tooltip({
    container: document.body,
  })
  const events = {
    [Line.selectors.line]: {
      click: (e, i, j) => {
        console.log('hello???', e, i, j)
        tt.show(e.values.reduce((acc, curr) => curr.y + acc, 0) / e.values.length, { x: 100, y: 100 })
      },
      mouseout: () => {
        console.log('bye')
        tooltip.current?.component.hide()
      },
    },
  }

  const x = useCallback(d => Date.parse(d.date), [])
  const labelX = x(data[0])

  function toggleTooltip (d: any, c: any) {
    tt.show
    return [d.date, d[c.id]].join(`${c.symbol} `)
  }
  useEffect(() => {
    setContainer(document.body)
    tt.update()
  }, [])

  return (<>
    <VisTooltip ref={tooltip} container={container}/>
    {currencies.map(c => (
      <div className='sparkline-chart'>
        <div className='label'>
          {c.name}
        </div>
        <VisXYContainer key={c.id} height={75} data={data}>
          <VisLine
            x={useCallback(d => Date.parse(d.date), [])}
            y={useCallback(d => d[c.id], [])}
            events={events}
          />
          <VisCrosshair tooltip={tt} template={d => {
            return toggleTooltip(d, c)
          }}/>
          <VisAxis type='x' tickFormat={Intl.DateTimeFormat().format} tickTextFontSize={0}/>
        </VisXYContainer>
      </div>
    ))}
  </>
  )
}
