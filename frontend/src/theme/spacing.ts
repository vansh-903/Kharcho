/**
 * Kharcho spacing & layout tokens
 * Source: DESIGN_SPEC.md — Layout
 * Base: 4 point scale
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const layout = {
  screenGutter: 20,
  cardRadius: 20,
  bottomSheetRadius: 28,
  tapTarget: 48,
} as const;
