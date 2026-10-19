import { CAPTURE_DEFAULTS, CAPTURE_MAX_SIZE } from './constants'

export type CaptureSettings = {
  width: number;
  height: number;
  seed: number;
  time: number;
  theme: string;
}

export function getCaptureSettings (): CaptureSettings | undefined {
  if (typeof window === 'undefined') return undefined
  const query = window.location.hash.startsWith('#/')
    ? window.location.hash.split('?')[1]
    : window.location.search
  const params = new URLSearchParams(query)
  if (params.get('capture') !== '1') return undefined

  const number = (key: 'width' | 'height' | 'seed' | 'time'): number => {
    const value = Number(params.get(key))
    return params.has(key) && Number.isFinite(value) ? value : CAPTURE_DEFAULTS[key]
  }

  return {
    width: Math.max(1, Math.min(CAPTURE_MAX_SIZE, Math.round(number('width')))),
    height: Math.max(1, Math.min(CAPTURE_MAX_SIZE, Math.round(number('height')))),
    seed: number('seed'),
    time: number('time'),
    theme: params.get('theme') === 'dark' ? 'dark' : CAPTURE_DEFAULTS.theme,
  }
}
