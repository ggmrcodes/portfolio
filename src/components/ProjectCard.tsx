import { ExternalLink } from 'lucide-react'
import type { CSSProperties } from 'react'
import { CATEGORY_LABELS, type Project } from '../data/projects'
import { GithubIcon } from './BrandIcons'
import { PixelFrame } from './PixelFrame'

interface ProjectCardProps {
  project: Project
  /** 1-based position in the full catalogue, shown as a cartridge number */
  index: number
}

const toneVar = {
  accent: 'var(--accent)',
  cyan: 'var(--cyan)',
  amber: 'var(--amber)',
  violet: 'var(--violet)',
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { title, slug, year, summary, highlights, stack, categories, tone, repo, demo, image } = project

  return (
    <PixelFrame title={`${slug}.app`} tone={tone} className="flex h-full flex-col">
      <div className="pixel-cover relative flex items-end justify-between px-5 pb-3 pt-6" style={{ '--c': toneVar[tone] } as CSSProperties}>
        {image ? (
          <img src={image} alt={`${title} screenshot`} className="max-h-40 w-full object-cover object-top" loading="lazy" />
        ) : (
          <>
            <span className="font-pixel text-2xl" style={{ color: toneVar[tone] }}>
              #{String(index).padStart(2, '0')}
            </span>
            <span className="font-pixel text-[8px] uppercase text-muted">{year}</span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <p className="font-pixel text-[8px] uppercase" style={{ color: toneVar[tone] }}>
          {categories.map((c) => CATEGORY_LABELS[c]).join(' / ')}
        </p>

        <h3 className="font-pixel text-sm leading-relaxed">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{summary}</p>

        <ul className="space-y-2 text-sm">
          {highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span aria-hidden="true" className="mt-[7px] size-2 shrink-0" style={{ background: toneVar[tone] }} />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Tech stack">
          {stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>

        {(repo || demo) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {repo && (
              <a href={repo} target="_blank" rel="noreferrer" className="btn">
                <GithubIcon size={13} /> Code
              </a>
            )}
            {demo && (
              <a href={demo} target="_blank" rel="noreferrer" className="btn btn-primary">
                <ExternalLink size={13} /> Live
              </a>
            )}
          </div>
        )}
      </div>
    </PixelFrame>
  )
}
