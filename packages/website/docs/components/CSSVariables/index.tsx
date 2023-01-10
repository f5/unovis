import React from 'react'
import CodeBlock from '@theme/CodeBlock'
import useIsBrowser from '@docusaurus/useIsBrowser'

type CSSVariablesProps = {
  vars: string[];
  selector?: string;
  className?: string;
}

export default function CSSVariables ({ selector, vars, className }: CSSVariablesProps): JSX.Element {
  const el = document.querySelector(selector) ?? document.documentElement
  if (useIsBrowser() && el) {
    const getValue = (v: string): string => getComputedStyle(el)?.getPropertyValue(v)
    const variables = vars.map(v => `${v}: ${getValue(v)};`)
    return (
      <CodeBlock language='css' className={className}>
        {selector ? `${selector} {\n  ${variables.join('\n  ')}\n}` : variables.join('\n')}
      </CodeBlock>
    )
  }
  return <div>Loading...</div>
}
