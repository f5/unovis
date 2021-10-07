// Copyright (c) Volterra, Inc. All rights reserved.
import { Rect } from 'types/misc'
import { isString } from 'utils/data'

export const getBoundingClientRectObject = (element: HTMLElement):
{ top: number; right: number; bottom: number; left: number; width: number; height: number; x: number; y: number } => {
  const { top, right, bottom, left, width, height, x, y } = element.getBoundingClientRect()
  return { top, right, bottom, left, width, height, x, y }
}

export function guid (): string {
  const s4 = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

export function stringToHtmlId (str: string): string {
  return (str || '').replace(/\W/g, '_')
}

export function isStringCSSVariable (s: string): boolean {
  return isString(s) ? (s.substring(0, 6) === 'var(--') : false
}

export function getCSSVariableValue (s: string, context: HTMLElement | SVGGElement): string {
  if (!isString(s)) return ''
  const variableName = s.substr(4, s.length - 5)
  return getComputedStyle(context).getPropertyValue(variableName)
}

export function rectIntersect (rect1: Rect, rect2: Rect): boolean {
  const [left1, top1, right1, bottom1] = [rect1.x, rect1.y + rect1.height, rect1.x + rect1.width, rect1.y]
  const [left2, top2, right2, bottom2] = [rect2.x, rect2.y + rect2.height, rect2.x + rect2.width, rect2.y]

  return !(top1 < bottom2 || top2 < bottom1 || right1 < left2 || right2 < left1)
}
