import { Treemap, TreemapNode, Tooltip, SingleContainer, BulletLegend, Position, colors } from '@unovis/ts'
import { data, DataRecord } from './data'

// Sort data by billions in descending order
const sortedData = [...data].sort((a, b) => b.billions - a.billions)

// Assign a unique color to each category using the Unovis color palette
const categoryColorMap: { key: string; value: string }[] = []
let colorIdx = 0
for (const d of sortedData) {
  if (!categoryColorMap.find(g => g.key === d.category)) {
    categoryColorMap.push({ key: d.category, value: colors[colorIdx % colors.length] })
    colorIdx++
  }
}
const container = document.getElementById('vis-container')
container.innerHTML = '<h3>Most Common Password Categories</h3>'

const populationFormat = (value: number): string => `${value.toLocaleString()}B`
const legendItems = categoryColorMap.map(c => ({ name: c.key, color: c.value }))

const legend = new BulletLegend(container, { items: legendItems })
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

const chart = new SingleContainer(container, {
  component: new Treemap<DataRecord>({
    value: (d: DataRecord) => d.billions,
    layers: [(d: DataRecord) => d.category, (d: DataRecord) => d.name],
    tileColor: (node: TreemapNode<DataRecord>) => {
      const datum = node.data.datum as DataRecord | undefined
      const category = datum ? datum.category : node.data.key
      const entry = categoryColorMap.find(g => g.key === category)
      return entry ? entry.value : '#008877'
    },
    tileLabel: (node: TreemapNode<DataRecord>) => {
      const datum = node.data.datum as DataRecord | undefined
      return datum ? `${datum.name}: $${populationFormat(datum.billions)}` : String(node.data.key || '')
    },
    labelOffsetX: 6,
    labelOffsetY: 8,
    tilePadding: 4,
    tilePaddingTop: 20,
    enableTileLabelFontSizeVariation: true,
    showTileClickAffordance: true,
    labelInternalNodes: true,
  }),
  tooltip: new Tooltip({
    horizontalPlacement: Position.Center,
    triggers: {
      [Treemap.selectors.tile]: getTooltipContent,
    },
  }),
  height: 400,
}, data)
