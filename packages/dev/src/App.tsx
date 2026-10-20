import React from 'react'
import { Outlet } from 'react-router-dom'

// Internal Components
import { NavigationSideBar } from '@src/components/NavigationSideBar'

// Examples
import { exampleSections } from '@src/examples'

// App Context
import { AppProvider } from '@src/AppContext'
import { getCaptureSettings } from '@src/capture/settings'

// Styles
import s from './App.module.css'
import controls from './controls.module.css'


// Unovis base styles (using require to avoid tree-shaking)
// eslint-disable-next-line import/no-unresolved
require('@unovis/ts/styles')

const App = (): React.ReactNode => {
  const capture = getCaptureSettings()
  return (
    <AppProvider>
      <div className={`${s.root} ${controls.devControls} ${capture ? s.capture : ''}`}>
        {!capture && <NavigationSideBar exampleSections={exampleSections} />}
        <div className={s.content}>
          <Outlet />
        </div>
      </div>
    </AppProvider>
  )
}

export default App
