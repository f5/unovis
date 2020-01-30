// Copyright (c) Volterra, Inc. All rights reserved.
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
