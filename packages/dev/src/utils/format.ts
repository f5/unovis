type DateInput = number | Date;

function fmt (date: DateInput, timeZone: string | undefined, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(new Date(date))
}

// Format option constants (replaces date-fns format strings)
const FMT_HH_MM_SS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
const FMT_HH_MM: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }
const FMT_MONTH_DAY_HH_MM: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
const FMT_MONTH_DAY: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' }
const FMT_MONTH_DAY_YEAR: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' }
const FMT_YEAR_MONTH_DAY_HH_MM: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
const FMT_MONTH_YEAR_DAY_HH_MM: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
const FMT_YEAR_MONTH_DAY_HH_MM_SS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
const FMT_YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' }
const FMT_MONTH: Intl.DateTimeFormatOptions = { month: 'short' }

// ─── Range / axis formatting ──────────────────────────────────────────────────
function getTimeFormatForRange (startDate: Date, endDate: Date): Intl.DateTimeFormatOptions {
  const diff = endDate.getTime() - startDate.getTime()

  if (diff < 1000 * 60 * 60) return FMT_HH_MM_SS // < 1 hour
  if (diff < 1000 * 60 * 60 * 24) return FMT_HH_MM // < 1 day
  if (diff < 1000 * 60 * 60 * 24 * 7) return FMT_MONTH_DAY_HH_MM // < 1 week
  if (diff < 1000 * 60 * 60 * 24 * 365) return FMT_MONTH_DAY // < 1 year
  return FMT_MONTH
}

function getFirstTickTimeFormat (startDate: Date, endDate: Date): Intl.DateTimeFormatOptions {
  const diff = endDate.getTime() - startDate.getTime()
  if (diff < 1000 * 60 * 60 * 24) return FMT_YEAR_MONTH_DAY_HH_MM
  return FMT_MONTH_DAY_YEAR
}

export function formatDateTimeLabel (
  tick: DateInput,
  index: number,
  allTicks: DateInput[],
  timeZone?: string
): string {
  if (allTicks.length < 2) {
    return fmt(tick, timeZone, FMT_YEAR_MONTH_DAY_HH_MM)
  }

  const startDate = new Date(allTicks[0])
  const endDate = new Date(allTicks[allTicks.length - 1])
  const timeFormat = (!startDate || !endDate || startDate.getTime() === endDate.getTime())
    ? FMT_YEAR_MONTH_DAY_HH_MM
    : getTimeFormatForRange(startDate, endDate)

  if (index === 0) {
    return fmt(tick, timeZone, getFirstTickTimeFormat(startDate, endDate))
  }

  const dateTick = new Date(tick)
  const datePrevTick = new Date(allTicks[index - 1])

  if (datePrevTick.getFullYear() !== dateTick.getFullYear()) return fmt(dateTick, timeZone, FMT_YEAR)
  if (datePrevTick.getMonth() !== dateTick.getMonth()) return fmt(dateTick, timeZone, FMT_MONTH)
  if (datePrevTick.getDate() !== dateTick.getDate()) return fmt(tick, timeZone, FMT_MONTH_DAY)
  if (datePrevTick.getHours() !== dateTick.getHours()) return fmt(tick, timeZone, FMT_HH_MM)

  return fmt(tick, timeZone, timeFormat)
}
