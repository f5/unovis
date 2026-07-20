import { Component } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { data, labels, DataRecord, FormatConfig } from './data'

@Component({
  selector: 'crosshair-stacked-bar',
  templateUrl: './crosshair-stacked-bar.component.html',
  standalone: false,
})
export class CrosshairStackedBarComponent {
  height = 450
  data = data
  x = (d: DataRecord): number => d.year
  y = labels.map((l: FormatConfig) => (d: DataRecord): number => d[l.format])

  legendHTML: SafeHtml

  constructor (private sanitizer: DomSanitizer) {
    this.legendHTML = this.sanitizer.bypassSecurityTrustHtml(
      labels.map(l => `<span style="margin-right: 10px;">${this.getIcon(l)}</span>`).join('')
    )
  }

  getIcon = (f: FormatConfig): string => {
    return `<span class="bi bi-${f.icon}" style="color:${f.color}; margin: 0 4px"></span>${f.label}`
  }

  tooltipTemplate = (d: DataRecord): string => {
    const numberFormat = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format
    const dataLegend = labels.filter(f => d[f.format] > 0)
      .reverse()
      .map(f => `<span>${this.getIcon({ ...f, label: numberFormat(d[f.format] * Math.pow(10, 10)) })}`)
      .join('</span>')
    return `<div><b>${d.year}</b>: ${dataLegend}</div>`
  }
}
