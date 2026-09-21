import { useLayoutEffect, useState } from 'react'
import { withViewTransition } from '../lib/viewTransition'

/**
 * "I'm boring" mode: strips the retro game layer and leaves a plain,
 * conventional portfolio. The flag lives on <html data-mode>, which the CSS
 * keys off (see the "Boring mode" block in index.css), and in localStorage so
 * the choice survives a reload. index.html applies it before the first paint.
 *
 * Its typeface, Martian Grotesk, is a self-hosted @font-face in index.css.
 * A browser only downloads a font once some text uses it, so fun mode never
 * pays for it and nothing here has to load it.
 */
export function useBoring() {
  const [boring, setBoring] = useState(() => document.documentElement.dataset.mode === 'boring')

  // Layout effect, so the attribute is already set when a view transition snapshots the page
  useLayoutEffect(() => {
    document.documentElement.dataset.mode = boring ? 'boring' : 'fun'
    try {
      localStorage.setItem('mode', boring ? 'boring' : 'fun')
    } catch {
      // Storage disabled: the choice just won't persist.
    }
  }, [boring])

  return { boring, toggle: () => withViewTransition(() => setBoring((b) => !b)) }
}
