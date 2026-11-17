/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, Eye, EyeOff, Info, Maximize2, Minimize2 } from 'lucide-react';
import { COLORS } from '../design/tokens';
import { SectionConfig, SectionId } from '../content/sections';
import { RevealUnit, useTapNavigator } from './useTapNavigator';
import { IndexDrawer } from '../components/IndexDrawer';

export interface SlideStepItem {
  id: string;
  title: string;
}

export interface SlideTopicTab {
  id: string;
  label: string;
}

interface SlideShellProps {
  sections: SectionConfig[];
  activeSectionId: SectionId;
  onSelectSection: (sectionId: SectionId) => void;

  topics?: SlideTopicTab[];
  activeTopicId?: string;
  onSelectTopic?: (topicId: string, sectionId?: SectionId) => void;
  topLeftExtra?: React.ReactNode;

  steps: SlideStepItem[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;

  // Ordered reveal units for tap/keyboard navigation (defaults to rail steps)
  units?: RevealUnit[];
  currentUnitIndex?: number;
  onNext: () => boolean | void;
  onBack: () => void;
  isAnimating?: () => boolean;
  finishAnimation?: () => boolean;

  // Subtle cue on the final unit of the current screen
  isLastUnit?: boolean;
  nextScreenLabel?: string;

  // Slim controls dock row directly above mobile dots (slides in on interactive steps)
  controlsDock?: React.ReactNode;

  children: React.ReactNode;
}

export const SlideShell: React.FC<SlideShellProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  topics,
  activeTopicId,
  onSelectTopic,
  topLeftExtra,
  steps,
  currentStepIndex,
  onSelectStep,
  units,
  currentUnitIndex,
  onNext,
  onBack,
  isAnimating,
  finishAnimation,
  isLastUnit,
  nextScreenLabel,
  controlsDock,
  children,
}) => {
  const [focusMode, setFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [hasTappedOnce, setHasTappedOnce] = useState(false);

  // Hover or long-press step title tooltip state
  const [tooltip, setTooltip] = useState<{ text: string; top: number; left: number } | null>(null);
  const [mobileDotTitle, setMobileDotTitle] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const wasIndexOpenRef = useRef(false);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const totalSteps = Math.max(1, steps.length);
  const clampedStep = Math.max(0, Math.min(totalSteps - 1, currentStepIndex));

  const effectiveUnits = units && units.length > 0 ? units : steps;
  const effectiveUnitIndex = currentUnitIndex !== undefined ? currentUnitIndex : clampedStep;

  const {
    stagePointerProps,
    ripples,
    totalUnits,
    clampedIndex: clampedUnitIndex,
    currentUnit,
  } = useTapNavigator({
    units: effectiveUnits,
    currentIndex: effectiveUnitIndex,
    goNext: onNext,
    goBack: onBack,
    isAnimating,
    finishAnimation,
    disabled: showIndex,
    onFirstSuccessfulTap: () => setHasTappedOnce(true),
  });

  const effectiveIsLastUnit =
    isLastUnit !== undefined ? isLastUnit : clampedUnitIndex >= totalUnits - 1;

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Return focus to the 'i' icon whenever the Index drawer closes
  useEffect(() => {
    if (showIndex) {
      wasIndexOpenRef.current = true;
    } else if (wasIndexOpenRef.current) {
      wasIndexOpenRef.current = false;
      window.requestAnimationFrame(() => {
        infoBtnRef.current?.focus({ preventScroll: true });
      });
    }
  }, [showIndex]);

  const handleCloseIndex = useCallback(() => {
    setShowIndex(false);
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Gracefully ignore if browser/iframe blocks fullscreen API
    }
  };

  const showStepTooltip = (el: HTMLElement, title: string) => {
    const rect = el.getBoundingClientRect();
    setTooltip({
      text: title,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleTouchStartStep = (el: HTMLElement, title: string, isMobileStrip = false) => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      if (isMobileStrip) {
        setMobileDotTitle(title);
      } else {
        showStepTooltip(el, title);
      }
    }, 380);
  };

  const clearStepTooltip = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setTooltip(null);
    setMobileDotTitle(null);
  };

  const renderUtilityPillGroup = () => (
    <div data-no-nav="true" className="relative shrink-0">
      <div
        className="inline-flex items-center rounded-full border bg-white divide-x"
        style={{ borderColor: COLORS.divider }}
      >
        <button
          type="button"
          onClick={() => {
            setFocusMode((f) => !f);
            setShowIndex(false);
          }}
          title={focusMode ? 'Exit focus mode' : 'Focus mode'}
          aria-label={focusMode ? 'Exit focus mode' : 'Focus mode'}
          className="h-8 w-8 flex items-center justify-center rounded-l-full hover:bg-slate-50 cursor-pointer transition-colors"
          style={{ color: focusMode ? COLORS.primary : COLORS.mutedText }}
        >
          {focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="h-8 w-8 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors"
          style={{ color: isFullscreen ? COLORS.primary : COLORS.mutedText, borderColor: COLORS.divider }}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          ref={infoBtnRef}
          type="button"
          onClick={() => setShowIndex((s) => !s)}
          title="Open index"
          aria-label="Open index"
          aria-expanded={showIndex}
          aria-controls="index-drawer"
          className="h-8 w-8 flex items-center justify-center rounded-r-full hover:bg-slate-50 cursor-pointer transition-colors"
          style={{ color: showIndex ? COLORS.primary : COLORS.mutedText, borderColor: COLORS.divider }}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: '#F8FAFF', color: COLORS.bodyText }}
    >
      {/* Screen-reader live announcement for current step */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {clampedUnitIndex + 1} of {totalUnits}
        {currentUnit?.title ? `: ${currentUnit.title}` : ''}
      </div>

      {/* 1. HEADER: Single slim 56px row (hidden in Focus mode) */}
      {!focusMode && (
        <header
          data-no-nav="true"
          className="h-14 px-3 md:px-5 border-b bg-white flex items-center justify-between gap-2 md:gap-4 shrink-0 z-30"
          style={{ borderColor: COLORS.divider }}
        >
          {/* Left: Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-small whitespace-nowrap min-w-0 shrink-0"
            style={{ color: COLORS.mutedText }}
          >
            <span className="font-semibold shrink-0" style={{ color: COLORS.primary }}>
              NCERT
            </span>
            <span className="shrink-0 opacity-60">&gt;</span>
            <span className="hidden lg:inline shrink-0">Class 8</span>
            <span className="hidden lg:inline shrink-0 opacity-60">&gt;</span>
            <span className="hidden xl:inline shrink-0">Squares & Cubes</span>
            <span className="hidden md:inline xl:hidden shrink-0">Ch 1</span>
            <span className="hidden md:inline shrink-0 opacity-60">&gt;</span>
            <span className="truncate font-medium max-w-[82px] sm:max-w-[140px]" style={{ color: COLORS.headingText }}>
              {activeSection.shortLabel.replace(/^\d+\.\s*/, '')}
            </span>
          </nav>

          {/* Centre: 5 Section compact pills */}
          <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max mx-auto px-1">
              {sections.map((sec) => {
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => onSelectSection(sec.id)}
                    className="px-3.5 py-1.5 rounded-full text-ui font-semibold whitespace-nowrap min-h-[40px] flex items-center transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isActive ? COLORS.primary : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : COLORS.bodyText,
                      border: isActive ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.divider}`,
                    }}
                  >
                    {sec.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Utility Icon Pill Group */}
          {renderUtilityPillGroup()}
        </header>
      )}

      {/* Middle Area: Left Step Rail + Grid Stage */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* 3. LEFT STEP RAIL (Desktop >= 768px, hidden in Focus mode) */}
        {!focusMode && (
          <aside
            aria-label="Step rail"
            data-no-nav="true"
            className="hidden md:flex flex-col items-center w-14 shrink-0 border-r bg-white py-3 gap-1 overflow-y-auto no-scrollbar z-20"
            style={{ borderColor: COLORS.divider }}
          >
            {steps.map((step, idx) => {
              const isActive = idx === clampedStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(idx)}
                  onMouseEnter={(e) => showStepTooltip(e.currentTarget, step.title)}
                  onMouseLeave={clearStepTooltip}
                  onTouchStart={(e) => handleTouchStartStep(e.currentTarget, step.title, false)}
                  onTouchEnd={clearStepTooltip}
                  onTouchCancel={clearStepTooltip}
                  aria-label={`Step ${idx + 1}: ${step.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  className="w-11 h-11 p-1 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span
                    className="w-9 h-9 rounded-full text-micro tabular-nums font-semibold flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      backgroundColor: isActive ? COLORS.primary : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : COLORS.mutedText,
                      border: `1px solid ${isActive ? COLORS.primary : COLORS.divider}`,
                    }}
                  >
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Fixed tooltip for hovered/long-pressed rail button */}
        {tooltip && !focusMode && (
          <div
            className="fixed z-50 px-3 py-1.5 rounded-lg border bg-white text-small font-medium max-w-[240px] pointer-events-none -translate-y-1/2"
            style={{
              top: tooltip.top,
              left: tooltip.left,
              borderColor: COLORS.divider,
              color: COLORS.headingText,
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* 4. STAGE: #F8FAFF with faint 28px square grid (#E3EAF8), tap/double-tap navigable */}
        <main
          {...stagePointerProps}
          className="flex-1 min-w-0 min-h-0 flex flex-col relative overflow-y-auto select-none"
          style={{
            backgroundColor: '#F8FAFF',
            backgroundImage:
              'linear-gradient(to right, #E3EAF8 1px, transparent 1px), linear-gradient(to bottom, #E3EAF8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            touchAction: 'manipulation',
          }}
        >
          {/* Floating utility icons when Focus mode hides the header */}
          {focusMode && (
            <div data-no-nav="true" className="sticky top-3 z-30 flex justify-end px-4 pointer-events-none">
              <div className="pointer-events-auto">{renderUtilityPillGroup()}</div>
            </div>
          )}

          {/* 2. TOPICS + optional top-left filter: top-left of stage */}
          {((topics && topics.length >= 2) || topLeftExtra) && (
            <div data-no-nav="true" className="px-4 md:px-6 pt-3 flex flex-wrap items-center gap-x-5 gap-y-2 shrink-0">
              {topics && topics.length >= 2 && (
                <div className="flex flex-wrap items-center gap-2">
                  {topics.map((topic) => {
                    const isActive = topic.id === activeTopicId;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => onSelectTopic?.(topic.id)}
                        className="text-ui font-semibold min-h-[40px] px-3.5 py-1.5 transition-colors cursor-pointer border-b-2 flex items-center"
                        style={{
                          color: isActive ? COLORS.primary : COLORS.mutedText,
                          borderColor: isActive ? COLORS.primary : 'transparent',
                        }}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {topLeftExtra && <div className="shrink-0">{topLeftExtra}</div>}
            </div>
          )}

          {/* Centered stage content */}
          <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-5 flex flex-col items-center">
            <div className="w-full min-w-0 my-auto flex flex-col items-center">
              {children}
            </div>
          </div>

          {/* Instant soft primary ripple at first-tap point */}
          {ripples.map((r) => (
            <span
              key={r.id}
              aria-hidden="true"
              className="fixed pointer-events-none z-40 rounded-full animate-tap-ripple"
              style={{
                left: r.x,
                top: r.y,
                width: '44px',
                height: '44px',
                backgroundColor: 'rgba(0, 85, 131, 0.16)',
                border: '1.5px solid rgba(0, 85, 131, 0.35)',
              }}
            />
          ))}

          {/* Bottom stage cues: last-unit advance hint & session discoverability cue */}
          <div className="w-full px-4 pb-3 pt-1 flex flex-col items-center gap-1.5 pointer-events-none shrink-0">
            {effectiveIsLastUnit && nextScreenLabel && (
              <div
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-small font-medium border bg-white/95 animate-fade-rise"
                style={{ borderColor: COLORS.divider, color: COLORS.primary }}
              >
                <span>Tap for next: {nextScreenLabel}</span>
              </div>
            )}
            <p
              aria-hidden={hasTappedOnce}
              className={`text-small font-medium text-center transition-opacity duration-500 ${
                hasTappedOnce ? 'opacity-0' : 'opacity-85'
              }`}
              style={{ color: COLORS.mutedText }}
            >
              Tap to continue - double-tap to go back
            </p>
          </div>
        </main>
      </div>

      {/* Slim Controls Dock for interactive steps (with Continue chip) */}
      <div
        data-no-nav="true"
        className={`shrink-0 overflow-hidden transition-all duration-300 ease-out bg-white ${
          controlsDock ? 'max-h-64 opacity-100 border-t' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: COLORS.divider }}
      >
        {controlsDock && (
          <div className="px-3 md:px-5 py-2 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">{controlsDock}</div>
            <button
              type="button"
              onClick={() => onNext()}
              className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-ui font-semibold text-white min-h-[40px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3b. MOBILE STEP DOTS (< 768px) */}
      {!focusMode && totalSteps > 1 && (
        <div
          data-no-nav="true"
          className="md:hidden relative px-4 py-2 border-t shrink-0 overflow-x-auto no-scrollbar"
          style={{ backgroundColor: '#F8FAFF', borderColor: COLORS.divider }}
        >
          {mobileDotTitle && (
            <div
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg border bg-white text-small font-medium max-w-[85vw] truncate pointer-events-none"
              style={{ borderColor: COLORS.divider, color: COLORS.headingText }}
            >
              {mobileDotTitle}
            </div>
          )}
          <div className="flex items-center gap-2 min-w-max mx-auto">
            {steps.map((step, idx) => {
              const isActive = idx === clampedStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(idx)}
                  onTouchStart={(e) => handleTouchStartStep(e.currentTarget, step.title, true)}
                  onTouchEnd={clearStepTooltip}
                  onTouchCancel={clearStepTooltip}
                  aria-label={`Step ${idx + 1}: ${step.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  className="h-2.5 rounded-full transition-all cursor-pointer shrink-0"
                  style={{
                    width: isActive ? '20px' : '8px',
                    backgroundColor: isActive ? COLORS.primary : COLORS.divider,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      <IndexDrawer
        open={showIndex}
        onClose={handleCloseIndex}
        sections={sections}
        activeSectionId={activeSectionId}
        activeTopicId={activeTopicId}
        onSelectSection={onSelectSection}
        onSelectTopic={onSelectTopic}
      />
    </div>
  );
};
