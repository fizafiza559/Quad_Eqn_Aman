/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Katex } from './Katex';
import { COLORS } from '../design/tokens';

interface EquationRevealProps {
  latex: string[];
  className?: string;
}

export const EquationReveal: React.FC<EquationRevealProps> = ({ latex, className = '' }) => {
  if (!latex || latex.length === 0) return null;

  return (
    <div className={`w-full flex flex-col items-center gap-2 py-2 ${className}`}>
      {latex.map((line, index) => {
        const isNewest = index === latex.length - 1;
        const formattedLine =
          line.includes('\\frac') && !line.includes('\\displaystyle')
            ? `\\displaystyle ${line}`
            : line;

        return (
          <div
            key={`eq-${index}-${line}`}
            className={`transition-all duration-300 ${
              isNewest
                ? 'animate-fade-rise opacity-100 font-semibold'
                : 'opacity-50 hover:opacity-80'
            }`}
            style={{
              color: isNewest ? COLORS.headingText : COLORS.mutedText,
            }}
          >
            <Katex latex={formattedLine} displayMode={true} className="text-lg md:text-xl" />
          </div>
        );
      })}
    </div>
  );
};
