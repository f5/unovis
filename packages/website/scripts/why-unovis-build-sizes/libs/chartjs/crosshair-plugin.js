// Chart.js has no crosshair option. This is the usual few-line plugin: a vertical line at the x of the active tooltip
export const crosshair = {
  id: 'crosshair',
  afterDatasetsDraw (chart) {
    const active = chart.tooltip?.getActiveElements()
    if (!active?.length) return
    const { ctx, chartArea: { top, bottom } } = chart
    const x = active[0].element.x
    ctx.save()
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.stroke()
    ctx.restore()
  },
}
