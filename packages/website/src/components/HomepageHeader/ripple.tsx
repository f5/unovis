import React, { useEffect, useRef } from 'react'

import {
  HERO_REDUCED_MOTION_MEDIA_QUERY,
  RIPPLE_AMPLITUDE,
  RIPPLE_AMPLITUDE_VARIATION,
  RIPPLE_AMPLITUDE_VARIATION_WAVELENGTH,
  RIPPLE_BOTTOM_LAG,
  RIPPLE_CONTINUOUS,
  RIPPLE_CONTINUOUS_PERIOD,
  RIPPLE_DELAY,
  RIPPLE_DURATION,
  RIPPLE_INTERVAL,
  RIPPLE_PACKET_LENGTH,
  RIPPLE_POINT_SPACING,
  RIPPLE_WAVELENGTH,
  SPLASH_AMPLITUDE,
  SPLASH_DECAY,
  SPLASH_DURATION,
  SPLASH_SPEED,
  SPLASH_WAVELENGTH,
} from './constants'

// Styles
import s from './ripple.module.css'

type OutlinePoint = {
  x: number;
  y: number;
  /** Outward normal */
  nx: number;
  ny: number;
}

/** Samples the outline of a pill (a rectangle with fully rounded ends) clockwise from the start of its top edge */
function samplePill (width: number, height: number): OutlinePoint[] {
  if (!(width > 0 && height > 0)) return [] // Not laid out yet
  const r = height / 2
  const straight = Math.max(width - height, 0)
  const length = 2 * straight + 2 * Math.PI * r
  const count = Math.max(Math.ceil(length / RIPPLE_POINT_SPACING), 16)
  const points: OutlinePoint[] = []

  for (let i = 0; i < count; i++) {
    let d = i / count * length
    if (d < straight) { // Top edge
      points.push({ x: r + d, y: 0, nx: 0, ny: -1 })
      continue
    }
    d -= straight
    if (d < Math.PI * r) { // Right cap
      const a = d / r - Math.PI / 2
      points.push({ x: width - r + r * Math.cos(a), y: r + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) })
      continue
    }
    d -= Math.PI * r
    if (d < straight) { // Bottom edge
      points.push({ x: width - r - d, y: height, nx: 0, ny: 1 })
      continue
    }
    d -= straight
    const a = d / r + Math.PI / 2 // Left cap
    points.push({ x: r + r * Math.cos(a), y: r + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) })
  }

  return points
}

/**
 * Displacement of an outline point while a wave packet sweeps across the pill from left to right; `progress` goes
 * from 0 to 1. The bottom edge trails the top one, and the crests differ in height along the pill.
 */
function rippleOffset (p: OutlinePoint, width: number, progress: number): number {
  const packet = RIPPLE_PACKET_LENGTH * RIPPLE_WAVELENGTH
  const lag = RIPPLE_BOTTOM_LAG * (1 + p.ny) / 2 // 0 on the top edge, full on the bottom one, blended around the caps
  const front = -packet - lag + progress * (width + 2 * packet + RIPPLE_BOTTOM_LAG)
  const distance = (p.x - front) / RIPPLE_WAVELENGTH
  const envelope = Math.exp(-((distance / RIPPLE_PACKET_LENGTH) ** 2)) * Math.sin(Math.PI * progress)
  const variation = 1 + RIPPLE_AMPLITUDE_VARIATION * Math.sin(2 * Math.PI * p.x / (RIPPLE_AMPLITUDE_VARIATION_WAVELENGTH * RIPPLE_WAVELENGTH))
  return RIPPLE_AMPLITUDE * variation * envelope * Math.cos(2 * Math.PI * distance)
}

/** Displacement of an outline point under a wave that runs across the pill without pause; `time` in milliseconds */
function continuousRippleOffset (p: OutlinePoint, width: number, time: number): number {
  const lag = RIPPLE_BOTTOM_LAG * (1 + p.ny) / 2
  const front = time / RIPPLE_CONTINUOUS_PERIOD * width
  const distance = (p.x - lag - front) / RIPPLE_WAVELENGTH
  const variation = 1 + RIPPLE_AMPLITUDE_VARIATION * Math.sin(2 * Math.PI * p.x / (RIPPLE_AMPLITUDE_VARIATION_WAVELENGTH * RIPPLE_WAVELENGTH))
  return RIPPLE_AMPLITUDE * variation * Math.cos(2 * Math.PI * distance)
}

