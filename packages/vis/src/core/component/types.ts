export type VisEventType = 'touchstart' | 'touchmove' | 'touchend' | 'mouseover' | 'mousemove' | 'mousedown' | 'mouseup'
| 'click' | 'auxclick' | 'contextmenu' | 'dblclick' | 'mouseenter' | 'mouseleave' | 'mouseout' | 'scroll'
| 'select' | 'wheel' | 'pointerdown' | 'pointerup' | 'pointerout' | 'pointermove'

export type VisEventCallback<Datum = any> =
  ((data: Datum, event: MouseEvent, i: number, els: (SVGElement | HTMLElement)[]) => void) |
  ((data: Datum, event: PointerEvent, i: number, els: (SVGElement | HTMLElement)[]) => void) |
  ((data: Datum, event: TouchEvent, i: number, els: (SVGElement | HTMLElement)[]) => void);
