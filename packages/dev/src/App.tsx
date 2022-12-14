import React from 'react'
import { Outlet } from 'react-router-dom'

// Internal Components
import { NavigationSideBar } from '@src/components/NavigationSideBar'

// Examples
import { examples } from '@src/examples'

// Styles
import s from './App.module.css'

// Unovis base styles (using require to avoid tree-shaking)
// eslint-disable-next-line import/no-unresolved
require('@unovis/ts/styles')

const App = (): JSX.Element => {
  return (
    <div className={s.root}>
      <NavigationSideBar exampleGroups={examples} />
      <Outlet />
    </div>
  )
}

export default App
