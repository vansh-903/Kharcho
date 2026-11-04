/**
 * Kharcho typography tokens
 * Source: DESIGN_SPEC.md — Typography
 */
import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // 1. Primary amount — 40–48sp semibold
  amount: {
    fontSize: 44,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  // 2. Screen title — 28–32sp semibold
  screenTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  // 3. Section heading
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  // 4. Transaction merchant — 16sp medium
  merchant: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.ink,
  },
  // 5. Supporting detail — 13–14sp regular
  detail: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.ink,
  },
  // 6. Body
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.ink,
  },
  // 7. Label / caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.ink,
  },
  // 8. Brand wordmark
  wordmark: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.deepForest,
    letterSpacing: -1,
  },
});
