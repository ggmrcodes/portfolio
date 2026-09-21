import { flushSync } from 'react-dom'

/**
 * Runs a React state update inside a View Transition when the browser has
 * them, so a big visual change cross-fades (and any element with a
 * `view-transition-name` slides to its new place) instead of hard-cutting.
 * flushSync makes React commit inside the callback, which is the moment the
 * browser takes its "after" snapshot. Without support it just runs the update.
 */
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition) return update()
  document.startViewTransition(() => flushSync(update))
}
