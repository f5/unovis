import React, { useState } from 'react'
import { Arrangement, Scale, Timeline, TimelineArrow } from '@unovis/ts'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DEPLOYMENT_ICON_PATH, ICON_SIZE, ICON_VIEW_BOX, INCIDENT_ICON_PATH, WEEK_END, WEEK_START } from './constants'
import { EventKind, TimelineEvent, kinds, formatDay, formatRange, getKindLabel } from './data'

const color = (d: TimelineEvent): string => `var(--vis-color${kinds.findIndex(k => k.key === d.kind)})`
const tooltipTriggers = {
  [Timeline.selectors.line]: (d: TimelineEvent) => `<b>${d.title}</b><div>${d.service} · ${getKindLabel(d.kind)}</div><div>${formatRange(d)}</div>`,
}

// Line icons are SVG symbols in the container's `svgDefs`, their color goes to `currentColor`
const svgDefs = `
  <symbol id="deployment-icon" viewBox="${ICON_VIEW_BOX}"><path d="${DEPLOYMENT_ICON_PATH}" fill="currentColor"/></symbol>
  <symbol id="incident-icon" viewBox="${ICON_VIEW_BOX}"><path d="${INCIDENT_ICON_PATH}" fill="currentColor"/></symbol>
`

export default function UnovisTimeline ({ data, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<EventKind, boolean>>>({})
  const toggleKind = (_: unknown, i: number): void => setHidden({ ...hidden, [kinds[i].key]: !hidden[kinds[i].key] })
  const legendItems = kinds.map(k => ({ name: k.label, inactive: hidden[k.key] }))
  const visible = data.filter(d => !hidden[d.kind])

  // An arrow from every incident's cause to the incident, when both are shown
  const arrows: TimelineArrow[] = preset === 'arrows'
    ? visible.filter(d => visible.some(c => c.id === d.causeId)).map(d => ({ id: d.id, lineSourceId: d.causeId, lineTargetId: d.id }))
    : undefined
  const withIcons = preset === 'icons'

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleKind}/>
      <VisXYContainer data={visible} height={296} xScale={Scale.scaleTime()} xDomain={[WEEK_START, WEEK_END]} svgDefs={withIcons ? svgDefs : undefined}>
        <VisTimeline
          x={(d: TimelineEvent) => d.start}
          lineDuration={(d: TimelineEvent) => d.end - d.start}
          lineRow={(d: TimelineEvent) => d.service}
          id={(d: TimelineEvent) => d.id}
          color={color}
          showRowLabels
          // The rows are 22px high by default, `undefined` divides the chart height between them
          rowHeight={undefined}
          lineCap={preset === 'rounded'}
          arrows={arrows}
          lineStartIcon={withIcons ? (d: TimelineEvent) => d.kind === 'incident' ? '#incident-icon' : undefined : undefined}
          lineStartIconColor={color}
          lineStartIconSize={ICON_SIZE}
          lineStartIconArrangement={Arrangement.Outside}
          lineEndIcon={withIcons ? (d: TimelineEvent) => d.kind === 'deployment' ? '#deployment-icon' : undefined : undefined}
          lineEndIconColor={color}
          lineEndIconSize={ICON_SIZE}
          lineEndIconArrangement={Arrangement.Outside}
        />
        <VisAxis type="x" numTicks={7} tickFormat={(t: number | Date) => formatDay(+t)}/>
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisXYContainer>
    </>
  )
}
