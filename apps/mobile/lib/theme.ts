export type ColorTokens = {
  primary: string
  sidebar: string
  bg: string
  surface: string
  textBase: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  border: string
  // triage — clinical signal, never teal
  triageGreenBg: string
  triageGreenText: string
  triageYellowBg: string
  triageYellowText: string
  triageRedBg: string
  triageRedText: string
  // solid triage badges in lists
  badgeGreen: string
  badgeYellow: string
  badgeRed: string
}

export const lightColors: ColorTokens = {
  primary: '#48A9B2',
  sidebar: '#3B5B58',
  bg: '#f8fafc',
  surface: '#ffffff',
  textBase: '#3B5B58',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textDisabled: '#94a3b8',
  border: '#e2e8f0',
  triageGreenBg: '#dcfce7',
  triageGreenText: '#166534',
  triageYellowBg: '#fef9c3',
  triageYellowText: '#854d0e',
  triageRedBg: '#fee2e2',
  triageRedText: '#991b1b',
  badgeGreen: '#22c55e',
  badgeYellow: '#eab308',
  badgeRed: '#ef4444',
}

export const darkColors: ColorTokens = {
  primary: '#57BDC1',
  sidebar: '#3B5B58',
  bg: '#0D1E1D',
  surface: '#162726',
  textBase: '#E8F4F4',
  textSecondary: '#7AADAC',
  textMuted: '#7AADAC',
  textDisabled: '#4A6362',
  border: '#2A4241',
  triageGreenBg: '#14532D',
  triageGreenText: '#86efac',
  triageYellowBg: '#713f12',
  triageYellowText: '#fde047',
  triageRedBg: '#7f1d1d',
  triageRedText: '#fca5a5',
  badgeGreen: '#22c55e',
  badgeYellow: '#eab308',
  badgeRed: '#ef4444',
}
