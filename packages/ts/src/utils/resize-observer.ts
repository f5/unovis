import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'
export const ResizeObserver = globalThis.ResizeObserver || ResizeObserverPolyfill
