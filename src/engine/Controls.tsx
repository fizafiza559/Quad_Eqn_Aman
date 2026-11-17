/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COLORS } from '../design/tokens';

interface ControlsProps {
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onNext, onBack, canGoNext, canGoBack }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-ui transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95 shadow-xs"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.divider,
          color: COLORS.primary,
        }}
        title="Previous Beat"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back</span>
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl font-semibold text-ui flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-md active:scale-95 text-white"
        style={{
          backgroundColor: COLORS.primary,
        }}
        title="Next Beat"
      >
        <span>Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
