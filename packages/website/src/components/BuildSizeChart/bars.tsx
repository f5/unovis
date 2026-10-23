import React from 'react'
import { Direction, Orientation, StackedBar } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip } from '@unovis/react'

// Internal Deps
import { libraries } from '@site/src/comparisons/libraries'
import { lineChartBuildSizes, BuildSize } from '@site/src/comparisons/build-sizes'
import { BUILD_SIZE_CHART_HEIGHT } from './constants'

const x = (_: BuildSize, i: number): number => i
const y = (d: BuildSize): number => d.gzipKb
const color = (d: BuildSize): string => d.library === 'unovis' ? 'var(--vis-color0)' : 'var(--ifm-color-emphasis-400)'
const formatLibrary = (i: number): string => {
  const d = lineChartBuildSizes[i]
  return d ? `${libraries[d.library].name} · ${d.gzipKb} KB` : ''
}
const tooltipTriggers = {
  [StackedBar.selectors.bar]: ({ datum }: { datum: BuildSize }) => `
    <b>${libraries[datum.library].name}</b>: ${datum.gzipKb} KB gzipped, ${datum.minKb} KB minified<br/>
    <small>${datum.entry}</small>
  `,
}

export function BuildSizeBars (): JSX.Element {
  return (
    <VisXYContainer data={lineChartBuildSizes} height={BUILD_SIZE_CHART_HEIGHT} yDirection={Direction.South}>
      <VisStackedBar x={x} y={y} color={color} orientation={Orientation.Horizontal} barPadding={0.3}/>
      <VisAxis type="x" tickFormat={(value: number) => `${value} KB`}/>
      <VisAxis type="y" numTicks={lineChartBuildSizes.length} tickFormat={formatLibrary} gridLine={false}/>
      <VisTooltip container={document.body} triggers={tooltipTriggers}/>
    </VisXYContainer>
  )
}
