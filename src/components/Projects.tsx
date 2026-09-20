import { useState } from 'react'
import { CATEGORY_LABELS, projects, type Category } from '../data/projects'
import { ProjectCard } from './ProjectCard'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

type Filter = Category | 'all'

const filters: Filter[] = ['all', 'web', 'mobile', 'ml', 'education']

/**
 * Project gallery with category filters. `active` is the only piece of
 * state; the visible list is derived from it on every render and each
 * project is handed to <ProjectCard> through props.
 */
export function Projects() {
  const [active, setActive] = useState<Filter>('all')

  const visible = active === 'all' ? projects : projects.filter((p) => p.categories.includes(active))

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          id="projects"
          index="02"
          title="Projects"
          sub="Filter by what kind of thing it is. Each card links to the code where it is public."
        />

        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects by category">
          {filters.map((f) => (
            <button key={f} type="button" className="filter" aria-pressed={active === f} onClick={() => setActive(f)}>
              {f === 'all' ? 'All' : CATEGORY_LABELS[f]}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted" aria-live="polite">
            {visible.length} / {projects.length}
          </span>
        </div>

        <ul className="grid gap-6 md:grid-cols-2">
          {visible.map((project, i) => (
            <li key={project.slug}>
              <Reveal delay={i * 70} className="h-full">
                <ProjectCard project={project} index={projects.indexOf(project) + 1} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
