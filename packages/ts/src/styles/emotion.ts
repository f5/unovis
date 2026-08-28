import * as defaultEmotion from '@emotion/css'
import createEmotion from '@emotion/css/create-instance'

export type { CSSInterpolation, CSSObject } from '@emotion/css/create-instance'

// Only spin up a dedicated (differently-keyed) Emotion cache when a CSP nonce
// is actually configured. Without it, behave exactly like the default
// `@emotion/css` singleton (same `css-` class prefix) so non-CSP consumers see
// zero change. A distinct `key` is required once a nonce is used because two
// Emotion caches sharing a page must not both use the default `css` key
// (https://emotion.sh/docs/@emotion/cache#key).
const nonce = globalThis?.UNOVIS_NONCE
const emotion = nonce
  ? createEmotion({ key: 'unovis', nonce })
  : defaultEmotion

export const { css, cx, injectGlobal, keyframes, cache, sheet } = emotion
