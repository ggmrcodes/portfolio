import { Award, Briefcase, Users } from 'lucide-react'
import { awards, leadership, work, type Role } from '../data/experience'
import { PixelFrame } from './PixelFrame'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

function RoleRow({ role }: { role: Role }) {
  return (
    <li className="border-b border-line py-4 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="min-w-0 flex-1 font-semibold">{role.title}</h4>
        {role.period && (
          <span className="meta shrink-0 whitespace-nowrap font-pixel text-[8px] text-muted">{role.period}</span>
        )}
      </div>
      <p className="text-sm text-muted">{role.org}</p>
      {role.bullets && role.bullets.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {role.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span aria-hidden="true" className="mt-[7px] size-2 shrink-0 bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading id="experience" index="03" title="Experience" />

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <PixelFrame title="work.log">
              <div className="p-6 md:p-8">
                <h3 className="mb-2 flex items-center gap-3 font-pixel text-[10px] uppercase text-accent">
                  <Briefcase size={14} /> Work
                </h3>
                <ul>
                  {work.map((r) => (
                    <RoleRow key={r.title + r.org} role={r} />
                  ))}
                </ul>
              </div>
            </PixelFrame>
          </Reveal>

          <div className="grid gap-8">
            <Reveal delay={120}>
              <PixelFrame title="awards.log" tone="amber">
                <div className="p-6 md:p-8">
                  <h3 className="mb-2 flex items-center gap-3 font-pixel text-[10px] uppercase text-amber">
                    <Award size={14} /> Awards and certifications
                  </h3>
                  <ul>
                    {awards.map((a) => (
                      <li key={a.title} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{a.title}</p>
                          {a.detail && <p className="text-sm text-muted">{a.detail}</p>}
                        </div>
                        {a.year && (
                          <span className="meta shrink-0 whitespace-nowrap font-pixel text-[8px] text-muted">{a.year}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </PixelFrame>
            </Reveal>

            <Reveal delay={200}>
              <PixelFrame title="leadership.log" tone="cyan">
                <div className="p-6 md:p-8">
                  <h3 className="mb-2 flex items-center gap-3 font-pixel text-[10px] uppercase text-cyan">
                    <Users size={14} /> Leadership and community
                  </h3>
                  <ul>
                    {leadership.map((r) => (
                      <RoleRow key={r.title + r.org} role={r} />
                    ))}
                  </ul>
                </div>
              </PixelFrame>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
