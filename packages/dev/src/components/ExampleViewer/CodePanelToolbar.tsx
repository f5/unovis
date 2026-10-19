import React, { useEffect, useState } from 'react'
import { useActiveCode, useSandpack } from '@codesandbox/sandpack-react'

// Styles
import s from './style.module.css'

import { COPIED_LABEL_DURATION } from './constants'

/** `navigator.clipboard` is denied outside a focused secure context, so fall back to a detached selection. */
async function copyText (text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    const didCopy = document.execCommand('copy')
    document.body.removeChild(textArea)
    return didCopy
  }
}

export type CodePanelToolbarProps = {
  title: string;
  subTitle?: string;
  onClose: () => void;
}

export function CodePanelToolbar (props: CodePanelToolbarProps): React.ReactElement {
  const { code } = useActiveCode()
  const { sandpack } = useSandpack()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = window.setTimeout(() => setIsCopied(false), COPIED_LABEL_DURATION)
    return () => window.clearTimeout(timeout)
  }, [isCopied])

  const copyActiveFile = (): void => {
    copyText(code).then(setIsCopied)
  }

  return (
    <div className={s.codeToolbar}>
      <div className={s.codeToolbarText}>
        <div className={s.codeToolbarTitle}>{props.title}</div>
        {props.subTitle && <div className={s.codeToolbarSubTitle}>{props.subTitle}</div>}
      </div>
      <button
        className={s.codeToolbarButton}
        onClick={copyActiveFile}
        title={`Copy ${sandpack.activeFile.replace(/^\//, '')}`}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </button>
      <button className={s.codeToolbarButton} onClick={props.onClose} title="Hide the source code panel" aria-label="Hide source code">✕</button>
    </div>
  )
}
