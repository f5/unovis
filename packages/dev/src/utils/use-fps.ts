import { useEffect, useState } from 'react'

export type UseFpsOptions = {
  /** Recalculate the FPS every x frames. Default: `5` */
  every?: number;
}

/** Frames per second, averaged over the last `every` frames.
 * A React port of VueUse's `useFps` (https://vueuse.org/core/useFps/) */
export function useFps ({ every = 5 }: UseFpsOptions = {}): number {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (typeof performance === 'undefined') return

    let last = performance.now()
    let ticks = 0
    let frameId = requestAnimationFrame(function tick (): void {
      ticks += 1
      if (ticks >= every) {
        const now = performance.now()
        setFps(Math.round(1000 / ((now - last) / ticks)))
        last = now
        ticks = 0
      }
      frameId = requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frameId)
  }, [every])

  return fps
}
