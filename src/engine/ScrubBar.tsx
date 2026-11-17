/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { COLORS } from '../design/tokens';

interface ScrubBarProps {
  t: number;
  totalBeats: number;
  onChange: (newT: number) => void;
}

export const ScrubBar: React.FC<ScrubBarProps> = ({ t, totalBeats, onChange }) => {
  const isSingle = totalBeats <= 1;
  const maxVal = Math.max(1, totalBeats - 1);
  const clampedT = Math.max(0, Math.min(maxVal, t));
  const percentage = isSingle ? 100 : (clampedT / maxVal) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSingle) return;
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="relative w-full py-1 flex items-center">
      {/* Beat Tick Marks */}
      {totalBeats > 1 && totalBeats <= 24 && (
        <div className="absolute -top-0.5 left-1.5 right-1.5 flex justify-between pointer-events-none px-0.5">
          {Array.from({ length: totalBeats }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 h-1 rounded-full"
              style={{
                backgroundColor: i <= Math.round(clampedT) ? COLORS.primary : COLORS.divider,
              }}
            />
          ))}
        </div>
      )}

      <input
        type="range"
        min={0}
        max={maxVal}
        step={0.005}
        disabled={isSingle}
        value={isSingle ? 1 : clampedT}
        onChange={handleChange}
        aria-label="Step scrub bar"
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-default accent-[#005583] focus:outline-none"
        style={{
          background: `linear-gradient(to right, ${COLORS.primary} ${percentage}%, ${COLORS.divider} ${percentage}%)`,
        }}
      />
    </div>
  );
};
