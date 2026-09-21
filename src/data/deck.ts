import { profile } from './profile'
import { projects } from './projects'

/**
 * The card deck shown in the hero in "I'm boring" mode: a handful of quick
 * facts you can flick through. Facts that already live in another data file
 * are read from there rather than typed again.
 */
export interface DeckCard {
  label: string
  headline: string
  detail: string
  /** Which accent colour the label uses */
  tone: 'accent' | 'cyan' | 'amber'
  /**
   * Draws a streak strip along the bottom of the card, the way a language app
   * shows the days you have kept going: a flame and one lit tile per language.
   * Decorative, and hidden from screen readers, because the headline above it
   * already names the same languages.
   */
  streak?: readonly { name: string; code: string }[]
  /**
   * An actual day streak to print next to the flame. Left unset on purpose:
   * fill it in only if you want a real number here, never a made-up one.
   */
  streakDays?: number
  /**
   * A Spotify track id. The card plays it instead of printing the headline,
   * and the headline and detail become the screen-reader description.
   * This is the only third party on the site, and because the deck only
   * exists in boring mode, retro mode never loads it.
   */
  spotify?: string
}

const title = (slug: string, fallback: string) => projects.find((p) => p.slug === slug)?.title ?? fallback

export const deck: DeckCard[] = [
  { label: 'Now', headline: 'Computer Science at Brown', detail: profile.location, tone: 'accent' },
  {
    label: 'Building',
    headline: title('haemocare', 'HaemoCare'),
    detail: 'A transfusion companion for thalassemia patients, in pilot on Android.',
    tone: 'cyan',
  },
  {
    label: 'Research',
    headline: title('anthroheight', 'AnthroHeight'),
    detail: 'Height estimation for patients who cannot stand. In clinical testing at BART LAB.',
    tone: 'amber',
  },
  { label: 'Off the keyboard', headline: 'Wheelchair fencing', detail: 'Sabre.', tone: 'accent' },
  {
    label: 'What I’m listening to',
    headline: 'WACUKA',
    detail: 'AVAION and Sofiya Nzau. Afro house.',
    tone: 'cyan',
    spotify: '75n9WHWZAzhB59xSjIHly4',
  },
  {
    label: 'Speaks',
    headline: profile.languages.map((l) => l.name).join(', '),
    detail: 'Three languages, two scripts.',
    tone: 'amber',
    streak: profile.languages,
  },
]
