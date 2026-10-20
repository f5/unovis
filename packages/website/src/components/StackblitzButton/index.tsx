import React, { useEffect, useState } from 'react'
import { Framework } from '@site/src/types/code'
import { launchStackBlitz } from '@site/src/utils/stackblitz'
import type { Example } from '@unovis/shared/examples/types'

import s from './styles.module.css'
import { copyLabels, frameworkLabels } from './constants'

type StackblitzButtonProps = {
  example: Example;
  framework: Framework;
}

export function StackblitzButton (props: StackblitzButtonProps): JSX.Element {
  const { example, framework } = props
  const [copyStatus, setCopyStatus] = useState<keyof typeof copyLabels>('idle')
  const disabled = !Object.values(Framework).includes(framework)
  useEffect(() => setCopyStatus('idle'), [example.pathname, framework])

  const copyPrompt = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(example.prompt.replace('{framework}', frameworkLabels[framework]))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <div className={s.container}>
      <button
        type="button"
        className={s.copyButton}
        aria-label={copyLabels[copyStatus]}
        disabled={disabled}
        title={disabled ? 'Select a framework to copy its prompt' : `Copy the ${frameworkLabels[framework]} chart prompt`}
        onClick={copyPrompt}
      >
        <span role="status" aria-live="polite">{copyLabels[copyStatus]}</span>
      </button>
      <input
        className={s.button}
        type='image'
        onClick={() => disabled
          ? console.error('Open in Stackblitz: no framework selected')
          : launchStackBlitz(framework, example)
        }
        disabled={disabled}
        src="../img/open-in-stackblitz.svg"
        alt="Open in StackBlitz"
      />
    </div>
  )
}
