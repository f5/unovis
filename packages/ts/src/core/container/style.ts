import { css } from '@/styles/emotion'

export const root = css`
  label: container;

  // On touch screens, a long press on a chart shouldn't start selecting text (or show the iOS callout)
  @media (hover: none) and (pointer: coarse) {
    user-select: none;
    -webkit-touch-callout: none;
  }
`
