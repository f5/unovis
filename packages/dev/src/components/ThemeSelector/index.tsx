import React from 'react'

import { useAppContext } from '@src/AppContext'


// Styles
import s from './style.module.css'

export function ThemeSelector (): React.ReactNode {
  const { isCodeHidden, setIsCodeHidden, isDarkTheme, setIsDarkTheme } = useAppContext()

  const onDarkModeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsDarkTheme(e.currentTarget.checked)
  }

  const onPatternsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    document.body.classList.toggle('theme-patterns', e.currentTarget.checked)
  }

  return (
    <div className={s.themeSelector}>
      <label className={s.toolbarItem} title="Toggle light / dark theme">
        <input
          type='checkbox'
          id='theme-dark'
          checked={isDarkTheme}
          onChange={onDarkModeChange}
        />
        <span className={`fa-solid ${isDarkTheme ? 'fa-moon' : 'fa-sun'}`} aria-hidden />
      </label>
      <label className={s.toolbarItem} title="Toggle background patterns">
        <input type='checkbox' id='theme-patterns' onChange={onPatternsChange}/>
        <span className='fa-solid fa-magic-wand-sparkles' aria-hidden />
      </label>
      <button
        type='button'
        className={s.toolbarItem}
        data-on={isCodeHidden ? 'false' : 'true'}
        title='See Source Code'
        aria-label={isCodeHidden ? 'Show source code' : 'Hide source code'}
        aria-pressed={!isCodeHidden}
        onClick={() => setIsCodeHidden(!isCodeHidden)}
      >
        <span className='fa-solid fa-code' aria-hidden />
      </button>
    </div>
  )
}
