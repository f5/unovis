// Style properties the component sets itself during render (and animates via transitions).
// `barStyle` values for these keys are merged into those transitions as target values instead
// of being applied as instant inline styles, so they don't get stomped by the next render.
export const MANAGED_BAR_STYLES = new Set(['fill', 'opacity', 'cursor', 'mask'])
