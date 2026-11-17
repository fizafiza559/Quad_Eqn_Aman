/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COLORS } from '../design/tokens';
import { Controls } from './Controls';
import { ScrubBar } from './ScrubBar';
import { EquationReveal } from '../components/EquationReveal';
import { RefresherCard } from '../components/RefresherCard';
import { QuickCheck } from '../components/QuickCheck';
import { RefresherMiniClip, QuickCheckQuestion } from '../types';
import { ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';

interface SceneShellProps {
  sceneTitle: string;
  sceneSubtitle?: string;
  beatIndex: number;
  totalBeats: number;
  narration: string;
  latex: string[];
  canvas: React.ReactNode;
  t: number;
  onNext: () => void;
  onBack: () => void;
  onScrub: (newT: number) => void;
  canGoNext: boolean;
  canGoBack: boolean;
  refresher?: RefresherMiniClip;
  quickCheckQuestions?: QuickCheckQuestion[];
  onBackToChapter?: () => void;
  interactiveControls?: React.ReactNode;
}

export const SceneShell: React.FC<SceneShellProps> = ({
  sceneTitle,
  sceneSubtitle,
  beatIndex,
  totalBeats,
  narration,
  latex,
  canvas,
  t,
  onNext,
  onBack,
  onScrub,
  canGoNext,
  canGoBack,
  refresher,
  quickCheckQuestions,
  onBackToChapter,
  interactiveControls,
}) => {
  const [showQuickCheck, setShowQuickCheck] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: COLORS.pageBg }}
    >
      {/* Top Navigation Bar */}
      <header
        className="w-full border-b px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-30"
        style={{ borderColor: COLORS.divider }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToChapter && (
              <button
                type="button"
                onClick={onBackToChapter}
                className="px-3 py-1.5 rounded-xl border bg-white text-micro font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-slate-50 shadow-2xs"
                style={{ borderColor: COLORS.divider, color: COLORS.headingText }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Chapter</span>
              </button>
            )}

            <div>
              <h1 className="text-title font-bold leading-tight" style={{ color: COLORS.headingText }}>
                {sceneTitle}
              </h1>
              {sceneSubtitle && (
                <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
                  {sceneSubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {refresher && <RefresherCard clip={refresher} />}
            {quickCheckQuestions && quickCheckQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowQuickCheck((prev) => !prev)}
                className={`px-3 py-1.5 rounded-full text-micro font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showQuickCheck ? 'bg-[#005583] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
                style={{ borderColor: showQuickCheck ? COLORS.primary : COLORS.divider }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{showQuickCheck ? 'Back to Scene' : 'Quick Check'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {showQuickCheck && quickCheckQuestions && quickCheckQuestions.length > 0 ? (
          /* Quick Check View */
          <div className="bg-white rounded-3xl border p-6 md:p-10 shadow-sm" style={{ borderColor: COLORS.divider }}>
            <QuickCheck
              questions={quickCheckQuestions}
              currentIndex={0}
              answers={{}}
              onSelectOption={() => {}}
              onNext={() => setShowQuickCheck(false)}
              onReviewScene={() => setShowQuickCheck(false)}
              onNextScene={() => setShowQuickCheck(false)}
            />
          </div>
        ) : (
          /* Responsive Two-Panel Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Panel 1 (Left / Narration & Math, 5 cols) */}
            <div
              className="lg:col-span-5 rounded-3xl border p-6 md:p-8 flex flex-col justify-between bg-white shadow-sm"
              style={{ borderColor: COLORS.divider }}
            >
              <div className="space-y-4">
                {/* Step Indicator Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-micro font-extrabold uppercase tracking-wider"
                    style={{ backgroundColor: COLORS.number.tint, color: COLORS.number.text }}
                  >
                    Step {beatIndex + 1} of {totalBeats}
                  </span>
                </div>

                {/* Narration */}
                <p
                  className="text-body md:text-lg font-medium leading-relaxed"
                  style={{ color: COLORS.bodyText }}
                >
                  {narration}
                </p>

                {/* EquationReveal (fade-in newest line, dim previous) */}
                <EquationReveal latex={latex} />
              </div>

              {/* Interactive Controls Slot (if beat is interactive) */}
              {interactiveControls && (
                <div
                  className="mt-6 pt-4 border-t rounded-2xl p-4 bg-slate-50/80"
                  style={{ borderColor: COLORS.divider }}
                >
                  {interactiveControls}
                </div>
              )}
            </div>

            {/* Panel 2 (Right / Canvas Panel, 7 cols) */}
            <div
              className="lg:col-span-7 rounded-3xl border p-4 md:p-6 flex flex-col items-center justify-center bg-white shadow-sm min-h-[340px]"
              style={{
                borderColor: COLORS.divider,
                backgroundImage: `radial-gradient(${COLORS.canvasGrid} 1.5px, transparent 1.5px)`,
                backgroundSize: '20px 20px',
              }}
            >
              <div className="w-full flex items-center justify-center">
                {canvas}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Controls Dock */}
      {!showQuickCheck && (
        <footer
          className="w-full border-t bg-white/90 backdrop-blur-md px-4 py-3 sticky bottom-0 z-20"
          style={{ borderColor: COLORS.divider }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {/* Scrub Bar with Tick Marks */}
            <ScrubBar t={t} totalBeats={totalBeats} onChange={onScrub} />

            <div className="flex items-center justify-between">
              {/* Step indicator ('Step 1 of N') */}
              <span className="text-micro font-bold tabular-nums" style={{ color: COLORS.mutedText }}>
                Step {beatIndex + 1} of {totalBeats}
              </span>

              {/* Next & Back Controls */}
              <Controls
                onNext={onNext}
                onBack={onBack}
                canGoNext={canGoNext}
                canGoBack={canGoBack}
              />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
