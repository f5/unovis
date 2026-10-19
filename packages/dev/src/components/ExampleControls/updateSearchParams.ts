import { SetURLSearchParams } from 'react-router-dom'

let pending: URLSearchParams | undefined

export function updateExampleSearchParams (setSearchParams: SetURLSearchParams, update: (params: URLSearchParams) => void): void {
  if (!pending) {
    pending = new URLSearchParams(window.location.hash.startsWith('#/') ? window.location.hash.split('?')[1] : window.location.search)
    // Commit once after all controls in the current event have updated their values.
    queueMicrotask(() => {
      const params = pending
      pending = undefined
      if (params) setSearchParams(params, { replace: true })
    })
  }
  update(pending)
}
