import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import CodeBlock from '@theme/CodeBlock'
import useIsBrowser from '@docusaurus/useIsBrowser'

type CSSVariablesProps = {
  vars: string[];
  selector?: string;
  className?: string;
}

export function CSSVariables ({ selector, vars, className }: CSSVariablesProps): JSX.Element {
  if (useIsBrowser() && document.querySelector(selector)) {
    const el = document.querySelector(selector) ?? document.documentElement
    const getValue = (v: string): string => getComputedStyle(el)?.getPropertyValue(v)
    const variables = vars.map(v => `${v}: ${getValue(v)};`)
    return (
      <CodeBlock language='css' className={className}>
        {`${selector} {\n  ${variables.join('\n  ')}\n}`}
      </CodeBlock>
    )
  }
  return <div>Loading...</div>
}
