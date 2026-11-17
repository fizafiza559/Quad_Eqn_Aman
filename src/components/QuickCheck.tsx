/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QuickCheckQuestion } from '../types';
import { Katex } from './Katex';
import { HighlightHeadline } from './HighlightHeadline';
import { COLORS } from '../design/tokens';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

interface QuickCheckProps {
  questions: QuickCheckQuestion[];
  currentIndex: number; // 0..questions.length-1 = question slides, questions.length = result slide
  answers: Record<number, number>;
  onSelectOption: (questionIdx: number, optionIdx: number) => void;
  onNext: () => void;
  onReviewScene: () => void;
  onNextScene: () => void;
}

export const QuickCheck: React.FC<QuickCheckProps> = ({
  questions,
  currentIndex,
  answers,
  onSelectOption,
  onNext,
  onReviewScene,
  onNextScene,
}) => {
  if (!questions || questions.length === 0) return null;

  // Result Slide
  if (currentIndex >= questions.length) {
    const correctCount = questions.filter((q, idx) => answers[idx] === q.correctIndex).length;
    const scoreText = `${correctCount} out of ${questions.length}`;

    return (
      <div className="w-full max-w-[900px] mx-auto flex flex-col items-center text-center gap-6 py-6 animate-fade-rise">
        <HighlightHeadline
          text={`You got ${scoreText} right`}
          focusWord={scoreText}
          focusColor="root"
        />

        <p className="text-body max-w-lg" style={{ color: COLORS.mutedText }}>
          {correctCount === questions.length
            ? 'Clean sweep! You are ready for the next idea.'
            : 'Review any step from the step rail or jump straight to the next scene.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReviewScene}
            className="px-5 py-2.5 rounded-full border bg-white text-ui font-semibold min-h-[44px] flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
            style={{ borderColor: COLORS.divider, color: COLORS.headingText }}
          >
            <RotateCcw className="w-4 h-4" />
            Review the scene
          </button>
          <button
            type="button"
            onClick={onNextScene}
            className="px-6 py-2.5 rounded-full text-ui font-semibold min-h-[44px] text-white transition-colors cursor-pointer"
            style={{ backgroundColor: COLORS.primary }}
          >
            Next scene →
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const selectedOption = answers[currentIndex];
  const hasAnswered = selectedOption !== undefined;
  const isCorrect = selectedOption === q.correctIndex;

  return (
    <div key={`qc-slide-${currentIndex}`} className="w-full max-w-[900px] mx-auto flex flex-col items-center gap-6 py-2 animate-fade-rise">
      {/* Question as the slide headline */}
      <HighlightHeadline text={q.prompt} />

      {/* Optional KaTeX equation strip */}
      {q.latex && q.latex.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 math-step font-medium" style={{ color: COLORS.primary }}>
          {q.latex.map((l, i) => (
            <Katex key={i} latex={l} displayMode={false} />
          ))}
        </div>
      )}

      {/* Large Option Buttons: 2x2 on desktop, stacked on phones */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {q.options.map((opt, idx) => {
          let bg = '#FFFFFF';
          let border = COLORS.divider;
          let text = COLORS.headingText;

          if (hasAnswered) {
            if (idx === q.correctIndex) {
              bg = '#DCFCE7';
              border = '#16A34A';
              text = '#15803D';
            } else if (idx === selectedOption) {
              bg = '#FEE2E2';
              border = '#DC2626';
              text = '#B91C1C';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => !hasAnswered && onSelectOption(currentIndex, idx)}
              disabled={hasAnswered}
              className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-colors flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default text-ui-option font-semibold min-h-[48px] hover:border-[#005583]/60"
              style={{
                backgroundColor: bg,
                borderColor: border,
                color: text,
              }}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-micro tabular-nums font-bold border shrink-0"
                  style={{ borderColor: border }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-snug">{opt}</span>
              </span>
              {hasAnswered && idx === q.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              )}
              {hasAnswered && idx === selectedOption && idx !== q.correctIndex && (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Instant explanation & Next */}
      {hasAnswered && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 text-center animate-fade-rise">
          <p
            className="text-body leading-relaxed px-4 py-3 rounded-xl border"
            style={{
              backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2',
              borderColor: isCorrect ? '#86EFAC' : '#FCA5A5',
              color: isCorrect ? '#14532D' : '#7F1D1D',
            }}
          >
            <strong>{isCorrect ? 'Right! ' : 'Look closely: '}</strong>
            {q.explanation}
          </p>

          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-full text-ui font-semibold min-h-[44px] text-white transition-colors cursor-pointer"
            style={{ backgroundColor: COLORS.primary }}
          >
            {currentIndex < questions.length - 1 ? 'Next' : 'Finish'} →
          </button>
        </div>
      )}
    </div>
  );
};
