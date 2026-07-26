/** Element size shims.
 *
 * jsdom performs no layout: `clientWidth`/`clientHeight` are always 0 and
 * `getBoundingClientRect()` returns a zero rect. Unovis containers read both
 * to size charts (`ContainerCore.containerWidth/Height` — including
 * `this.element.clientWidth` on the SVG element when explicit width/height
 * are set in the config), so we define real values per element.
 */

export function defineElementSize (element: Element, width: number, height: number): void {
  Object.defineProperties(element, {
    clientWidth: { configurable: true, get: () => width },
    clientHeight: { configurable: true, get: () => height },
  })

  const rect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: (): unknown => ({ width, height }),
  }
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => rect,
  })
}
