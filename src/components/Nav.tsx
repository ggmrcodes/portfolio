import { Menu, Moon, Sun, TerminalSquare, X } from 'lucide-react'
import { useState } from 'react'
import type { Theme } from '../hooks/useTheme'
import { useActiveSection } from '../hooks/useActiveSection'
import { profile } from '../data/profile'

/**
 * The site's mark: a building, because that is what people call me. A tower
 * set back over a wider base, with square windows and a doorway, all drawn on
 * the same square grid the voxel avatar in the hero is built from.
 *
 * The silhouette and the windows are one path with `fill-rule: evenodd`, so
 * the windows are real holes rather than squares painted in the background
 * colour. That keeps the mark correct on any surface it lands on.
 *
 * One window is lit. It is the only thing on the site that is amber.
 * public/favicon.svg draws the same building.
 */
const LIT = { x: 5, y: 2.5, size: 3 } // the top-left window, still on at this hour

const BUILDING = [
  // One outline for the whole silhouette: a tower in the middle, a taller wing
  // on the right, a lower one on the left. The uneven skyline is what makes it
  // read as a building and not a box, especially once it is 16px in a tab.
  'M4 0 H14 V7 H18 V24 H0 V11 H4 Z',
  'M5 2.5 h3 v3 h-3 z', // four windows on the tower, in two rows of two
  'M10 2.5 h3 v3 h-3 z',
  'M5 9 h3 v3 h-3 z',
  'M10 9 h3 v3 h-3 z',
  'M7.5 18.5 h3 v5.5 h-3 z', // doorway, cut all the way to the ground
].join(' ')

function Mark() {
  return (
    <svg viewBox="0 0 18 24" className="h-[19px]" aria-hidden="true" focusable="false">
      <path d={BUILDING} fill="currentColor" fillRule="evenodd" />
      <rect x={LIT.x} y={LIT.y} width={LIT.size} height={LIT.size} fill="var(--amber)" />
    </svg>
  )
}

interface NavProps {
  theme: Theme
  boring: boolean
  onToggleTheme: () => void
  onToggleBoring: () => void
  onOpenTerminal: () => void
}

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

/** The sections the nav tracks, in page order. Defined once so the hook's effect is stable. */
const SECTION_IDS = links.map((l) => l.href.slice(1))

export function Nav({ theme, boring, onToggleTheme, onToggleBoring, onOpenTerminal }: NavProps) {
  const [open, setOpen] = useState(false)
  const active = useActiveSection(SECTION_IDS)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-line bg-base/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#home" className="flex items-center gap-3" aria-label="Back to top">
          <span className="mark grid size-9 place-items-center border-2 border-accent text-accent">
            <Mark />
          </span>
          <span className="hidden font-pixel text-[9px] uppercase text-muted sm:inline">{profile.nickname}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              // aria-current tells a screen reader which section this link points at is
              // the one being read; the CSS marks the same link visually.
              aria-current={active === l.href.slice(1) ? 'true' : undefined}
              className="nav-link font-pixel text-[9px] uppercase text-muted hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleBoring}
            aria-pressed={boring}
            title={boring ? 'Bring the retro game styling back' : 'Turn off the retro game styling'}
            className="h-9 border-2 border-line px-3 font-pixel text-[8px] uppercase text-muted hover:border-ink hover:text-ink"
          >
            {boring ? 'I\u2019m fun' : 'I\u2019m boring'}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid size-9 place-items-center border-2 border-line text-muted hover:border-ink hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            data-fun
            onClick={onOpenTerminal}
            className="grid size-9 place-items-center border-2 border-line text-muted hover:border-accent hover:text-accent"
            aria-label="Open terminal"
            title="Open terminal (`)"
          >
            <TerminalSquare size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center border-2 border-line text-muted hover:border-ink hover:text-ink md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Primary mobile" className="border-t-2 border-line bg-base md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active === l.href.slice(1) ? 'true' : undefined}
              className="nav-link block border-b border-line px-5 py-4 font-pixel text-[10px] uppercase text-muted hover:bg-panel hover:text-accent"
            >
              <span data-fun>{'> '}</span>
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
