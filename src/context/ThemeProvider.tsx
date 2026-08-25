import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { ThemeMode } from '../types/database'
import { useAuth } from './AuthProvider'

interface ThemeContextValue {
  accentColor: string
  themeMode: ThemeMode
  setAccentColor: (color: string) => Promise<void>
  setThemeMode: (mode: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const DEFAULT_ACCENT = '#3b82f6'
const DEFAULT_THEME: ThemeMode = 'light'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    document.documentElement.style.setProperty('--accent-hover', accentColor)
    document.documentElement.setAttribute('data-theme', themeMode)
  }, [accentColor, themeMode])

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('accent_color, theme_mode')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.accent_color) setAccentColorState(data.accent_color)
        if (data?.theme_mode) setThemeModeState(data.theme_mode as ThemeMode)
      })
  }, [user])

  const setAccentColor = useCallback(
    async (color: string) => {
      setAccentColorState(color)
      if (user) {
        await supabase.from('profiles').update({ accent_color: color }).eq('id', user.id)
      }
    },
    [user],
  )

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      setThemeModeState(mode)
      if (user) {
        await supabase.from('profiles').update({ theme_mode: mode }).eq('id', user.id)
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({ accentColor, themeMode, setAccentColor, setThemeMode }),
    [accentColor, themeMode, setAccentColor, setThemeMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
