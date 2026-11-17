/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { chapterData, sampleRefresherClip } from './content/chapterData';
import {
  CHAPTER_SECTIONS,
  SectionConfig,
  SectionId,
  SubTabConfig,
  SubTabId,
} from './content/sections';
import { RefresherMiniClip, Scene } from './types';
import { useTimeline } from './engine/useTimeline';
import { useSceneParams } from './engine/useSceneParams';
import { SlideShell, SlideStepItem } from './engine/SlideShell';
import { RevealUnit } from './engine/useTapNavigator';
import { QuickCheck } from './components/QuickCheck';
import { Katex } from './components/Katex';
import { HighlightHeadline } from './components/HighlightHeadline';
import { RefresherCard } from './components/RefresherCard';
import {
  FoundationDemoScene,
  FoundationDemoInteractiveControls,
} from './scenes/FoundationDemoScene';
import {
  LockerStorySection,
  LOCKER_STORY_STEPS,
  FACTOR_PAIRS_STEPS,
} from './sections/LockerStorySection';
import { DotGridSquareVisualizer } from './components/DotGridSquareVisualizer';
import { IsometricCubeRenderer } from './components/IsometricCubeRenderer';
import { PrimeFactorGroupingHelper } from './components/PrimeFactorGroupingHelper';
import { COLORS } from './design/tokens';

const ALL_SUBTABS: { sectionId: SectionId; subTab: SubTabConfig }[] = CHAPTER_SECTIONS.flatMap((sec) =>
  sec.subTabs.map((subTab) => ({ sectionId: sec.id, subTab }))
);

