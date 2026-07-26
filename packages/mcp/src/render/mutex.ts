/** Minimal promise-chain mutex.
 *
 * Renders share one jsdom document and one rAF queue, so they must not
 * interleave. Failures don't poison the chain.
 */
export class Mutex {
  private tail: Promise<unknown> = Promise.resolve()

  run<T> (fn: () => Promise<T>): Promise<T> {
    const result = this.tail.then(fn, fn)
    this.tail = result.catch(() => undefined)
    return result
  }
}
