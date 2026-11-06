export const HERO_GRADIENT_COLORS = {
  yellow: 'rgb(255,214,81)',
  grey: 'rgb(142,141,149)',
  red: 'rgb(226,32,58)',
  dark: 'rgb(23,19,41)',
  blue: '#2780EB',
  sand: 'rgb(190,178,139)',
}

export const HERO_REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

/** The prompt the hero's copy button puts on the clipboard, for adding Unovis to a project with a coding agent */
export const HERO_AGENT_PROMPT = `Add Unovis (https://unovis.dev) to this project as its data visualization library.

- Work out which UI framework the project uses (React, Angular, Vue, Svelte or Solid, or none) and install the matching package together with the core: @unovis/ts plus @unovis/react, @unovis/angular, @unovis/vue, @unovis/svelte or @unovis/solid. Without a framework, @unovis/ts alone is enough.
- Import components, containers, enums and types directly from the modules that define them, never from a package root barrel. For example:
  import { VisXYContainer } from '@unovis/react/containers/xy-container'
  import { VisLine } from '@unovis/react/components/line'
  import { CurveType } from '@unovis/ts/types/curve'
  or, without a framework, import { Line } from '@unovis/ts/components/line'.
- The docs index is at https://unovis.dev/llms.txt. Options are documented in the type definitions with their defaults, so read them from the installed package.
- Keep charts themeable through Unovis' CSS variables and make sure they look right in both light and dark mode.`

export const HERO_COPY_LABELS = {
  idle: 'Copy Prompt',
  copied: 'Copied!',
  error: 'Copy failed — try again',
}

/** How long the copied / failed state shows before the button resets, in milliseconds */
export const HERO_COPY_RESET_DELAY = 2000

/** Whether the wave runs across the announcement without pause instead of as separate ripples */
export const RIPPLE_CONTINUOUS = true
/** How long the continuous wave takes to travel the width of the announcement, in milliseconds */
export const RIPPLE_CONTINUOUS_PERIOD = 5600
/** Time before the announcement's first ripple, and between ripples, in milliseconds */
export const RIPPLE_DELAY = 2000
export const RIPPLE_INTERVAL = 2000
/** How long one ripple takes to sweep across the announcement, in milliseconds */
export const RIPPLE_DURATION = 1400
/** How far the outline bulges out, in pixels */
export const RIPPLE_AMPLITUDE = 0.67
/** How much the crest height varies along the pill, as a fraction of the amplitude, and the wavelength of that variation in ripple wavelengths */
export const RIPPLE_AMPLITUDE_VARIATION = 0.5
export const RIPPLE_AMPLITUDE_VARIATION_WAVELENGTH = 2.6
/** How far the bottom edge trails the top one, in pixels */
export const RIPPLE_BOTTOM_LAG = 36
/** Distance between two crests of the ripple, in pixels */
export const RIPPLE_WAVELENGTH = 48
/** Half-length of the wave packet, in wavelengths */
export const RIPPLE_PACKET_LENGTH = 1.5
/** Distance between the sampled outline points, in pixels */
export const RIPPLE_POINT_SPACING = 2

/** A splash is a ring spreading along the announcement from the point where the pointer crosses its outline */
export const SPLASH_AMPLITUDE = 4
/** How fast the ring spreads, in pixels per millisecond */
export const SPLASH_SPEED = 0.25
/** Distance between the ring's crest and its trough, in pixels */
export const SPLASH_WAVELENGTH = 40
/** Time constant of the ring's fade-out, in milliseconds, and when the splash is dropped altogether */
export const SPLASH_DECAY = 500
export const SPLASH_DURATION = 2000