/** A ring spreading from the point where the pointer crossed the outline */
type Splash = {
  x: number;
  y: number;
  start: number;
}

/** Displacement of an outline point from a splash of the given age, in milliseconds */
function splashOffset (p: OutlinePoint, splash: Splash, age: number): number {
  const radius = age * SPLASH_SPEED
  const distance = (Math.hypot(p.x - splash.x, p.y - splash.y) - radius) / SPLASH_WAVELENGTH
  const envelope = Math.exp(-(distance ** 2)) * Math.exp(-age / SPLASH_DECAY)
  return SPLASH_AMPLITUDE * envelope * Math.cos(2 * Math.PI * distance)
}

type RippleState = {
  time: number;
  /** Progress of the periodic ripple, 0 to 1, or `undefined` between ripples */
  progress: number | undefined;
  splashes: Splash[];
}

function getPath (points: OutlinePoint[], width: number, state: RippleState): string {
  if (!points.length) return ''
  const segments = points.map((p, i) => {
    let offset = RIPPLE_CONTINUOUS
      ? continuousRippleOffset(p, width, state.time)
      : state.progress === undefined ? 0 : rippleOffset(p, width, state.progress)
    for (const splash of state.splashes) offset += splashOffset(p, splash, state.time - splash.start)
    return `${i === 0 ? 'M' : 'L'}${(p.x + p.nx * offset).toFixed(2)} ${(p.y + p.ny * offset).toFixed(2)}`
  })
  return `${segments.join('')}Z`
}

/** A pill-shaped background that ripples every few seconds and splashes when the pointer crosses it. Place it inside a positioned element. */
export function Ripple (): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    let points: OutlinePoint[] = []
    let width = 0
    let frameId = 0
    let timerId = 0
    let rippleStart: number | undefined
    let splashes: Splash[] = []
    let isVisible = false

    const onFrame = (now: number): void => {
      frameId = 0
      splashes = splashes.filter(splash => now - splash.start < SPLASH_DURATION)
      let progress = rippleStart === undefined ? undefined : (now - rippleStart) / RIPPLE_DURATION
      if (progress >= 1) {
        rippleStart = undefined
        progress = undefined
      }
      path.setAttribute('d', getPath(points, width, { time: now, progress, splashes }))
      if (RIPPLE_CONTINUOUS || progress !== undefined || splashes.length) frameId = requestAnimationFrame(onFrame)
    }

    const requestFrame = (): void => {
      if (!frameId && isVisible) frameId = requestAnimationFrame(onFrame)
    }

    const startRipple = (): void => {
      if (document.hidden) return
      rippleStart = performance.now()
      requestFrame()
    }

    const onPointerCross = (e: PointerEvent): void => {
      const rect = svg.getBoundingClientRect()
      splashes.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, start: performance.now() })
      requestFrame()
    }

    const stop = (): void => {
      window.clearTimeout(timerId)
      window.clearInterval(timerId)
      cancelAnimationFrame(frameId)
      timerId = 0
      frameId = 0
    }

    const resizeObserver = new ResizeObserver(() => {
      const rect = svg.getBoundingClientRect()
      width = rect.width
      points = samplePill(rect.width, rect.height)
      path.setAttribute('d', getPath(points, width, { time: performance.now(), progress: undefined, splashes: [] }))
    })

    const reduceMotion = window.matchMedia(HERO_REDUCED_MOTION_MEDIA_QUERY).matches
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      stop()
      isVisible = entry.isIntersecting && !reduceMotion
      if (!isVisible) return
      if (RIPPLE_CONTINUOUS) {
        requestFrame()
        return
      }
      timerId = window.setTimeout(() => {
        startRipple()
        timerId = window.setInterval(startRipple, RIPPLE_INTERVAL)
      }, RIPPLE_DELAY)
    })

    const link = svg.parentElement
    resizeObserver.observe(link)
    intersectionObserver.observe(svg)
    link.addEventListener('pointerenter', onPointerCross)
    link.addEventListener('pointerleave', onPointerCross)
    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      link.removeEventListener('pointerenter', onPointerCross)
      link.removeEventListener('pointerleave', onPointerCross)
    }
  }, [])

  return (
    <svg ref={svgRef} className={s.ripple} aria-hidden="true">
      <path ref={pathRef} className={s.shape}/>
    </svg>
  )
}
