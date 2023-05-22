import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'
export const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill
