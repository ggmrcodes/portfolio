import { ArrowDown, Mail, TerminalSquare } from 'lucide-react'
import type { CSSProperties } from 'react'
import { profile } from '../data/profile'
import { GithubIcon, LinkedinIcon } from './BrandIcons'

interface HeroProps {
  onOpenTerminal: () => void
}

/** Inline style helper for the staggered boot animation (see .boot in index.css) */
const step = (i: number) => ({ '--i': i }) as CSSProperties

const [firstName, ...rest] = profile.name.split(' ')
const lastName = rest.join(' ')

export function Hero({ onOpenTerminal }: HeroProps) {
  return (
    <section id="home" className="pixel-field relative flex min-h-[92svh] items-center overflow-hidden pt-16">
      {/* Floating pixels, decorative only. Hidden on phones where they collide with text. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <span className="float absolute left-[8%] top-[22%] size-3 bg-accent" style={{ '--d': '0s' } as CSSProperties} />
        <span className="float absolute right-[12%] top-[30%] size-2 bg-cyan" style={{ '--d': '1.2s' } as CSSProperties} />
        <span className="float absolute bottom-[26%] left-[18%] size-2 bg-amber" style={{ '--d': '2.1s' } as CSSProperties} />
        <span className="float absolute bottom-[18%] right-[22%] size-4 border-2 border-line" style={{ '--d': '0.6s' } as CSSProperties} />
        <span className="float absolute right-[30%] top-[14%] size-6 border-2 border-line" style={{ '--d': '1.8s' } as CSSProperties} />
      </div>

      <div className="boot relative mx-auto w-full max-w-6xl px-5 py-20">
        <p style={step(0)} className="text-xs text-muted">
          $ ./boot portfolio.sys
        </p>
        <p style={step(1)} className="mb-8 text-xs text-muted">
          {'> loading profile ........ '}
          <span className="text-accent">OK</span>
        </p>

        <h1 style={step(2)} className="font-pixel text-[clamp(1.15rem,5.2vw,3rem)] uppercase leading-[1.5]">
          {firstName}
          <br />
          {lastName}
        </h1>

        <p style={step(3)} className="mt-5 text-muted">
          {'// friends call me '}
          <span className="font-semibold text-ink">{profile.nickname}</span>
        </p>

        <p style={step(4)} className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          <span className="font-semibold">{profile.role}.</span> {profile.tagline}
        </p>
        <p style={step(5)} className="mt-3 text-sm text-muted">
          {profile.school} · {profile.location}
        </p>

        <div style={step(6)} className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#projects" className="btn btn-primary">
            View projects <ArrowDown size={14} />
          </a>
          <button type="button" onClick={onOpenTerminal} className="btn">
            <TerminalSquare size={14} /> Open terminal
          </button>
          <div className="ml-1 flex items-center gap-1">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-10 place-items-center text-muted hover:text-accent">
              <GithubIcon size={18} />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-10 place-items-center text-muted hover:text-accent">
              <LinkedinIcon size={18} />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className="grid size-10 place-items-center text-muted hover:text-accent">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <p style={step(7)} className="cursor mt-14 hidden text-xs text-muted md:block">
          press <kbd className="border border-line px-1.5 py-0.5 text-ink">`</kbd> for the terminal
        </p>
      </div>
    </section>
  )
}
