import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

/** Read the theme index.html already applied, falling back to dark. */
function initialTheme(): Theme {
  const current = document.documentElement.dataset.theme
  return current === 'light' ? 'light' : 'dark'
}

/**
 * Owns the dark / light preference. The value is written to
 * <html data-theme> (which the CSS variables key off) and to localStorage so
 * it survives a reload.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Private mode or storage disabled: the choice just won't persist.
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
