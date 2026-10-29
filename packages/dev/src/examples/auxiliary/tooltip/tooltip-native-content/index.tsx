import React, { useCallback, useState } from 'react'
import { Line, Scatter, TooltipContent } from '@unovis/ts'
import type { LineData } from '@unovis/ts/components/line/types'
import { VisXYContainer, VisAxis, VisLine, VisScatter, VisTooltip } from '@unovis/react'

export const title = 'Native Tooltip Content'
export const subTitle = 'Reactive content and event handlers in a hoverable tooltip'

type Datum = { x: number; y: number }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(true)
  const [data] = useState<Datum[]>([{ x: 1, y: 3 }, { x: 3, y: 8 }, { x: 4, y: 9 }, { x: 9, y: 5 }])
  const x = useCallback((d: Datum) => d.x, [])
  const y = useCallback((d: Datum) => d.y, [])

  return <>
    <button onClick={() => setMounted(!mounted)}>{mounted ? 'Unmount' : 'Mount'} chart</button>
    <span> Tooltip clicks: {count}</span>
    {mounted && <VisXYContainer data={data} height={350} duration={props.duration}>
      <VisLine x={x} y={y} />
      <VisScatter x={x} y={y} size={24} />
      <VisTooltip
        container={document.body}
        allowHover
        followCursor={false}
        hideDelay={500}
        content={{
          [Line.selectors.line]: ({ datum: line }: TooltipContent<LineData>) => <div>Line: {line?.values.length} points</div>,
          [Scatter.selectors.point]: ({ datum }: TooltipContent<Datum>) => <>
            <div>Point: {datum?.x}, {datum?.y}</div>
            <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
          </>,
        }}
      />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>}
  </>
}
