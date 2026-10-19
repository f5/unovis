import React from 'react'
import { Outlet } from 'react-router-dom'

// Internal Components
import { NavigationSideBar } from '@src/components/NavigationSideBar'
import { ThemeSelector } from '@src/components/ThemeSelector'

// Examples
import { exampleSections } from '@src/examples'

// App Context
import { AppProvider } from '@src/AppContext'

// Styles
import s from './App.module.css'


// Unovis base styles (using require to avoid tree-shaking)
// eslint-disable-next-line import/no-unresolved
require('@unovis/ts/styles')

const App = (): React.ReactNode => {
  return (
    <AppProvider>
      <div className={s.root}>
        <NavigationSideBar exampleSections={exampleSections} />
        <div className={s.content}>
          <ThemeSelector/>
          <Outlet />
        </div>
      </div>
    </AppProvider>
  )
}

export default App