const REFRESHERS: Record<string, RefresherMiniClip> = {
  'refresher-multiplication': sampleRefresherClip,
};

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>('sec-0');
  const [activeSubTabId, setActiveSubTabId] = useState<SubTabId>('locker-story');

  // Slide-based QuickCheck state for concept scenes (null = viewing scene beats)
  const [quickCheckIndex, setQuickCheckIndex] = useState<number | null>(null);
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<number, number>>({});

  // Module step for Section 0 story and Section 5 tool steps
  const [moduleStep, setModuleStep] = useState(0);

  const chapter = chapterData;

  const activeSection: SectionConfig = useMemo(
    () => CHAPTER_SECTIONS.find((s) => s.id === activeSectionId) || CHAPTER_SECTIONS[0],
    [activeSectionId]
  );

  const activeSubTab: SubTabConfig = useMemo(
    () => activeSection.subTabs.find((st) => st.id === activeSubTabId) || activeSection.subTabs[0],
    [activeSection, activeSubTabId]
  );

  const activeSceneIndex = activeSubTab.sceneIndex ?? 0;
  const isSceneSubTab = activeSubTab.sceneIndex !== undefined;
  const currentScene: Scene = chapter.scenes[activeSceneIndex] || chapter.scenes[0];

  // Stable timeline & scene parameter hooks
  const timeline = useTimeline(currentScene.beats.length);
  const { setT: setTimelineT } = timeline;
  const sceneParams = useSceneParams(currentScene, timeline.beatIndex, timeline.progress);
  const pendingBeatRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingBeatRef.current !== null && isSceneSubTab) {
      setTimelineT(pendingBeatRef.current);
      pendingBeatRef.current = null;
    }
  }, [activeSubTabId, isSceneSubTab, currentScene.beats.length, setTimelineT]);

  const resetSlideSubStates = () => {
    pendingBeatRef.current = null;
    setQuickCheckIndex(null);
    setQuickCheckAnswers({});
    setModuleStep(0);
    timeline.setT(0);
  };

  const handleSelectSection = (sectionId: SectionId) => {
    const targetSection = CHAPTER_SECTIONS.find((s) => s.id === sectionId) || CHAPTER_SECTIONS[0];
    setActiveSectionId(sectionId);
    setActiveSubTabId(targetSection.subTabs[0].id);
    resetSlideSubStates();
  };

  const handleSelectSubTab = (subTabId: string, sectionId?: SectionId) => {
    const castSubTabId = subTabId as SubTabId;
    if (sectionId) {
      setActiveSectionId(sectionId);
    }
    setActiveSubTabId(castSubTabId);
    resetSlideSubStates();
  };

  const advanceAfterQuickCheck = () => {
    setQuickCheckIndex(null);
    setQuickCheckAnswers({});
    const subIdx = activeSection.subTabs.findIndex((st) => st.id === activeSubTab.id);
    if (subIdx >= 0 && subIdx < activeSection.subTabs.length - 1) {
      handleSelectSubTab(activeSection.subTabs[subIdx + 1].id);
      return;
    }
    const secIdx = CHAPTER_SECTIONS.findIndex((s) => s.id === activeSection.id);
    if (secIdx >= 0 && secIdx < CHAPTER_SECTIONS.length - 1) {
      handleSelectSection(CHAPTER_SECTIONS[secIdx + 1].id);
    }
  };

  // Left-rail steps
  const railSteps = useMemo<SlideStepItem[]>(() => {
    if (activeSubTab.id === 'locker-story') {
      return LOCKER_STORY_STEPS;
    }
    if (activeSubTab.id === 'factor-pairs') {
      return FACTOR_PAIRS_STEPS;
    }
    if (isSceneSubTab) {
      return currentScene.beats.map((b) => ({ id: b.id, title: b.headline || b.narration }));
    }
    if (activeSubTab.id === 'dot-grid') {
      return [
        { id: 'dg-1', title: 'Interactive Square Grid' },
        { id: 'dg-2', title: 'Odd Numbers Decomposition' },
      ];
    }
    if (activeSubTab.id === 'isometric-cube') {
      return [
        { id: 'ic-1', title: 'Isometric Cube Layers' },
        { id: 'ic-2', title: 'Volume & Cubing' },
      ];
    }
    if (activeSubTab.id === 'prime-factor') {
      return [
        { id: 'pf-1', title: 'Prime Factorisation' },
        { id: 'pf-2', title: 'Grouping Pairs & Triplets' },
      ];
    }
    return [{ id: 'tool-step', title: activeSubTab.label }];
  }, [activeSubTab, currentScene.beats, isSceneSubTab]);

  const clampedStep = Math.max(0, Math.min(railSteps.length - 1, isSceneSubTab ? timeline.beatIndex : moduleStep));

  const currentBeat =
    currentScene.beats[Math.min(timeline.beatIndex, currentScene.beats.length - 1)] || currentScene.beats[0];

  const activeRefresher = currentScene.refresherId ? REFRESHERS[currentScene.refresherId] : undefined;
  const visibleLatexLines = currentBeat.latex || [];

  // Tap-navigator units & Next/Back logic
  const qcQuestions = currentScene.quickCheck ?? [];
  const inQuickCheck = isSceneSubTab && quickCheckIndex !== null && qcQuestions.length > 0;

  const globalSubTabIdx = ALL_SUBTABS.findIndex(
    (entry) => entry.sectionId === activeSectionId && entry.subTab.id === activeSubTab.id
  );
  const nextGlobal = globalSubTabIdx >= 0 && globalSubTabIdx < ALL_SUBTABS.length - 1
    ? ALL_SUBTABS[globalSubTabIdx + 1]
    : undefined;

  const enterSubTabAtStart = (entry: { sectionId: SectionId; subTab: SubTabConfig }) => {
    pendingBeatRef.current = entry.subTab.sceneIndex !== undefined ? 0 : null;
    setActiveSectionId(entry.sectionId);
    setActiveSubTabId(entry.subTab.id);
    setQuickCheckIndex(null);
    setQuickCheckAnswers({});
    setModuleStep(0);
    timeline.setT(0);
  };

  let tapUnits: RevealUnit[] = railSteps;
  let currentUnitIndex = clampedStep;
  let isLastUnit = clampedStep >= railSteps.length - 1;
  let nextScreenLabel: string | undefined = nextGlobal?.subTab.label;

  if (inQuickCheck) {
    tapUnits = [
      ...qcQuestions.map((q, i) => ({ id: `${currentScene.id}-qc-${i}`, title: q.prompt })),
      { id: `${currentScene.id}-qc-result`, title: 'Quick Check Results' },
    ];
    currentUnitIndex = quickCheckIndex!;
    isLastUnit = quickCheckIndex! >= qcQuestions.length;
    nextScreenLabel = nextGlobal?.subTab.label;
  } else if (isSceneSubTab) {
    tapUnits = currentScene.beats.map((b) => ({ id: b.id, title: b.headline || b.narration }));
    currentUnitIndex = timeline.beatIndex;
    isLastUnit = timeline.beatIndex >= currentScene.beats.length - 1;
    nextScreenLabel = qcQuestions.length > 0 ? 'Quick Check' : nextGlobal?.subTab.label;
  } else {
    tapUnits = railSteps;
    currentUnitIndex = moduleStep;
    isLastUnit = moduleStep >= railSteps.length - 1;
    nextScreenLabel = nextGlobal?.subTab.label;
  }

  const handleTapNext = (): boolean => {
    if (inQuickCheck) {
      if (quickCheckIndex! < qcQuestions.length) {
        setQuickCheckIndex((idx) => (idx === null ? 0 : Math.min(qcQuestions.length, idx + 1)));
        return true;
      }
      if (nextGlobal) {
        enterSubTabAtStart(nextGlobal);
        return true;
      }
      return false;
    }

    if (isSceneSubTab) {
      if (timeline.getCurrentOrTargetBeat() < currentScene.beats.length - 1) {
        timeline.goNext();
        return true;
      }
      if (qcQuestions.length > 0) {
        setQuickCheckAnswers({});
        setQuickCheckIndex(0);
        return true;
      }
      if (nextGlobal) {
        enterSubTabAtStart(nextGlobal);
        return true;
      }
      return false;
    }

    // Story and Tools Tab module step progression
    if (moduleStep < railSteps.length - 1) {
      setModuleStep((s) => s + 1);
      return true;
    }

    if (nextGlobal) {
      enterSubTabAtStart(nextGlobal);
      return true;
    }
    return false;
  };

  const handleTapBack = () => {
    if (inQuickCheck) {
      if (quickCheckIndex! > 0) {
        setQuickCheckIndex((idx) => (idx !== null ? idx - 1 : null));
        return;
      }
      setQuickCheckIndex(null);
      timeline.setT(currentScene.beats.length - 1);
      return;
    }

    if (isSceneSubTab) {
      if (timeline.getCurrentOrTargetBeat() > 0) {
        timeline.goBack();
        return;
      }
      // Step back into previous sub-tab
      if (globalSubTabIdx > 0) {
        const prevGlobal = ALL_SUBTABS[globalSubTabIdx - 1];
        setActiveSectionId(prevGlobal.sectionId);
        setActiveSubTabId(prevGlobal.subTab.id);
        if (prevGlobal.subTab.sceneIndex !== undefined) {
          const prevScene = chapter.scenes[prevGlobal.subTab.sceneIndex];
          const prevQcLen = prevScene.quickCheck?.length ?? 0;
          if (prevQcLen > 0) {
            setQuickCheckIndex(prevQcLen);
            timeline.setT(prevScene.beats.length - 1);
          } else {
            setQuickCheckIndex(null);
            timeline.setT(Math.max(0, prevScene.beats.length - 1));
          }
        }
      }
      return;
    }

    // Module Tabs (Section 0 and Section 5)
    if (moduleStep > 0) {
      setModuleStep((s) => s - 1);
      return;
    }
    if (globalSubTabIdx > 0) {
      const prevGlobal = ALL_SUBTABS[globalSubTabIdx - 1];
      setActiveSectionId(prevGlobal.sectionId);
      setActiveSubTabId(prevGlobal.subTab.id);
    }
  };

  const activeControlsDock =
    isSceneSubTab && quickCheckIndex === null && currentBeat.interactive ? (
      <FoundationDemoInteractiveControls
        params={sceneParams.params}
        setParam={sceneParams.setParam}
      />
    ) : undefined;

  return (
    <SlideShell
      sections={CHAPTER_SECTIONS}
      activeSectionId={activeSectionId}
      onSelectSection={handleSelectSection}
      topics={activeSection.subTabs.map((st) => ({ id: st.id, label: st.label }))}
      activeTopicId={activeSubTabId}
      onSelectTopic={handleSelectSubTab}
      steps={railSteps}
      currentStepIndex={clampedStep}
      units={tapUnits}
      currentUnitIndex={currentUnitIndex}
      isLastUnit={isLastUnit}
      nextScreenLabel={nextScreenLabel}
      controlsDock={activeControlsDock}
      isAnimating={isSceneSubTab && !inQuickCheck ? timeline.isAnimating : undefined}
      finishAnimation={isSceneSubTab && !inQuickCheck ? timeline.finishAnimation : undefined}
      onSelectStep={(idx) => {
        if (isSceneSubTab) {
          setQuickCheckIndex(null);
          timeline.setT(idx);
        } else {
          setModuleStep(idx);
        }
      }}
      onNext={handleTapNext}
      onBack={handleTapBack}
    >
      {/* 0. Section 0: Queen Ratnamanjuri's 100 Lockers Story & Factor Pairs */}
      {activeSectionId === 'sec-0' && (
        <LockerStorySection
          subTabId={activeSubTab.id as 'locker-story' | 'factor-pairs'}
          stepIndex={clampedStep}
          onAdvanceStep={handleTapNext}
        />
      )}

      {/* 1. Interactive Tools Lab Screens (Section 5) */}
      {activeSectionId === 'sec-5' && (
        <div className="w-full max-w-4xl mx-auto py-2">
          {activeSubTab.id === 'dot-grid' && <DotGridSquareVisualizer />}
          {activeSubTab.id === 'isometric-cube' && <IsometricCubeRenderer />}
          {activeSubTab.id === 'prime-factor' && <PrimeFactorGroupingHelper />}
        </div>
      )}

      {/* 2. Concept Scene Slides OR QuickCheck Slides */}
      {isSceneSubTab && inQuickCheck && (
        <QuickCheck
          questions={qcQuestions}
          currentIndex={quickCheckIndex!}
          answers={quickCheckAnswers}
          onSelectOption={(qIdx, optIdx) =>
            setQuickCheckAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
          }
          onNext={() =>
            setQuickCheckIndex((idx) => (idx === null ? 0 : Math.min(qcQuestions.length, idx + 1)))
          }
          onReviewScene={() => {
            setQuickCheckIndex(null);
            setQuickCheckAnswers({});
            timeline.setT(0);
          }}
          onNextScene={advanceAfterQuickCheck}
        />
      )}

      {isSceneSubTab && !inQuickCheck && (
        <div className="w-full flex flex-col items-center gap-3 md:gap-4">
          {/* a. HEADLINE + optional '?' Refresher icon button */}
          <div className="w-full flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-center gap-2.5 max-w-[920px]">
              <HighlightHeadline
                text={currentBeat.headline || currentBeat.narration}
                focusWord={currentBeat.focusWord}
                focusColor={currentBeat.focusColor}
                highlightSymbols={currentBeat.highlight}
              />
              {activeRefresher && <RefresherCard clip={activeRefresher} />}
            </div>

            {/* d. CAPTION: one muted line under headline when needed */}
            {currentBeat.caption && (
              <p
                key={`cap-${currentBeat.id}`}
                className="text-small text-center max-w-2xl leading-relaxed animate-fade-rise"
                style={{ color: COLORS.mutedText }}
              >
                {currentBeat.caption}
              </p>
            )}
          </div>

          {/* b. VISUAL: centred scene canvas, >= 55% of stage height, unboxed */}
          <div
            data-no-nav={currentBeat.interactive ? 'true' : undefined}
            className="w-full max-w-[780px] h-[55vh] min-h-[260px] max-h-[520px] flex items-center justify-center"
          >
            <FoundationDemoScene
              t={timeline.t}
              beatIndex={timeline.beatIndex}
              beatId={currentBeat.id}
              localProgress={timeline.progress}
              params={sceneParams.params}
              setParam={sceneParams.setParam}
              setParams={sceneParams.setParams}
            />
          </div>

          {/* c. EQUATION STRIP: centred KaTeX, latest lines only, newest highlighted */}
          {visibleLatexLines.length > 0 && (
            <div className="w-full max-w-3xl mx-auto overflow-x-auto no-scrollbar py-1">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 math-strip font-medium">
                {visibleLatexLines.map((line, i) => {
                  const isNewest = i === visibleLatexLines.length - 1;
                  const formattedLine =
                    line.includes('\\frac') && !line.includes('\\displaystyle')
                      ? `\\displaystyle ${line}`
                      : line;
                  return (
                    <span
                      key={`${currentBeat.id}-eq-${i}`}
                      className="transition-opacity duration-300"
                      style={{
                        color: isNewest ? COLORS.primary : COLORS.mutedText,
                        opacity: isNewest ? 1 : 0.55,
                      }}
                    >
                      <Katex latex={formattedLine} displayMode={false} />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </SlideShell>
  );
}
