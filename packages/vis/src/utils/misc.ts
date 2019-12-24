// Copyright (c) Volterra, Inc. All rights reserved.
export const getBoundingClientRectObject = (element) => {
  const { top, right, bottom, left, width, height, x, y } = element.getBoundingClientRect()
  return { top, right, bottom, left, width, height, x, y }
}
