export type TooltipRow = {
  label: string;
  value: string;
  color: string;
}

function tooltipContent (title: string, content: string): string {
  return `<div style="display: grid; grid-template-columns: auto auto; column-gap: 24px; row-gap: 6px; font-size: 12px; line-height: 1.2">
    <span style="grid-column: 1 / -1; font-size: 13px; margin-bottom: 2px">${title}</span>
    ${content}
  </div>`
}

/** A tooltip with a title and one row per series: a color dot and the label on the left, the value right-aligned */
export function seriesTooltip (title: string, rows: TooltipRow[]): string {
  return tooltipContent(title, rows.map(row => `<span style="display: flex; align-items: center; gap: 10px">
      <span style="width: 9px; height: 9px; border-radius: 50%; background: ${row.color}"></span>${row.label}
    </span><span style="text-align: right">${row.value}</span>`).join(''))
}

export function textTooltip (title: string, rows: string[] = []): string {
  return tooltipContent(title, rows.map(row => `<span style="grid-column: 1 / -1">${row}</span>`).join(''))
}
