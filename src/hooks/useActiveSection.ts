import { useEffect, useState } from 'react'

/**
 * Which section is the reader currently in? Used by the nav to mark one link
 * as the current one (see components/Nav.tsx).
 *
 * The rule is the one a reader would describe out loud: the active section is
 * the last one whose top has scrolled past a line just under the nav bar.
 * That is deliberately chosen over IntersectionObserver, which answers a
 * different question ("is any part of this on screen") and leaves gaps where
 * two sections overlap the viewport or where none does.
 *
 * Two cases the simple rule gets wrong on its own, both handled below:
 *   - Above the first section there is nothing to mark, so no link is current.
 *   - At the very bottom the last section may be too short to ever reach the
 *     line, so the end of the page always belongs to the last section.
 *
 * `ids` must be a stable array (define it at module scope). The effect
 * re-subscribes whenever it changes identity.
 */

/** How far below the top of the viewport a section becomes "the one you are reading" */
const LINE = 96 // the nav is 64px tall; a little breathing room under it reads better

export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    let frame = 0

    function measure() {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

      let current: string | null = null
      for (const id of ids) {
        const section = document.getElementById(id)
        if (!section) continue
        if (atBottom || section.getBoundingClientRect().top <= LINE) current = id
      }
      setActive(current)
    }

    // Scroll fires far more often than the screen repaints, so coalesce to one
    // measurement per frame. This reads layout and never writes it.
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ids])

  return active
}
