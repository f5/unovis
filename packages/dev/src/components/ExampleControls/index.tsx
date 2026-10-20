import React, { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { isPlainObject } from '@unovis/ts'
import { copyText } from '@src/utils/clipboard'
import { COPIED_LABEL_DURATION } from '../ExampleViewer/constants'
import { updateExampleSearchParams } from './updateSearchParams'

import s from './style.module.css'

export function ExampleControls ({ onReset, components }: { onReset?: () => void; components?: string[] }): React.ReactElement {
  const [, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [copyStatus, setCopyStatus] = useState('Copy link')
  useEffect(() => { setCopyStatus('Copy link') }, [location])
  useEffect(() => {
    if (copyStatus === 'Copy link') return
    const timeout = window.setTimeout(() => setCopyStatus('Copy link'), COPIED_LABEL_DURATION)
    return () => window.clearTimeout(timeout)
  }, [copyStatus])

  const reset = (): void => {
    if (onReset) return onReset()
    updateExampleSearchParams(setSearchParams, params => {
      try {
        const parsed: unknown = JSON.parse(params.get('config') ?? '{}')
        const config = isPlainObject(parsed) ? parsed as Record<string, unknown> : {}
        for (const component of components ?? ['example']) delete config[component]
        if (Object.keys(config).length) params.set('config', JSON.stringify(config))
        else params.delete('config')
      } catch { params.delete('config') }
    })
  }

  const copyLink = (): void => {
    copyText(window.location.href).then(copied => setCopyStatus(copied ? 'Copied link' : 'Copy failed'))
  }

  return <div className={s.exampleControls}>
    <button type="button" onClick={reset}>Reset</button>
    <button type="button" onClick={copyLink} data-dev-variant="primary" data-dev-status={copyStatus === 'Copied link' ? 'success' : undefined} aria-live="polite">{copyStatus}</button>
  </div>
}
