import React, { SyntheticEvent } from 'react'
import ColorModeToggle from '@theme-original/ColorModeToggle'
import useIsBrowser from '@docusaurus/useIsBrowser'

type ColorModeToggleProps = {
  onChange: (e: SyntheticEvent) => void;
  value: 'light' | 'dark';
}
export default function ColorModeToggleWrapper (props: ColorModeToggleProps): JSX.Element {
  const isBrowser = useIsBrowser()
  const updateTheme = React.useCallback(() => document.body.classList.toggle('theme-dark'), [])

  React.useEffect(() => {
    if (isBrowser && document.documentElement.getAttribute('data-theme') === 'dark') {
      updateTheme()
    }
  }, [isBrowser])
  return (
    <ColorModeToggle {...props} onChange={e => {
      props.onChange(e)
      updateTheme()
    }}/>
  )
}
