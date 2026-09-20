/**
 * Work, leadership, and awards. `period` and `bullets` are optional so an
 * entry can be listed before the details are written; the UI simply skips
 * whatever is missing.
 */
export interface Role {
  title: string
  org: string
  period?: string
  bullets?: string[]
}

export const work: Role[] = [
  {
    title: 'Machine Learning and Software Engineering Intern',
    org: 'Gowajee.ai',
    period: 'Feb 2026 – May 2026',
    bullets: [
      'Built an internal tool for creating Pipecat voice-agent flows, so the team could draft flows and write node and system prompts more efficiently from meeting notes and recordings.',
    ],
  },
  {
    title: 'Machine Learning Specialist and Junior Researcher',
    org: 'BART LAB, Faculty of Engineering, Mahidol University',
    period: 'Sep 2025 – Jun 2026',
    bullets: [
      'Built AnthroHeight, a single-RGB-camera computer-vision pipeline that estimates standing height for patients who cannot stand, from a photo taken while they lie down. Now in clinical testing.',
    ],
  },
  {
    title: 'Youth Advisor, AI Committee',
    org: 'Parliament of Thailand',
    period: 'Mar 2025 – May 2025',
    bullets: [
      'Advised senior committee representatives on current AI developments and what they meant for policy.',
      'Compiled meeting reports and written summaries after invited presentations, mostly from industry and startups in areas such as telemedicine for therapy and counseling.',
    ],
  },
  {
    title: 'Accessibility Consultant Intern',
    org: 'Bangkok Metropolitan Authority',
    period: 'Jul 2024 – Aug 2024',
    bullets: [
      'Led site visits across Bangkok to audit public and government buildings, checking entrances and bathrooms against ADA accessibility guidelines and reporting what failed.',
    ],
  },
  {
    title: 'Software Development Intern',
    org: 'MFEC',
    period: 'Dec 2023 – Jul 2025',
    bullets: [
      'Built a React web app for semantic search across internal office documents, so staff could find files by meaning instead of exact filenames; cut document lookup and parsing time by 25%.',
      'Ran inference on-device with llama.cpp and used LangChain with BGE embeddings to chunk documents, index them as vectors, and retrieve matches.',
    ],
  },
]

export const leadership: Role[] = [
  {
    title: 'Student Leader',
    org: 'NISTTech, school technology and STEM service group',
    period: '2022 – 2024',
  },
  {
    title: 'Co-founder and Social Media Lead',
    org: 'Youth Merit Makers, child drowning prevention foundation',
  },
  {
    title: 'Counseling Volunteer and Interpreter',
    org: 'QSNICH Children’s Hospital',
  },
  {
    title: 'Author and Lecturer',
    org: 'NSTDA, Thailand’s National Science and Technology Development Agency',
  },
  {
    title: 'Athlete',
    org: 'Wheelchair fencing',
  },
]

export interface Award {
  title: string
  detail?: string
  year?: string
}

export const awards: Award[] = [
  { title: 'Thailand National Software Competition', detail: 'Bronze medal', year: '2024' },
  { title: 'Canadian Computing Competition (Waterloo)', detail: 'Distinction' },
  { title: '27th National Youth Film Competition', detail: 'Finalist, top 5 of 800+' },
  { title: 'South East Asia Youth Film Competition', detail: 'Special mention', year: '2024 – 2025' },
  { title: 'Microsoft Odyssey', detail: 'AI career-level certification' },
]
