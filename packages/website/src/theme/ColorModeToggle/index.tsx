import React, { SyntheticEvent } from 'react'
import ColorModeToggle from '@theme-original/ColorModeToggle'
import useIsBrowser from '@docusaurus/useIsBrowser'


type ColorModeToggleProps = {
  checked: boolean;
  onChange: (e: SyntheticEvent) => void;
  value: 'light' | 'dark';
  rest: any;
}
export default function ColorModeToggleWrapper (props: ColorModeToggleProps): JSX.Element {
  const isBrowser = useIsBrowser()
  if (isBrowser && props.value === 'dark') {
    document.body.classList.add('theme-dark')
  }

  return (
    <ColorModeToggle {...props}
      className=''
      onChange={e => {
        props.onChange(e)
        if (isBrowser) {
          document.body.classList.toggle('theme-dark')
        }
      }} />
  )
}
