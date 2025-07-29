<script lang='ts'>
  import { VisSingleContainer, VisTreemap, VisBulletLegend, VisTooltip } from '@unovis/svelte'
  import { data, DataRecord } from './data'
  import { colors, Position, Treemap } from '@unovis/ts'
  import { format } from 'd3-format'

  // Assign a unique color to each category using the Unovis color palette
  const categoryColorMap: { key: string; value: string }[] = []
  let colorIdx = 0
  for (const d of data) {
    if (!categoryColorMap.find(g => g.key === d.category)) {
      categoryColorMap.push({ key: d.category, value: colors[colorIdx % colors.length] })
      colorIdx++
    }
  }

  // Prepare legend items by category
  const legendItems = categoryColorMap.map(c => ({ name: c.key, color: c.value }))
  const populationFormat = (value: number): string => `${format(',')(value)}B`

  // Tooltip content generator
  function getTooltipContent (node: any): string {
    const datum = node.data.datum as DataRecord | undefined
    if (!datum) return node.data.key
    return `
      <div><strong>${datum.name}</strong></div>
      <div style="font-size: 12px; color: #666;">Category: ${datum.category}</div>
      <div style="font-size: 12px; color: #666;">Billions: $${datum.billions}B</div>
    `
  }
</script>

<VisBulletLegend items={legendItems} />
<VisSingleContainer height={400} data={data}>
  <VisTooltip
    horizontalPlacement={Position.Center}
    triggers={{ [Treemap.selectors.tile]: getTooltipContent }}
  />
  <VisTreemap
    numberFormat={populationFormat}
    value={d => d.billions}
    layers={[d => d.category, d => d.name]}
    labelOffsetX={6}
    labelOffsetY={8}
    tilePadding={4}
    tilePaddingTop={20}
    enableTileLabelFontSizeVariation={true}
    showTileClickAffordance={true}
    labelInternalNodes={true}
    tileColor={node => {
      const datum = node.data.datum
      const category = datum ? datum.category : node.data.key
      const entry = categoryColorMap.find(g => g.key === category)
      return entry ? entry.value : '#008877'
    }}
  />
</VisSingleContainer>

