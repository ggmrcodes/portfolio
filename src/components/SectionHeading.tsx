interface SectionHeadingProps {
  /** Section id; the heading gets `${id}-title` for aria-labelledby */
  id: string
  index: string
  title: string
  sub?: string
}

export function SectionHeading({ id, index, title, sub }: SectionHeadingProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <span className="font-pixel text-[10px] text-accent" aria-hidden="true">
          {index}
        </span>
        <h2 id={`${id}-title`} className="font-pixel text-[clamp(0.95rem,2.6vw,1.5rem)] uppercase leading-relaxed">
          {title}
        </h2>
        <span className="h-[2px] flex-1 bg-line" aria-hidden="true" />
      </div>
      {sub && <p className="mt-3 max-w-2xl text-muted">{sub}</p>}
    </div>
  )
}
