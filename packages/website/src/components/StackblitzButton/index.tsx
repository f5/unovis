import React from 'react'
import { Framework } from '@site/src/types/code'
import { launchStackBlitz } from '@site/src/utils/stackblitz'
import type { Example } from '@unovis/shared/examples/types'

import s from './styles.module.css'

type StackblitzButtonProps = {
  example: Example;
  framework: Framework;
}

export function StackblitzButton (props: StackblitzButtonProps): JSX.Element {
  const { example, framework } = props
  const disabled = !Object.values(Framework).includes(framework)
  return (
    <div className={s.container}>
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
