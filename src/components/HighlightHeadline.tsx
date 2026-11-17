/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { COLORS } from '../design/tokens';
import { SymbolColorKey } from '../types';

interface HighlightHeadlineProps {
  text: string;
  focusWord?: string;
  focusColor?: SymbolColorKey;
  highlightSymbols?: string[];
  maxWidthClass?: string;
}

function resolveColorKey(
  focusColor?: SymbolColorKey,
  focusWord?: string,
  highlightSymbols?: string[]
): SymbolColorKey {
  if (focusColor) return focusColor;
  const fw = (focusWord || '').toLowerCase();
  if (fw.includes('square') || fw.includes('area')) return 'area';
  if (fw.includes('cube') || fw.includes('volume')) return 'volume';
  if (fw.includes('side') || fw.includes('length')) return 'side';
  if (fw.includes('root') || fw.includes('number')) return 'root';
  if (fw === 'a') return 'a';
  if (fw === 'b') return 'b';
  if (fw === 'c') return 'c';
  if (fw === 'x') return 'x';
  const first = highlightSymbols?.[0] as SymbolColorKey | undefined;
  if (first && first in COLORS) {
    return first;
  }
  return 'root';
}

export const HighlightHeadline: React.FC<HighlightHeadlineProps> = ({
  text,
  focusWord,
  focusColor,
  highlightSymbols,
  maxWidthClass = 'max-w-[900px]',
}) => {
  const colorKey = resolveColorKey(focusColor, focusWord, highlightSymbols);
  const colorEntry = COLORS[colorKey];
  const accentColor =
    typeof colorEntry === 'object' && colorEntry !== null && 'solid' in colorEntry
      ? colorEntry.solid
      : String(colorEntry);

  let before = text;
  let match = '';
  let after = '';

  if (focusWord && focusWord.trim().length > 0) {
    const idx = text.toLowerCase().indexOf(focusWord.toLowerCase());
    if (idx !== -1) {
      before = text.slice(0, idx);
      match = text.slice(idx, idx + focusWord.length);
      after = text.slice(idx + focusWord.length);
    }
  }

  return (
    <h1
      className={`${maxWidthClass} mx-auto text-center text-headline`}
      style={{
        color: COLORS.headingText,
      }}
    >
      {before}
      {match && <span style={{ color: accentColor }}>{match}</span>}
      {after}
    </h1>
  );
};
