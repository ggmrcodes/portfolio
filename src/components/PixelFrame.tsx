import type { CSSProperties, ReactNode } from 'react'

export type Tone = 'accent' | 'cyan' | 'amber'

interface PixelFrameProps {
  children: ReactNode
  /** Optional fake window title, e.g. "bio.txt" */
  title?: string
  tone?: Tone
  className?: string
}

const toneVar: Record<Tone, string> = {
  accent: 'var(--accent)',
  cyan: 'var(--cyan)',
  amber: 'var(--amber)',
}

/**
 * A bordered panel with a chunky offset shadow. Every "window" on the site
 * is one of these so the look stays consistent.
 */
export function PixelFrame({ children, title, tone = 'accent', className = '' }: PixelFrameProps) {
  return (
    <div className={`pixel-frame ${className}`} style={{ '--frame-shadow': toneVar[tone] } as CSSProperties}>
      {title && (
        <div className="window-bar">
          <i style={{ background: 'var(--accent)' }} />
          <i style={{ background: 'var(--cyan)' }} />
          <i style={{ background: 'var(--amber)' }} />
          <span className="ml-2">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}
