import { useReveal } from '../hooks/useReveal'

interface SectionHeadingProps {
  /** Section id; the heading gets `${id}-title` for aria-labelledby */
  id: string
  index: string
  title: string
  sub?: string
}

export function SectionHeading({ id, index, title, sub }: SectionHeadingProps) {
  // In boring mode the title slides up out of a mask the first time it scrolls into view
  const { ref, inView } = useReveal<HTMLHeadingElement>()

  return (
    <div className="section-head relative mb-10">
      <div className="flex items-center gap-4">
        <span className="section-index font-pixel text-[10px] text-accent" aria-hidden="true">
          {index}
        </span>
        <h2
          ref={ref}
          id={`${id}-title`}
          className={`heading-mask font-pixel text-[clamp(0.95rem,2.6vw,1.5rem)] uppercase leading-relaxed ${inView ? 'is-in' : ''}`}
        >
          <span>{title}</span>
        </h2>
        <span data-fun className="h-[2px] flex-1 bg-line" aria-hidden="true" />
      </div>
      {sub && <p className="mt-3 max-w-2xl text-muted">{sub}</p>}
    </div>
  )
}
