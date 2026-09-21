/**
 * Everything about me that the site displays. Components read from here and
 * never hard-code text, so updating the site means editing this file.
 */
export const profile = {
  name: 'Hatayasit Aroonvanichporn',
  nickname: 'Building',
  role: 'Full-stack developer and ML engineer',
  school: 'Computer Science @ Brown University',
  location: 'Providence, RI',
  email: 'hatayasit_aroonvanichporn@brown.edu',
  github: 'https://github.com/ggmrcodes',
  linkedin: 'https://www.linkedin.com/in/building-hatayasit-b69059282/',

  // The footer "view source" link is hidden while this is empty.
  sourceRepo: 'https://github.com/ggmrcodes/portfolio',

  // TODO: optional. Put a PDF in /public and set e.g. '/resume.pdf'.
  // The resume button is hidden while it is empty.
  resumeUrl: '',

  tagline:
    'I build software for patients, clinics, and bodies that off-the-shelf tools ignore.',

  bio: [
    'I am a computer science student at Brown University. Most of what I build starts with a real clinical or accessibility problem: a transfusion companion for thalassemia patients, posture scoring for children in hippotherapy, height estimation for patients who cannot stand.',
    'Before Brown I did machine-learning research at BART LAB (Mahidol University) and Gowajee.ai, shipped software at MFEC, consulted on accessibility for the Bangkok Metropolitan Authority, and sat on the Thai Parliament’s AI committee as a youth advisor. Away from the keyboard I fence in a wheelchair and speak Thai, English, and German.',
  ],

  // The two-letter codes are shown on the "Speaks" card in the hero deck.
  languages: [
    { name: 'Thai', code: 'TH' },
    { name: 'English', code: 'EN' },
    { name: 'German', code: 'DE' },
  ],

  skills: [
    { group: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vue.js'] },
    { group: 'Backend', items: ['Node.js', 'Python', 'Flask', 'PostgreSQL', 'Supabase', 'MongoDB', 'REST APIs'] },
    { group: 'Machine learning', items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'MediaPipe', 'ONNX', 'pandas', 'NumPy'] },
    { group: 'Mobile', items: ['React Native', 'Expo', 'SwiftUI'] },
    { group: 'Tools', items: ['Git', 'Docker', 'AWS', 'Linux', 'CI/CD'] },
  ],
} as const
