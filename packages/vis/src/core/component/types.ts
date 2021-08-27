// Copyright (c) Volterra, Inc. All rights reserved.

export type VisEventType = 'touchstart' | 'touchmove' | 'touchend' | 'mouseover' | 'mousemove' | 'mousedown' | 'mouseup'
| 'click' | 'auxclick' | 'contextmenu' | 'dblclick' | 'mouseenter' | 'mouseleave' | 'mouseout' | 'scroll'
| 'select'

export type VisEventCallback = (data: any, event?: Event, i?: number, els?: (SVGElement | HTMLElement)[]) => void;
