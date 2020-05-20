// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const tooltip = css`
  label: tooltip;
  display: inline-block;
  left: 0;
  bottom: 0;
  min-width: max-content;
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition: opacity;
  transition-duration: 300ms;
  user-select: none;
  z-index: 999999;
  padding: 15px 20px;
  transform: translate(0, -5px);
  
  /* object-fit: contain; */
  border-radius: 5px;
  box-shadow: 0 13px 25px 0 rgba(172, 179, 184, 0.35);
  border: solid 1px #e5e9f7;
  background-color: #ffffff;
`

export const show = css`
  opacity: 1;
`
