/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TypographyToken {
  name: string;
  desktopPx: number;
  mobilePx: number;
  clamp: string;
  weight: number;
  lineHeight: number;
  fontFamily: 'Outfit' | 'Inter';
  letterSpacing?: string;
  textWrap?: 'balance' | 'pretty';
  maxWidth?: string;
}

export const TYPOGRAPHY = {
  headline: {
    name: 'headline',
    desktopPx: 44,
    mobilePx: 28,
    clamp: 'clamp(1.75rem, 1.359rem + 1.739vw, 2.75rem)',
    weight: 800,
    lineHeight: 1.15,
    fontFamily: 'Outfit' as const,
    letterSpacing: '-0.02em',
    textWrap: 'balance' as const,
  },
  title: {
    name: 'title',
    desktopPx: 24,
    mobilePx: 20,
    clamp: 'clamp(1.25rem, 1.152rem + 0.435vw, 1.5rem)',
    weight: 700,
    lineHeight: 1.25,
    fontFamily: 'Outfit' as const,
  },
  statement: {
    name: 'statement',
    desktopPx: 20,
    mobilePx: 18,
    clamp: 'clamp(1.125rem, 1.076rem + 0.217vw, 1.25rem)',
    weight: 600,
    lineHeight: 1.35,
    fontFamily: 'Inter' as const,
    textWrap: 'balance' as const,
  },
  body: {
    name: 'body',
    desktopPx: 18,
    mobilePx: 16,
    clamp: 'clamp(1rem, 0.951rem + 0.217vw, 1.125rem)',
    weight: 500,
    lineHeight: 1.55,
    fontFamily: 'Inter' as const,
    textWrap: 'pretty' as const,
    maxWidth: '62ch',
  },
  uiOption: {
    name: 'ui-option',
    desktopPx: 16,
    mobilePx: 15,
    clamp: 'clamp(0.9375rem, 0.913rem + 0.109vw, 1rem)',
    weight: 600,
    lineHeight: 1.3,
    fontFamily: 'Inter' as const,
  },
  ui: {
    name: 'ui',
    desktopPx: 15,
    mobilePx: 14,
    clamp: 'clamp(0.875rem, 0.851rem + 0.109vw, 0.9375rem)',
    weight: 600,
    lineHeight: 1.2,
    fontFamily: 'Inter' as const,
  },
  small: {
    name: 'small',
    desktopPx: 14,
    mobilePx: 13,
    clamp: 'clamp(0.8125rem, 0.788rem + 0.109vw, 0.875rem)',
    weight: 500,
    lineHeight: 1.4,
    fontFamily: 'Inter' as const,
  },
  micro: {
    name: 'micro',
    desktopPx: 13,
    mobilePx: 12,
    clamp: 'clamp(0.75rem, 0.726rem + 0.109vw, 0.8125rem)',
    weight: 600,
    lineHeight: 1.2,
    fontFamily: 'Inter' as const,
  },
  mathStrip: {
    name: 'math-strip',
    desktopPx: 28,
    mobilePx: 24,
    clamp: 'clamp(1.5rem, 1.402rem + 0.435vw, 1.75rem)',
    weight: 500,
    lineHeight: 1.3,
    fontFamily: 'Inter' as const,
  },
  mathStep: {
    name: 'math-step',
    desktopPx: 24,
    mobilePx: 20,
    clamp: 'clamp(1.25rem, 1.152rem + 0.435vw, 1.5rem)',
    weight: 500,
    lineHeight: 1.35,
    fontFamily: 'Inter' as const,
  },
  mathOption: {
    name: 'math-option',
    desktopPx: 18,
    mobilePx: 16,
    clamp: 'clamp(1rem, 0.951rem + 0.217vw, 1.125rem)',
    weight: 500,
    lineHeight: 1.35,
    fontFamily: 'Inter' as const,
  },
} as const;

export const SVG_TYPOGRAPHY_ROLES = {
  label: { targetDesktopPx: 15, targetMobilePx: 14, weight: 600 },
  value: { targetDesktopPx: 16, targetMobilePx: 15, weight: 700 },
  tick: { targetDesktopPx: 13, targetMobilePx: 12, weight: 600 },
  area: { targetDesktopPx: 16, targetMobilePx: 15, weight: 700 },
} as const;

export type SvgRole = keyof typeof SVG_TYPOGRAPHY_ROLES;
