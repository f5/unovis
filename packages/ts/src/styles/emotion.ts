import createEmotion from '@emotion/css/create-instance'
import type { Options } from '@emotion/css/create-instance'

export type { CSSInterpolation, CSSObject } from '@emotion/css/create-instance'

const EMOTION_KEY = 'unovis'

const options: Options = {
  key: EMOTION_KEY,
  nonce: globalThis?.UNOVIS_NONCE,
}

const emotion = createEmotion(options)

export const { css, cx, injectGlobal, keyframes, cache, sheet } = emotion
