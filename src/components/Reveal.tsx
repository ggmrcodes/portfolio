import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

interface RevealProps {
  children: ReactNode
  /** Stagger in milliseconds */
  delay?: number
  className?: string
}

/** Wraps children in a block that fades and rises in when scrolled into view. */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
