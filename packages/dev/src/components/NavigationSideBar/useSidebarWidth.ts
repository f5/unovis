import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, SIDEBAR_WIDTH_STORAGE_KEY } from './constants'

type SidebarWidth = {
  width: number;
  isResizing: boolean;
  onResizeStart: (event: ReactPointerEvent<HTMLElement>) => void;
  onResizeReset: () => void;
}

function clampWidth (width: number): number {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)))
}

function readStoredWidth (): number {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    return stored && Number.isFinite(Number(stored)) ? clampWidth(Number(stored)) : DEFAULT_SIDEBAR_WIDTH
  } catch {
    return DEFAULT_SIDEBAR_WIDTH
  }
}

export function useSidebarWidth (): SidebarWidth {
  const [width, setWidth] = useState(readStoredWidth)
  const [isResizing, setIsResizing] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width))
    } catch {
      // Storage is unavailable in private windows; the width stays session-only.
    }
  }, [width])

  useEffect(() => {
    if (!isResizing) return

    const onPointerMove = (event: globalThis.PointerEvent): void => {
      const drag = dragRef.current
      if (!drag) return
      setWidth(clampWidth(drag.startWidth + event.clientX - drag.startX))
    }
    const onPointerUp = (): void => {
      dragRef.current = null
      setIsResizing(false)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [isResizing])

  const onResizeStart = useCallback((event: ReactPointerEvent<HTMLElement>): void => {
    event.preventDefault()
    dragRef.current = { startX: event.clientX, startWidth: width }
    setIsResizing(true)
  }, [width])

  const onResizeReset = useCallback((): void => setWidth(DEFAULT_SIDEBAR_WIDTH), [])

  return { width, isResizing, onResizeStart, onResizeReset }
}
