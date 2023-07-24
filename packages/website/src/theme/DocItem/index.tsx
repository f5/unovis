import React from 'react'
import DocItem from '@theme-original/DocItem'

import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'
import { useLocation } from '@docusaurus/router'
import useGlobalData from '@docusaurus/useGlobalData'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useCurrentSidebarCategory } from '@docusaurus/theme-common'
import { useDocsSidebar, findSidebarCategory } from '@docusaurus/theme-common/internal'

export default function DocItemWrapper (props) {
  const componentDocs = findSidebarCategory(
    useDocsSidebar().items,
    sidebar => sidebar.label === 'Component Reference'
  )
  const category = useCurrentSidebarCategory()
  console.log(componentDocs)
  // console.log(componentDocs, category, internal.useDocsSideBar().items.includes(category))
  return (
    <>
      <DocItem {...props}/>
    </>
  )
}
