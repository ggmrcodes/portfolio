import { FileText, Mail, MapPin } from 'lucide-react'
import { profile } from '../data/profile'
import { GithubIcon, LinkedinIcon } from './BrandIcons'
import { PixelFrame } from './PixelFrame'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 py-24 open">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading id="contact" index="04" title="Contact" sub="Email is the fastest way to reach me. I read everything." />

        <Reveal>
          <PixelFrame title="contact.sh">
            <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
              <div>
                <p className="font-pixel text-[clamp(0.8rem,2.2vw,1.25rem)] uppercase leading-relaxed">
                  Let&apos;s build something
                  <br />
                  that actually helps someone.
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <MapPin size={14} /> {profile.location}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a href={`mailto:${profile.email}`} className="btn btn-primary">
                  <Mail size={14} /> Email me
                </a>
                <a href={profile.github} target="_blank" rel="noreferrer" className="btn">
                  <GithubIcon size={14} /> GitHub
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn">
                  <LinkedinIcon size={14} /> LinkedIn
                </a>
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn">
                    <FileText size={14} /> Resume
                  </a>
                )}
              </div>
            </div>
          </PixelFrame>
        </Reveal>
      </div>
    </section>
  )
}
