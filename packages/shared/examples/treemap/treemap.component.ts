import { Component } from '@angular/core'
import { colors, Treemap, TreemapNode } from '@unovis/ts'
import { format } from 'd3-format'
import { data, DataRecord } from './data'

@Component({
  selector: 'treemap',
  templateUrl: './treemap.component.html',
  standalone: false,
})
export class TreemapComponent {
  data = data
  categoryColorMap = [] as { key: string; value: string }[]
  legendItems = [] as { name: string; color: string }[]

  constructor () {
    let colorIdx = 0
    for (const d of this.data) {
      if (!this.categoryColorMap.find(g => g.key === d.category)) {
        this.categoryColorMap.push({ key: d.category, value: colors[colorIdx % colors.length] })
        colorIdx++
      }
    }
    this.legendItems = this.categoryColorMap.map(c => ({ name: c.key, color: c.value }))
  }

  populationFormat (value: number): string {
    return `${format(',')(value)}B`
  }

  getValue = (d: DataRecord): number => d.billions
  getLayers = [(d: DataRecord): string => d.category, (d: DataRecord): string => d.name]


  getTooltipContent = (node: TreemapNode<DataRecord>): string => {
    const datum = node?.data?.datum as DataRecord | undefined
    if (!datum) return String(node?.data?.key ?? '')
    return `
      <div><strong>${datum.name}</strong></div>
      <div style="font-size: 12px; color: #666;">Category: ${datum.category}</div>
      <div style="font-size: 12px; color: #666;">Billions: $${datum.billions}B</div>
    `
  }

  tooltipTriggers = { [Treemap.selectors.tile]: this.getTooltipContent }

  tileColor = (node: TreemapNode<DataRecord>): string => {
    const datum = node?.data?.datum as DataRecord | undefined
    const category = datum ? datum.category : node?.data?.key
    const entry = this.categoryColorMap.find(g => g.key === category)
    return entry ? entry.value : '#008877'
  }
}
