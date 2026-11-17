/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefresherMiniClip } from '../types';
import { useTimeline } from '../engine/useTimeline';
import { Controls } from '../engine/Controls';
import { ScrubBar } from '../engine/ScrubBar';
import { COLORS } from '../design/tokens';
import { Sparkles, X, HelpCircle } from 'lucide-react';
import { Katex } from './Katex';

interface RefresherCardProps {
  clip: RefresherMiniClip;
  label?: string;
}

export const RefresherCard: React.FC<RefresherCardProps> = ({ clip, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeline = useTimeline(clip.beats.length);
  const currentBeat = clip.beats[Math.min(timeline.beatIndex, clip.beats.length - 1)];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          timeline.setT(0);
          setIsOpen(true);
        }}
        title={`Refresher: ${clip.title}`}
        aria-label={`Refresher: ${clip.title}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-micro font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
        style={{
          borderColor: COLORS.divider,
          color: COLORS.primary,
        }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
        <span>{label || 'Refresher'}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-rise"
        >
          <div
            className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl relative flex flex-col max-h-[90vh]"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.divider }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: COLORS.divider }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: COLORS.primary }} />
                <h3 className="text-title font-bold" style={{ color: COLORS.headingText }}>
                  {clip.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Mini-scene Engine View */}
            <div className="my-5 flex-1 overflow-y-auto space-y-4">
              {currentBeat.headline && (
                <h4 className="text-xl font-bold text-center" style={{ color: COLORS.headingText }}>
                  {currentBeat.headline}
                </h4>
              )}

              {/* Mini canvas / LaTeX display */}
              <div
                className="w-full rounded-2xl border flex flex-col items-center justify-center p-6 bg-[#FFFFFF] shadow-inner"
                style={{
                  minHeight: '160px',
                  borderColor: COLORS.divider,
                  backgroundImage: `radial-gradient(${COLORS.canvasGrid} 1.5px, transparent 1.5px)`,
                  backgroundSize: '16px 16px',
                }}
              >
                {currentBeat.latex && currentBeat.latex.map((l, i) => (
                  <div key={i} className="my-1.5 text-lg font-medium" style={{ color: COLORS.primary }}>
                    <Katex latex={l} displayMode={true} />
                  </div>
                ))}
              </div>

              {/* Narration */}
              <p
                className="text-body text-center max-w-lg mx-auto font-medium leading-relaxed"
                style={{ color: COLORS.bodyText }}
              >
                {currentBeat.narration}
              </p>
            </div>

            {/* Modal Controls Dock using the engine */}
            <div className="pt-4 border-t space-y-3" style={{ borderColor: COLORS.divider }}>
              <ScrubBar
                t={timeline.t}
                totalBeats={clip.beats.length}
                onChange={timeline.setT}
              />
              <div className="flex items-center justify-between">
                <span className="text-micro tabular-nums font-semibold" style={{ color: COLORS.mutedText }}>
                  Step {timeline.beatIndex + 1} of {clip.beats.length}
                </span>
                <Controls
                  onNext={timeline.goNext}
                  onBack={timeline.goBack}
                  canGoNext={timeline.beatIndex < clip.beats.length - 1}
                  canGoBack={timeline.beatIndex > 0}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
