/**
 * Project catalogue. The gallery filters this list by `categories` and the
 * terminal's `projects` / `open <slug>` commands read from it too, so there
 * is exactly one place to add or edit a project.
 */
export type Category = 'web' | 'mobile' | 'ml' | 'education'

export const CATEGORY_LABELS: Record<Category, string> = {
  web: 'Web',
  mobile: 'Mobile',
  ml: 'ML & vision',
  education: 'Education',
}

export interface Project {
  /** Short id used by the terminal: `open haemocare` */
  slug: string
  title: string
  year: string
  categories: Category[]
  summary: string
  highlights: string[]
  stack: string[]
  /** Which signal colour marks this project. Education uses violet; nothing else does. */
  tone: 'accent' | 'cyan' | 'amber' | 'violet'
  repo?: string
  demo?: string
  /** Lead with this one: it gets a full-width card at the top of the gallery */
  featured?: boolean
  /** Optional screenshot path under /public, e.g. '/projects/haemocare.png' */
  image?: string
}

export const projects: Project[] = [
  {
    slug: 'haemocare',
    featured: true,
    image: '/projects/haemocare-login.png',
    title: 'HaemoCare',
    year: '2026',
    categories: ['mobile', 'web'],
    tone: 'accent',
    summary:
      'Transfusion companion for patients with thalassemia and other chronic transfusion needs, plus a triage dashboard for the clinicians who care for them. Bilingual English and Thai, designed around Thailand’s PDPA.',
    highlights: [
      'Transfusion passport with blood type, antibody profile and reactions, shareable as a QR code or PDF with the name hidden by default.',
      '72-hour post-transfusion symptom log that maps severity to Normal, Monitor or Seek care, and raises the tier when a transfusion is overdue.',
      'Appointments imported by hand, from .ics files, or from a hospital FHIR (TH Core) endpoint. Clinician role unlocks a cohort view with triage scoring.',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'NativeWind'],
    repo: 'https://github.com/ggmrcodes/haemocare',
  },
  {
    slug: 'equipose',
    featured: true,
    title: 'Equipose',
    year: '2026',
    categories: ['ml'],
    tone: 'cyan',
    summary:
      'Computer-vision system that scores a child’s posture during hippotherapy (horse-assisted therapy) sessions for cerebral palsy, from front and side video, and tracks progress across sessions in a dashboard.',
    highlights: [
      'MediaPipe Pose for landmarks with a MoveNet ONNX fallback, chosen so it runs in real time on a CPU.',
      'Region-of-interest tracking keeps the child in frame and ignores the handlers walking beside the horse.',
      'A One-Euro filter smooths landmark jitter before posture angles are computed and scored.',
    ],
    stack: ['Python', 'MediaPipe', 'ONNX', 'Streamlit', 'SQLite', 'Pydantic'],
    repo: 'https://github.com/ggmrcodes/equipose',
  },
  {
    slug: 'anthroheight',
    title: 'AnthroHeight',
    year: '2026',
    categories: ['ml'],
    tone: 'amber',
    summary:
      'Single-RGB-camera computer vision that estimates standing height for disabled patients who cannot stand, from an image taken while they lie down. Built as a junior researcher at BART LAB, Mahidol University.',
    highlights: [
      'Anthropometric landmarks from one ordinary photo, no depth camera or calibration rig.',
      'Aimed at clinics where standing height feeds dosing and equipment sizing but is impossible to measure directly.',
      'Now in clinical testing.',
    ],
    stack: ['Python', 'Computer vision'],
    repo: 'https://github.com/ggmrcodes/anthroheight-BARTLAB',
  },
  {
    slug: 'fpl-ai',
    title: 'Fantasy Premier League AI',
    year: '2024',
    categories: ['ml'],
    tone: 'amber',
    summary:
      'Prediction tool that uses minimax search over projected points to choose Fantasy Premier League squads and transfers.',
    highlights: ['Treats the weekly transfer decision as a game against future fixtures rather than a single-week greedy pick.'],
    stack: ['Python', 'Game theory', 'Data analysis'],
    // TODO: add the repo URL. Links are hidden while missing.
  },
  {
    slug: 'doc-search',
    title: 'AI Office Word Search',
    year: '2024',
    categories: ['ml'],
    tone: 'accent',
    summary:
      'Semantic search across office documents using LangChain with local models through llama.cpp, so files are searched by meaning rather than exact words. Built during my internship at MFEC; the code is internal.',
    highlights: [
      'React front end over a Python retrieval service: documents are chunked, embedded with BGE, and matched to natural-language queries.',
      'Inference runs on-device through llama.cpp, so documents never leave the company network.',
      'Cut document lookup and parsing time by 25%.',
    ],
    stack: ['React', 'Python', 'LangChain', 'BGE embeddings', 'llama.cpp'],
    // Internal to MFEC, so no public link.
  },
  {
    slug: 'textbook',
    title: 'Algorithmic Thinking Textbook',
    year: '2024',
    categories: ['education'],
    tone: 'violet',
    summary:
      'A textbook that teaches algorithmic thinking to primary and middle school students, written in Thai for the Thai curriculum.',
    highlights: ['Written and lectured with NSTDA, Thailand’s National Science and Technology Development Agency.'],
    stack: ['Curriculum design', 'Thai'],
    // Not online, so no public link.
  },
]
