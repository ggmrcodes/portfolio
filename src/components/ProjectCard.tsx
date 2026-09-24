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
  const { title, slug, year, summary, highlights, stack, categories, tone, repo, demo, image, featured, unavailable } = project

  // A featured card spans the grid. When it also has a screenshot, the shot
  // sits beside the text rather than as a banner on top, and is shown whole
  // rather than cropped. Featured without a screenshot just leads by width.
  const split = featured && Boolean(image)

  const media = image ? (
    <div className="shot flex h-full items-center justify-center p-5" style={{ '--c': toneVar[tone] } as CSSProperties}>
      <img
        src={image}
        alt={`${title} on a phone, showing the Thai interface and the language switch`}
        className="max-h-72 w-auto border-2 border-ink"
        loading="lazy"
      />
    </div>
  ) : (
    <div
      className="pixel-cover relative flex items-end justify-between px-5 pb-3 pt-6"
      style={{ '--c': toneVar[tone] } as CSSProperties}
    >
      <span className="font-pixel text-2xl" style={{ color: toneVar[tone] }}>
        #{String(index).padStart(2, '0')}
      </span>
      <span className="meta font-pixel text-[8px] uppercase text-muted">{year}</span>
    </div>
  )

  return (
    <PixelFrame title={`${slug}.app`} tone={tone} className="flex h-full flex-col">
      <div className={split ? 'flex flex-1 flex-col md:flex-row' : 'contents'}>
        <div className={split ? 'shrink-0 border-b-2 border-ink md:w-[300px] md:border-b-0 md:border-r-2' : ''}>
          {media}
        </div>

      <div className={`flex flex-1 flex-col gap-4 p-5 md:p-6 ${featured ? 'measure' : ''}`}>
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

        {!repo && !demo && unavailable && (
          <p className="meta pt-2 text-xs text-muted">{unavailable}</p>
        )}

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
      </div>
    </PixelFrame>
  )
}
