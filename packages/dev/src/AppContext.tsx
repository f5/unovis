import React, { createContext, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCaptureSettings } from '@src/capture/settings'

import { CODE_QUERY_PARAMETER, CODE_VISIBLE_VALUE, CODE_HIDDEN_VALUE } from './constants'

type AppContextType = {
  isCodeHidden: boolean;
  setIsCodeHidden: (value: boolean) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (value: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const AppContext = createContext<AppContextType | undefined>(undefined)

function readInitialDarkTheme (): boolean {
  if (typeof window === 'undefined') return false
  const capture = getCaptureSettings()
  if (capture) return capture.theme === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const codeQueryValue = searchParams.get(CODE_QUERY_PARAMETER)
  const isCodeHidden = codeQueryValue === CODE_VISIBLE_VALUE || codeQueryValue === 'true'
    ? false
    : codeQueryValue === CODE_HIDDEN_VALUE || codeQueryValue === 'false'
      ? true
      : process.env.NODE_ENV !== 'production'

  const setIsCodeHidden = useCallback((value: boolean): void => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      next.set(CODE_QUERY_PARAMETER, value ? CODE_HIDDEN_VALUE : CODE_VISIBLE_VALUE)
      return next
    }, { replace: true })
  }, [setSearchParams])
  const [isDarkTheme, setIsDarkTheme] = useState(readInitialDarkTheme)

  useLayoutEffect(() => {
    document.body.classList.toggle('theme-dark', isDarkTheme)
  }, [isDarkTheme])

  return (
    <AppContext.Provider value={{ isCodeHidden, setIsCodeHidden, isDarkTheme, setIsDarkTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
