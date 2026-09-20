import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref and a boolean that flips to true the first time the element
 * scrolls into view. Used by <Reveal> to fade sections in. Disconnects after
 * the first hit, so content never hides again once shown.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  // Browsers without IntersectionObserver just show everything immediately
  const [inView, setInView] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
