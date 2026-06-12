// Types
import { GenericAccessor } from 'types/accessor'

// Styles
import { getFillPatternId, getMarkerPatternId, getPatternById, FillPattern, FillPatternType, LinePattern, LinePatternType } from 'styles/patterns'

// Utils
import { getValue } from 'utils/data'

/** Attribute set on chart paths to carry the series index, used by the `theme-patterns` CSS fallback. */
export const UNOVIS_PATTERN_INDEX_ATTR = 'unovis-pattern-index'

/** Resolves a `pattern` accessor (constant or function) to a built-in pattern definition, or `null`. */
export function getPattern<T> (
  d: T,
  accessor: GenericAccessor<FillPatternType | LinePatternType, T>,
  index?: number
): FillPattern | LinePattern | null {
  const id = getValue<T, FillPatternType | LinePatternType>(d, accessor, index)
  return id ? getPatternById(id) : null
}

/** Returns the CSS `mask` value (`url(#...)`) for a resolved fill pattern, or `null`. */
export function getFillPatternValue (p: FillPattern | LinePattern | null): string | null {
  if (!p || !('svg' in p)) return null
  return `url(#${getFillPatternId(p.id)})`
}

/** Returns the `marker` (`url(#...)`) and `stroke-dasharray` values for a resolved line pattern, or `null`. */
export function getLinePatternValue (p: FillPattern | LinePattern | null): { marker: string | null; dashArray: string | null } | null {
  if (!p || !('marker' in p)) return null
  return {
    marker: `url(#${getMarkerPatternId(p.id)})`,
    dashArray: p.dashArray?.length ? p.dashArray.join(' ') : null,
  }
}
