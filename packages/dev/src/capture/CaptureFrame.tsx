import React, { useLayoutEffect, useRef, useState } from 'react'

import { CAPTURE_QUIET_MS, CAPTURE_FONTS } from './constants'
import { CaptureSettings } from './settings'

import s from './style.module.css'

export function CaptureFrame ({ settings, children }: { settings: CaptureSettings; children: React.ReactNode }): React.ReactElement {
  const frame = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)

  useLayoutEffect(() => {
    let disposed = false
    const loadFonts = (): void => {
      Promise.all(CAPTURE_FONTS.map(font => document.fonts.load(font)))
        .then(() => document.fonts.ready)
        .then(() => { if (!disposed) setFontsReady(true) })
    }
    if (document.readyState === 'complete') loadFonts()
    else window.addEventListener('load', loadFonts, { once: true })
    return () => {
      disposed = true
      window.removeEventListener('load', loadFonts)
    }
  }, [])

  useLayoutEffect(() => {
    const element = frame.current
    const example = content.current
    if (!element || !example || !fontsReady) return
    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    let animationFrame = 0

    const settle = (): void => {
      if (disposed) return
      element.dataset.captureReady = 'false'
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
      timer = setTimeout(() => {
        const imagesReady = Array.from(example.querySelectorAll('img')).every(image => image.complete && image.naturalWidth > 0)
        if (document.fonts.status !== 'loaded' || !imagesReady || example.matches('[aria-busy="true"]') || example.querySelector('[aria-busy="true"]')) return
        animationFrame = requestAnimationFrame(() => {
          animationFrame = requestAnimationFrame(() => { element.dataset.captureReady = 'true' })
        })
      }, CAPTURE_QUIET_MS)
    }

    const mutations = new MutationObserver(settle)
    mutations.observe(example, { childList: true, subtree: true, attributes: true, characterData: true })
    const resize = new ResizeObserver(settle)
    resize.observe(example)
    example.addEventListener('load', settle, true)
    document.fonts.addEventListener('loadingdone', settle)
    settle()

    return () => {
      disposed = true
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
      mutations.disconnect()
      resize.disconnect()
      example.removeEventListener('load', settle, true)
      document.fonts.removeEventListener('loadingdone', settle)
    }
  }, [fontsReady])

  return (
    <div ref={frame} className={s.captureFrame} data-testid="example-capture" data-capture-ready="false" style={{ width: settings.width, height: settings.height }}>
      <div ref={content} className={s.captureContent}>{fontsReady && children}</div>
    </div>
  )
}
