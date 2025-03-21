import React, { useCallback, useEffect, useState } from 'react'
import { VisAxis, VisBulletLegend, VisBulletLegendSelectors, VisCrosshair, VisLine, VisScatter, VisTooltip, VisXYContainer } from '@unovis/react'
import { BulletLegendItemInterface, BulletShape, NumericAccessor, colors, CurveType } from '@unovis/ts'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer'

export const title = 'Interpolated Multi-Line Chart'
export const subTitle = 'With interactive bullet legend'

const n = undefined
const layers: Record<string, (number | undefined | null)[]> = {
  y0: [3, 5, 2, 5, n, 3, 4, 5, 4, 2, 5, 2, 4, 2, n, 5],
  y1: [2, 1, n, 2, 2, n, 1, 3, 2, n, 1, 4, 6, 4, 3, 2],
  y2: [5, 6, 7, n, 5, 7, 8, 7, 9, 6, n, 5, n, n, 9, 7],
  y3: [9, n, n, 8, n, n, 5, 6, 5, 5, 4, 3, 2, 1, 2, 0],
}

type Datum = Record<keyof typeof layers, number> & { x: number }

const keys = Object.keys(layers) as (keyof Datum)[]
const data = Array.from({ length: layers.y0.length }, (_, i) => ({
  x: i,
  ...(keys.reduce((o, k) => ({ ...o, [k]: layers[k][i] }), {})),
}))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const x: NumericAccessor<Datum> = d => d.x
  const [y, setY] = useState<NumericAccessor<Datum>[]>()
  const [color, setColor] = useState<string[]>([])

  const [legendItems, setLegendItems] = useState(
    keys.map((name, i) => ({ name, inactive: false, color: colors[i], cursor: 'pointer' }))
  )

  useEffect(() => {
    const updated = legendItems.reduce((obj, item) => {
      if (!item.inactive) obj.colors.push(item.color)
      obj.ys.push(d => (item.inactive ? null : d[item.name]))
      return obj
    }, { colors: new Array<string>(), ys: new Array<NumericAccessor<Datum>>() })
    setY(updated.ys)
    setColor(updated.colors)
  }, [legendItems])

  const updateItems = useCallback((_: BulletLegendItemInterface, index: number) => {
    const newItems = [...legendItems]
    newItems[index].inactive = !newItems[index].inactive
    setLegendItems(newItems)
  }, [legendItems])

  const tooltipTemplate = useCallback((d: Datum): string => legendItems.map(item => `
    <div style="font-size:12px;${item.inactive ? 'text-decoration:line-through;opacity:0.7;color:#ccc">' : '">'}
      <span style="color:${item.color};font-weight:${item.inactive ? '400' : '800'};">${item.name}</span>: ${d[item.name] ?? '-'}
    </div>`
  ).join(''), [legendItems])

  return (
    <div style={{ margin: 50 }}>
      <style>{`
          .square-legend .${VisBulletLegendSelectors.item} {
            --vis-legend-item-spacing: 10px;
            padding: 2px 4px;
          }
          .line-legend .${VisBulletLegendSelectors.bullet} { width: 16px !important; }
          .line-legend .${VisBulletLegendSelectors.bullet} path { stroke-dasharray: 5 3; }

        `}</style>
      <div style={{ display: 'flex', width: 'max-content', padding: '10px 10px 0px 35px' }}>
        <VisBulletLegend className='square-legend' items={legendItems} bulletShape={BulletShape.Square} onLegendItemClick={updateItems}/>
        <VisBulletLegend className='line-legend' items={[{ name: 'No data', color: '#5558', shape: 'line' }]} />
      </div>
      <VisXYContainer yDomain={[0, 10]} data={data} height={400} duration={props.duration}>
        <VisLine lineWidth={2} curveType={CurveType.Linear} x={x} y={y} color={color} interpolateMissingData/>
        <VisScatter size={2} x={x} y={y} color={color}/>
        <VisCrosshair template={tooltipTemplate} color={color}/>
        <VisTooltip/>
        <VisAxis type='x' tickFormat={(d: number) => `0${(Math.floor(d / 6)) + 1}:${d % 6}0pm`}/>
        <VisAxis type='y'/>
      </VisXYContainer>
    </div>
  )
}
