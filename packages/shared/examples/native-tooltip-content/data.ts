export type DataRecord = { day: number; label: string; revenue: number; orders: number }

export const data: DataRecord[] = [
  { day: 1, label: 'Monday', revenue: 1240, orders: 31 },
  { day: 2, label: 'Tuesday', revenue: 1860, orders: 42 },
  { day: 3, label: 'Wednesday', revenue: 1580, orders: 38 },
  { day: 4, label: 'Thursday', revenue: 2340, orders: 56 },
  { day: 5, label: 'Friday', revenue: 2120, orders: 49 },
  { day: 6, label: 'Saturday', revenue: 2980, orders: 68 },
  { day: 7, label: 'Sunday', revenue: 2640, orders: 61 },
]

export function formatRevenue (value: number): string {
  return `$${value.toLocaleString('en-US')}`
}

export function formatDay (value: number | Date): string {
  return data.find(d => d.day === Number(value))?.label.slice(0, 3) ?? ''
}

export function tooltipTemplate (datum: DataRecord): string {
  return `<div class="day">${datum.label}</div><div class="revenue">${formatRevenue(datum.revenue)}</div><div class="orders">${datum.orders} orders</div>`
}
