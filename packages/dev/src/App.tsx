// Internal Components
import { NavigationSideBar } from '@/components/NavigationSideBar'
import { ThemeSelector } from '@/components/ThemeSelector'
// Examples
import { examples } from '@/examples'
// import '@unovis/ts/styles'
import React from 'react'
import { Outlet } from 'react-router-dom'
// Styles
import s from './App.module.css'


// Unovis base styles (using require to avoid tree-shaking)
// eslint-disable-next-line import/no-unresolved
// require('@unovis/ts/styles')

const App = (): React.ReactNode => {
  return (
    <div className={s.root}>
      <ThemeSelector/>
      <NavigationSideBar exampleGroups={examples} />
      <Outlet />
    </div>
  )
}

export default App
