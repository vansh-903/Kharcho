/**
 * Kharcho design colour tokens
 * Source: DESIGN_SPEC.md — Colour system
 */
export const colors = {
  ivory: '#FAF7F0',
  deepForest: '#163D32',
  emerald: '#29B879',
  saffron: '#E8A63A',
  mutedCoral: '#E66A5C',
  paleSage: '#DDEEE4',
  ink: '#17201C',

  // Semantic aliases
  background: '#FAF7F0',
  primaryText: '#163D32',
  primaryAction: '#29B879',
  incomeColor: '#29B879',
  expenseColor: '#E66A5C',
  surfaceQuiet: '#DDEEE4',
  bodyText: '#17201C',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
