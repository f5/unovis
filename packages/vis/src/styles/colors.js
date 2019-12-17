// Copyright (c) Volterra, Inc. All rights reserved.

/** Array of default colors */
export const colors = ['#34daa6', '#82acff', '#9874f8', '#ffb541', '#48f28c', '#d5b1ff', '#f0aaca', '#6798ff', '#fd7492', '#00edff', '#ed916e', '#425673', '#d11d55', '#ffcc00', '#a0d6e5', '#f45a6d']

/** Return a CSS Variable name for a given color index */
export const getCSSVarName = i => `--vis-color${i}`
