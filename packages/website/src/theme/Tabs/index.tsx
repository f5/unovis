import React, { createContext, useContext, useEffect, useRef } from 'react'
import Tabs from '@theme-original/Tabs'
import { useTabs, TabsProps } from '@docusaurus/theme-common/internal'

export type TabWrapperProps = TabsProps & {
  onChange?: (value: string) => void;
}

export default function TabsWrapper (props: TabsProps): JSX.Element {
  const tabs = useTabs(props)
  useEffect(() => props.onChange?.(tabs.selectedValue), [tabs])
  return (
    <>
      <Tabs {...props}/>
    </>
  )
}
