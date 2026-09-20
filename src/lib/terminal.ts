import { profile } from '../data/profile'
import { CATEGORY_LABELS, projects } from '../data/projects'
import { awards, work } from '../data/experience'

/**
 * The terminal is split in two: this file is a pure function that turns a
 * command string into output lines plus an optional side effect ("action"),
 * and components/Terminal.tsx owns the React state and performs the action.
 * Keeping the parsing here means it has no dependency on React and can be
 * reasoned about (or unit-tested) on its own.
 */
export type TerminalAction =
  | { type: 'clear' }
  | { type: 'theme' }
  | { type: 'open'; url: string }
  | { type: 'scroll'; id: string }

export interface TerminalResult {
  lines: string[]
  action?: TerminalAction
}

const HELP: [string, string][] = [
  ['help', 'show this list'],
  ['about', 'who I am'],
  ['projects', 'list projects (alias: ls)'],
  ['open <slug>', 'open a project repo in a new tab'],
  ['skills', 'grouped skill list'],
  ['experience', 'work and awards'],
  ['contact', 'email, GitHub, LinkedIn'],
  ['goto <section>', 'scroll to about | projects | experience | contact'],
  ['theme', 'toggle dark / light'],
  ['clear', 'clear the screen'],
]

const SECTIONS = ['about', 'projects', 'experience', 'contact']

export function runCommand(raw: string): TerminalResult {
  const [cmd = '', ...args] = raw.trim().split(/\s+/)

  switch (cmd.toLowerCase()) {
    case '':
      return { lines: [] }

    case 'help':
    case '?':
      return { lines: HELP.map(([c, d]) => `${c.padEnd(16)} ${d}`) }

    case 'whoami':
      return { lines: [profile.name, `aka ${profile.nickname}`] }

    case 'about':
      return { lines: [profile.name, profile.role, profile.school, '', ...profile.bio] }

    case 'ls':
    case 'projects':
      return {
        lines: projects.map(
          (p) =>
            `${p.slug.padEnd(14)} ${p.title}  [${p.categories.map((c) => CATEGORY_LABELS[c]).join(', ')}]`,
        ),
      }

    case 'open': {
      const slug = args[0]?.toLowerCase()
      if (!slug) {
        return { lines: ['usage: open <slug>', `slugs: ${projects.map((p) => p.slug).join(', ')}`] }
      }
      const project = projects.find((p) => p.slug === slug)
      if (!project) return { lines: [`open: no project named "${slug}". Try "projects".`] }
      const url = project.repo ?? project.demo
      if (!url) return { lines: [`${project.title} has no public link yet.`] }
      return { lines: [`opening ${url}`], action: { type: 'open', url } }
    }

    case 'skills':
      return { lines: profile.skills.map((s) => `${s.group}: ${s.items.join(', ')}`) }

    case 'experience':
      return {
        lines: [
          ...work.map((w) => `${w.title} @ ${w.org}${w.period ? ` (${w.period})` : ''}`),
          '',
          ...awards.map((a) => `* ${a.title}${a.detail ? `, ${a.detail}` : ''}${a.year ? ` (${a.year})` : ''}`),
        ],
      }

    case 'contact':
      return {
        lines: [`email     ${profile.email}`, `github    ${profile.github}`, `linkedin  ${profile.linkedin}`],
      }

    case 'goto': {
      const id = args[0]?.toLowerCase()
      if (!id || !SECTIONS.includes(id)) return { lines: [`usage: goto <${SECTIONS.join(' | ')}>`] }
      return { lines: [`jumping to #${id}`], action: { type: 'scroll', id } }
    }

    case 'theme':
      return { lines: ['toggling theme'], action: { type: 'theme' } }

    case 'clear':
      return { lines: [], action: { type: 'clear' } }

    case 'sudo':
      return { lines: ['sudo: permission denied. Nice try though.'] }

    default:
      return { lines: [`command not found: ${cmd}. Type "help".`] }
  }
}
