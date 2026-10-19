import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { CAPTURE_QUIET_MS, CAPTURE_FONTS, CAPTURE_TIMEOUT_MS, CAPTURE_RESOURCE_URL_MAX_LENGTH } from './constants'
import { CaptureSettings } from './settings'

import s from './style.module.css'

export function CaptureFrame ({ settings, children }: { settings: CaptureSettings; children: React.ReactNode }): React.ReactElement {
  const frame = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const fail = useCallback((message: string): void => {
    const element = frame.current
    if (!element) return
    element.dataset.captureReady = 'false'
    element.dataset.captureError ??= message
    delete element.dataset.capturePending
  }, [])

  useLayoutEffect(() => {
    let disposed = false
    const timeout = setTimeout(() => fail('Timed out waiting for capture fonts'), CAPTURE_TIMEOUT_MS)
    const onError = (event: ErrorEvent): void => fail(event.message || 'Uncaught browser error')
    const onRejection = (event: PromiseRejectionEvent): void => fail(`Unhandled promise rejection: ${event.reason instanceof Error ? event.reason.message : String(event.reason)}`)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    const loadFonts = (): void => {
      Promise.all(CAPTURE_FONTS.map(font => document.fonts.load(font)))
        .then(() => document.fonts.ready)
        .then(() => {
          if (disposed) return
          clearTimeout(timeout)
          setFontsReady(true)
        })
        .catch((error: unknown) => {
          if (disposed) return
          clearTimeout(timeout)
          fail(`Failed to load capture fonts: ${error instanceof Error ? error.message : String(error)}`)
        })
    }
    if (document.readyState === 'complete') loadFonts()
    else window.addEventListener('load', loadFonts, { once: true })
    return () => {
      disposed = true
      clearTimeout(timeout)
      window.removeEventListener('load', loadFonts)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [fail])

  useLayoutEffect(() => {
    const element = frame.current
    const example = content.current
    if (!element || !example || !fontsReady) return
    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    let deadline: ReturnType<typeof setTimeout> | undefined
    let animationFrame = 0

    const settle = (): void => {
      if (disposed) return
      element.dataset.captureReady = 'false'
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
      if (element.dataset.captureError) return
      element.dataset.capturePending = 'Waiting for layout to settle'
      deadline ??= setTimeout(() => fail(`Capture timed out: ${element.dataset.capturePending}`), CAPTURE_TIMEOUT_MS)
      timer = setTimeout(() => {
        const error = example.querySelector<HTMLElement>('[data-capture-error]')?.dataset.captureError
        if (error) return fail(error)
        const images = Array.from(example.querySelectorAll('img'))
        const failedImage = images.find(image => image.complete && !image.naturalWidth)
        if (failedImage) return fail(`Image failed to load: ${(failedImage.currentSrc || failedImage.src).slice(0, CAPTURE_RESOURCE_URL_MAX_LENGTH)}`)
        const busy = example.matches('[aria-busy="true"]') ? example : example.querySelector<HTMLElement>('[aria-busy="true"]')
        const pending = document.fonts.status !== 'loaded' ? 'Waiting for fonts'
          : images.some(image => !image.complete) ? 'Waiting for images'
            : busy ? busy.dataset.capturePending || 'Example reports aria-busy="true"' : undefined
        if (pending) {
          element.dataset.capturePending = pending
          return
        }
        animationFrame = requestAnimationFrame(() => {
          animationFrame = requestAnimationFrame(() => {
            if (element.dataset.captureError) return
            element.dataset.captureReady = 'true'
            delete element.dataset.capturePending
            clearTimeout(deadline)
            deadline = undefined
          })
        })
      }, CAPTURE_QUIET_MS)
    }

    const mutations = new MutationObserver(settle)
    mutations.observe(example, { childList: true, subtree: true, attributes: true, characterData: true })
    const resize = new ResizeObserver(settle)
    resize.observe(example)
    example.addEventListener('load', settle, true)
    example.addEventListener('error', settle, true)
    document.fonts.addEventListener('loadingdone', settle)
    settle()

    return () => {
      disposed = true
      clearTimeout(timer)
      clearTimeout(deadline)
      cancelAnimationFrame(animationFrame)
      mutations.disconnect()
      resize.disconnect()
      example.removeEventListener('load', settle, true)
      example.removeEventListener('error', settle, true)
      document.fonts.removeEventListener('loadingdone', settle)
    }
  }, [fontsReady, fail])

  return (
    <div ref={frame} className={s.captureFrame} data-testid="example-capture" data-capture-ready="false" data-capture-pending="Loading fonts"
      style={{ width: settings.width, height: settings.height }}>
      <div ref={content} className={s.captureContent}>{fontsReady && children}</div>
    </div>
  )
}
