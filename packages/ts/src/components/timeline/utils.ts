import type { NumericAccessor, StringAccessor } from 'types/accessor'
import { Arrangement } from 'types/position'
import { getNumber, getString, getValue } from 'utils/data'

export const getIconBleed = <Datum>(
  datum: Datum,
  idx: number,
  icon: StringAccessor<Datum>,
  iconSize: NumericAccessor<Datum>,
  iconArrangement: StringAccessor<Datum>,
  rowHeight: number
): number => {
  const iconValue = getString(datum, icon, idx)
  if (!iconValue) return 0

  const size = getNumber(datum, iconSize, idx) || rowHeight
  const arrangement = getValue(datum, iconArrangement, idx)

  return (arrangement === Arrangement.Outside) ? size
    : (arrangement === Arrangement.Center) ? size / 2
      : 0
}
