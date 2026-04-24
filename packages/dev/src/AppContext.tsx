import React, { createContext, useState, useContext, useLayoutEffect } from 'react'

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
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCodeHidden, setIsCodeHidden] = useState(process.env.NODE_ENV !== 'production')
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
