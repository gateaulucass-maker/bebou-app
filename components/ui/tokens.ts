export const T = {
  cream: '#FFF4EF',
  creamDeep: '#FBE8DD',
  ink: '#2B2320',
  muted: 'rgba(43,35,32,0.55)',
  faint: 'rgba(43,35,32,0.12)',
  line: 'rgba(43,35,32,0.08)',
  coral: '#FF7A5C',
  coralSoft: '#FFB39A',
  green: '#5B7A6E',
  card: '#FFFFFF',
  darkBg: '#1A1513',
  darkCard: '#241C19',
  darkInk: '#F5EFEA',
  darkMuted: 'rgba(245,239,234,0.55)',
  darkFaint: 'rgba(245,239,234,0.12)',
  darkLine: 'rgba(245,239,234,0.08)',
} as const;

export const SERIF = `'Instrument Serif', 'Cormorant Garamond', Georgia, serif`;
export const SANS  = `'General Sans', 'Inter', -apple-system, system-ui, sans-serif`;

export interface Theme {
  bg: string; ink: string; muted: string; faint: string; card: string; line: string;
}

export function theme(dark: boolean): Theme {
  return dark ? {
    bg: T.darkBg, ink: T.darkInk, muted: T.darkMuted, faint: T.darkFaint,
    card: T.darkCard, line: T.darkLine,
  } : {
    bg: T.cream, ink: T.ink, muted: T.muted, faint: T.faint, card: T.card, line: T.line,
  };
}

export const MONTHS_UPPER = ['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];
