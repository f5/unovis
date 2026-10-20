import React from 'react'

export type TextWithCodeProps = {
  text: string;
}

/** Renders a plain-text sentence with its `backticked` spans as inline code */
export function TextWithCode ({ text }: TextWithCodeProps): JSX.Element {
  return <>{text.split('`').map((part, i) => i % 2 ? <code key={i}>{part}</code> : part)}</>
}
