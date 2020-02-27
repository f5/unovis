// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const tooltip = css`
  label: tooltip;
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition: opacity;
  transition-duration: 300ms;
  background-color: white;
  user-select: none;
  z-index: 999999;
  padding: 10px;
  transform: translate(0, -5px);
  border-radius: 3px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);


  &.show {
    opacity: 1;
  }
`
