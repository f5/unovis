import React from 'react'

// Styles
import s from './style.module.css'

export function ThemeSelector (): React.ReactNode {
  const toggleTheme = (e: React.FormEvent): void => {
    document.body.classList.toggle((e.target as Element).id)
  }

  return (
    <div onChange={toggleTheme} className={s.themeSelector}>
      <label className={s.colorTheme}>
        <input type='checkbox' id='theme-dark'/>
        <div className='slider'>
          <span className='fa-solid fa-sun'/>
          <span className='fa-solid fa-moon'/>
        </div>
      </label>
      <label className={s.patternTheme}>
        <input type='checkbox' id='theme-patterns'/>
        <span className='fa-solid fa-magic-wand-sparkles'/>
      </label>
    </div>
  )
}
