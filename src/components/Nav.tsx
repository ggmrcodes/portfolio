import { Menu, Moon, Sun, TerminalSquare, X } from 'lucide-react'
import { useState } from 'react'
import type { Theme } from '../hooks/useTheme'
import { profile } from '../data/profile'

interface NavProps {
  theme: Theme
  onToggleTheme: () => void
  onOpenTerminal: () => void
}

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

export function Nav({ theme, onToggleTheme, onOpenTerminal }: NavProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-line bg-base/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#home" className="flex items-center gap-3" aria-label="Back to top">
          <span className="grid size-9 place-items-center border-2 border-accent font-pixel text-[11px] text-accent">
            {'>_'}
          </span>
          <span className="hidden font-pixel text-[9px] uppercase text-muted sm:inline">{profile.nickname}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="font-pixel text-[9px] uppercase text-muted hover:text-accent">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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
              className="block border-b border-line px-5 py-4 font-pixel text-[10px] uppercase text-muted hover:bg-panel hover:text-accent"
            >
              {'> '}
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
