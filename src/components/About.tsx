import { profile } from '../data/profile'
import { PixelFrame } from './PixelFrame'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const facts: [string, string][] = [
  ['school', profile.school],
  ['location', profile.location],
  ['languages', profile.languages.join(', ')],
  ['focus', 'assistive tech, clinical tools, ML'],
]

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading id="about" index="01" title="About" />

        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <Reveal>
            <PixelFrame title="bio.txt">
              <div className="space-y-5 p-6 md:p-8">
                {profile.bio.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed">
                    <span className="mr-3 font-pixel text-[9px] text-accent" aria-hidden="true">
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    {paragraph}
                  </p>
                ))}
              </div>
            </PixelFrame>
          </Reveal>

          <Reveal delay={120}>
            <PixelFrame title="profile.json" tone="cyan">
              <dl className="p-6 md:p-8">
                {facts.map(([key, value]) => (
                  <div key={key} className="flex gap-4 border-b border-line py-3 last:border-0">
                    <dt className="w-24 shrink-0 font-pixel text-[9px] uppercase text-muted">{key}</dt>
                    <dd className="text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </PixelFrame>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-8">
          <PixelFrame title="skills.md" tone="amber">
            <div className="grid gap-6 p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-5">
              {profile.skills.map((group) => (
                <div key={group.group}>
                  <h3 className="mb-3 font-pixel text-[9px] uppercase text-accent">{group.group}</h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="chip">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PixelFrame>
        </Reveal>
      </div>
    </section>
  )
}
