import { profile } from '../data/profile'

export function Footer() {
  return (
    <footer className="border-t-2 border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>
          Built from scratch with React, TypeScript, Vite and Tailwind.
          {profile.sourceRepo && (
            <>
              {' '}
              <a href={profile.sourceRepo} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                View source
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  )
}
