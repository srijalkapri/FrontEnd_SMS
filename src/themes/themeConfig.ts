export const THEME_ACCENTS = [
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: '#6366f1',
    previewBg: '#0b0f1a',
    previewBgLight: '#eef0f8',
  },
  {
    id: 'blue',
    label: 'Blue',
    swatch: '#3b82f6',
    previewBg: '#0a1018',
    previewBgLight: '#eff4fb',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#10b981',
    previewBg: '#0a120f',
    previewBgLight: '#ecfdf5',
  },
  {
    id: 'teal',
    label: 'Teal',
    swatch: '#14b8a6',
    previewBg: '#0a1212',
    previewBgLight: '#f0fdfa',
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: '#8b5cf6',
    previewBg: '#0f0a18',
    previewBgLight: '#f5f3ff',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: '#f43f5e',
    previewBg: '#120a0e',
    previewBgLight: '#fff1f3',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: '#f59e0b',
    previewBg: '#120f0a',
    previewBgLight: '#fffbeb',
  },
  {
    id: 'slate',
    label: 'Slate',
    swatch: '#64748b',
    previewBg: '#0c0f14',
    previewBgLight: '#f1f5f9',
  },
] as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeAccent = (typeof THEME_ACCENTS)[number]['id'];

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function isThemeAccent(value: string | null): value is ThemeAccent {
  return THEME_ACCENTS.some((accent) => accent.id === value);
}

export function getAccentLabel(accent: ThemeAccent): string {
  return THEME_ACCENTS.find((item) => item.id === accent)?.label ?? accent;
}
