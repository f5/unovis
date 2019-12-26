// Copyright (c) Volterra, Inc. All rights reserved.

/** Array of default colors */
export const colors = ['#04c0c7', '#5144d3', '#e7871a', '#da348f', '#9089fa', '#47e26f', '#2780eb', '#6f38b1', '#debf03', '#cb6f0f', '#268d6c', '#9aec54', '#d11d55', '#ffcc00', '#a0d6e5', '#f45a6d']
// export const colors = ['#34daa6', '#82acff', '#9874f8', '#ffb541', '#48f28c', '#d5b1ff', '#f0aaca', '#6798ff', '#fd7492', '#00edff', '#ed916e', '#425673', '#d11d55', '#ffcc00', '#a0d6e5', '#f45a6d']

/** Return a CSS Variable name for a given color index */
export const getCSSVarName = i => `--vis-color${i}`
