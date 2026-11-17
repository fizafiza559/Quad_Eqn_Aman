/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  Gem,
  Lock,
  Unlock,
  Key,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { COLORS } from '../design/tokens';
import { Katex } from '../components/Katex';
import { HighlightHeadline } from '../components/HighlightHeadline';

export const LOCKER_STORY_STEPS = [
  { id: 'ls-1', title: "Queen Ratnamanjuri's Will" },
  { id: 'ls-2', title: "The Minister's 100 Rules" },
  { id: 'ls-3', title: "Interactive 100-Locker Chamber" },
  { id: 'ls-4', title: "Solve the Puzzle (With Hints)" },
  { id: 'ls-5', title: "The Secret Passcode (2-3-5-7-11)" },
];

export const FACTOR_PAIRS_STEPS = [
  { id: 'fp-1', title: "Toggles = Factors (Odd vs Even)" },
  { id: 'fp-2', title: "Partner Factors of Normal Numbers" },
  { id: 'fp-3', title: "The Self-Pair (Square Numbers)" },
  { id: 'fp-4', title: "Squares as Geometric Areas" },
  { id: 'fp-5', title: "Figure It Out: Story Quiz" },
];

// Mathematical helpers
function getFactors(n: number): number[] {
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

function getToggledBy(locker: number, maxPerson: number): number[] {
  const togglers: number[] = [];
  for (let p = 1; p <= maxPerson; p++) {
    if (locker % p === 0) togglers.push(p);
  }
  return togglers;
}

function getFactorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      pairs.push([i, n / i]);
    }
  }
  return pairs;
}

function isSquare(n: number): boolean {
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

const SQUARE_LOCKERS = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
const FIRST_5_PRIMES = [2, 3, 5, 7, 11];

const PUZZLE_HINTS = [
  {
    level: 1,
    title: 'Hint 1 (From the Story)',
    content:
      'Find out how many times each locker is toggled. What does the number of times a door is toggled depend on?',
  },
  {
    level: 2,
    title: 'Hint 2: Odd vs Even Rule',
    content:
      'A closed locker toggled 1 time is OPEN, 2 times is CLOSED, 3 times is OPEN, 4 times is CLOSED... Therefore, a locker remains OPEN if and only if it is toggled an ODD number of times!',
  },
  {
    level: 3,
    title: 'Hint 3: Divisors & Partner Pairs',
    content:
      'Person p touches Locker N only if p divides N. So the number of toggles equals the number of factors of N! Factors usually come in distinct pairs: 1 × 6 and 2 × 3 (giving an EVEN count). Does every number have an even number of factors?',
  },
  {
    level: 4,
    title: 'Hint 4: The Self-Pair & Squares',
    content:
      'What happens when a number has a factor paired with itself (like 2 × 2 = 4, 3 × 3 = 9, 6 × 6 = 36)? The middle factor is only counted once, giving an ODD total count of factors! The only open lockers are the SQUARE numbers!',
  },
];

interface LockerStorySectionProps {
  subTabId: 'locker-story' | 'factor-pairs';
  stepIndex: number;
  onAdvanceStep?: () => void;
}

export const LockerStorySection: React.FC<LockerStorySectionProps> = ({
  subTabId,
  stepIndex,
  onAdvanceStep,
}) => {
  // 100 Lockers interactive simulator state
  const [currentPerson, setCurrentPerson] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLocker, setSelectedLocker] = useState<number>(36);
  const [filterHighlight, setFilterHighlight] = useState<'none' | 'squares' | 'primes'>('squares');
  const [showDoorTogglesHistory, setShowDoorTogglesHistory] = useState<boolean>(false);
  const [showDoorConceptHint, setShowDoorConceptHint] = useState<boolean>(true);

  // Student Puzzle Solver State (Step 4)
  const [predictedLockers, setPredictedLockers] = useState<Set<number>>(new Set());
  const [revealedHintCount, setRevealedHintCount] = useState<number>(1);
  const [showSolutionRevealed, setShowSolutionRevealed] = useState<boolean>(false);
  const [solverFeedback, setSolverFeedback] = useState<string | null>(null);

  // Factor Pairs interactive state
  const [sideN, setSideN] = useState<number>(6);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Auto-play interval for simulator
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentPerson((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 180);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Selected locker details
  const selectedTogglers = useMemo(
    () => getToggledBy(selectedLocker, currentPerson),
    [selectedLocker, currentPerson]
  );
  const selectedIsOpen = selectedTogglers.length % 2 === 1;
  const selectedAllFactors = useMemo(() => getFactors(selectedLocker), [selectedLocker]);
  const selectedPairs = useMemo(() => getFactorPairs(selectedLocker), [selectedLocker]);
  const selectedIsSquare = isSquare(selectedLocker);
  const selectedIsPrime = isPrime(selectedLocker);

  // Toggle prediction in Step 4
  const togglePrediction = (lockerNum: number) => {
    setPredictedLockers((prev) => {
      const next = new Set(prev);
      if (next.has(lockerNum)) {
        next.delete(lockerNum);
      } else {
        next.add(lockerNum);
      }
      return next;
    });
    setSolverFeedback(null);
  };

  const handleCheckPredictions = () => {
    const correctCount = Array.from(predictedLockers).filter((n) => isSquare(n)).length;
    const incorrectCount = predictedLockers.size - correctCount;

    if (correctCount === 10 && incorrectCount === 0) {
      setSolverFeedback('🎉 Outstanding! You found all 10 square numbers! You solved Queen Ratnamanjuri\'s puzzle!');
      setShowSolutionRevealed(true);
    } else if (correctCount > 0 && incorrectCount === 0) {
      setSolverFeedback(`Great job! You found ${correctCount} of the 10 square lockers. Can you find the remaining ${10 - correctCount}? Use the hints above!`);
    } else if (incorrectCount > 0) {
      setSolverFeedback(`You found ${correctCount} square lockers, but ${incorrectCount} of your chosen lockers have an even number of factors (so they close!). Check Hint 3 & 4!`);
    } else {
      setSolverFeedback('Tap on numbers in the grid you predict will stay open, then click Check!');
    }
  };

  // Render SubTab 1: The 100 Lockers Story
  if (subTabId === 'locker-story') {
    return (
      <div className="w-full flex flex-col items-center gap-4 animate-fade-rise">
        {/* Step 1: The Queen's Will */}
        {stepIndex === 0 && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
            <HighlightHeadline
              text="Queen Ratnamanjuri's Will & The 100 Relatives"
              focusWord="Queen Ratnamanjuri's Will"
              focusColor="root"
            />

            {/* Ancient Scroll Card */}
            <div
              className="w-full p-6 md:p-8 rounded-3xl border shadow-sm flex flex-col items-center gap-4 text-left relative overflow-hidden"
              style={{
                backgroundColor: '#FFFDF5',
                borderColor: '#FDE68A',
              }}
            >
              <div className="flex items-center gap-3 w-full border-b pb-3" style={{ borderColor: '#FDE68A' }}>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-title font-bold text-amber-950">The Royal Will &amp; Riddle</h3>
                  <p className="text-small text-amber-800 font-medium">To my beloved son Khoisnam and our 99 relatives</p>
                </div>
              </div>

              <blockquote className="italic text-statement text-amber-950 border-l-4 border-amber-400 pl-4 py-1 leading-relaxed">
                “I have created a puzzle. If all 100 of you answer it at the same time, you will share the ratnas equally.
                However, if you are the first one to solve the problem, you will get to keep the entire inheritance to yourself. Good luck.”
              </blockquote>

              <p className="text-body text-slate-700 leading-relaxed">
                Queen Ratnamanjuri wanted her fortune of precious <strong>ratnas</strong> (gemstones) to go to her son
                <strong> Khoisnam</strong>, but knew the relatives would pester him forever. She had trained him in puzzle-solving.
                The royal minister escorted all 100 of them into a secret vaulted mansion chamber containing <strong>100 locked doors</strong>.
              </p>

              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/80 border border-amber-200 flex items-center gap-3">
                  <Gem className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-ui font-semibold text-slate-800">Fortune of Ratnas</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-amber-200 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-ui font-semibold text-slate-800">100 Secret Lockers</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 border border-amber-200 flex items-center gap-3">
                  <Key className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-ui font-semibold text-slate-800">100 People Assigned</span>
                </div>
              </div>
            </div>

            <p className="text-small text-slate-500 font-medium">
              Tap anywhere or press Next to discover the minister's rules.
            </p>
          </div>
        )}

        {/* Step 2: The Minister's 100 Rules */}
        {stepIndex === 1 && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
            <HighlightHeadline
              text="The Minister's Rules: Person by Person"
              focusWord="Person by Person"
              focusColor="number"
            />

            <p className="text-body text-slate-600 max-w-xl">
              Each person is numbered from <strong>1 to 100</strong>. Initially, all 100 lockers are firmly closed.
              Each person steps into the chamber one by one:
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              <div className="p-4 rounded-2xl bg-white border shadow-2xs flex items-start gap-3.5" style={{ borderColor: COLORS.divider }}>
                <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-ui">1</span>
                <div>
                  <h4 className="text-ui font-bold text-slate-900">Person 1 opens every locker</h4>
                  <p className="text-small text-slate-600 mt-0.5">Touches lockers 1, 2, 3, 4, 5... all 100 are now OPEN.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border shadow-2xs flex items-start gap-3.5" style={{ borderColor: COLORS.divider }}>
                <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-ui">2</span>
                <div>
                  <h4 className="text-ui font-bold text-slate-900">Person 2 toggles every 2nd locker</h4>
                  <p className="text-small text-slate-600 mt-0.5">Closes 2, 4, 6, 8, 10... (multiples of 2).</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border shadow-2xs flex items-start gap-3.5" style={{ borderColor: COLORS.divider }}>
                <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-ui">3</span>
                <div>
                  <h4 className="text-ui font-bold text-slate-900">Person 3 toggles every 3rd locker</h4>
                  <p className="text-small text-slate-600 mt-0.5">Toggles 3, 6, 9, 12, 15... (multiples of 3).</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border shadow-2xs flex items-start gap-3.5" style={{ borderColor: COLORS.divider }}>
                <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-ui">k</span>
                <div>
                  <h4 className="text-ui font-bold text-slate-900">Person k toggles every k-th locker</h4>
                  <p className="text-small text-slate-600 mt-0.5">Opens it if closed, closes it if open.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-statement max-w-xl text-center">
              ✨ <strong>Khoisnam smiled:</strong> Before anyone took a single step, he already knew exactly which lockers would end up open!
            </div>
          </div>
        )}

        {/* Step 3: Interactive 100-Locker Chamber */}
        {stepIndex === 2 && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-3">
            <div className="flex flex-col items-center text-center">
              <HighlightHeadline
                text="Live Chamber Simulation: 100 Lockers"
                focusWord="100 Lockers"
                focusColor="root"
              />
              <p className="text-small text-slate-600 mt-1">
                Drag the slider or tap Play to watch people toggle lockers. Click any locker to inspect its visitors and concept hints!
              </p>
            </div>

            {/* Controls Bar */}
            <div
              className="w-full p-3.5 rounded-2xl bg-white border flex flex-wrap items-center justify-between gap-3 shadow-xs"
              style={{ borderColor: COLORS.divider }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-3.5 py-1.5 rounded-xl text-ui font-bold flex items-center gap-1.5 cursor-pointer text-white shadow-xs transition-colors"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPerson((p) => Math.min(100, p + 1));
                  }}
                  disabled={currentPerson >= 100}
                  className="px-3 py-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100 text-ui font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                  style={{ borderColor: COLORS.divider }}
                >
                  +1 Person
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPerson(100);
                  }}
                  className="px-3 py-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100 text-ui font-semibold text-slate-700 cursor-pointer flex items-center gap-1"
                  style={{ borderColor: COLORS.divider }}
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>All 100</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPerson(0);
                  }}
                  className="p-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  style={{ borderColor: COLORS.divider }}
                  title="Reset to 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Slider for Current Person */}
              <div className="flex items-center gap-3">
                <span className="text-small font-semibold text-slate-700">
                  After Person <strong>{currentPerson}</strong>:
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentPerson}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentPerson(parseInt(e.target.value, 10));
                  }}
                  className="w-32 sm:w-44 accent-[#005583] cursor-pointer"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilterHighlight((f) => (f === 'squares' ? 'none' : 'squares'))}
                  className={`px-2.5 py-1 rounded-lg text-micro font-bold cursor-pointer transition-colors ${filterHighlight === 'squares' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Squares (Open)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterHighlight((f) => (f === 'primes' ? 'none' : 'primes'))}
                  className={`px-2.5 py-1 rounded-lg text-micro font-bold cursor-pointer transition-colors ${filterHighlight === 'primes' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Primes (2 Toggles)
                </button>
              </div>
            </div>

            {/* 10x10 Locker Grid */}
            <div
              className="w-full bg-white p-3 rounded-2xl border shadow-xs flex flex-col items-center"
              style={{ borderColor: COLORS.divider }}
            >
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[680px]">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((lockerNum) => {
                  const toggles = getToggledBy(lockerNum, currentPerson).length;
                  const open = toggles % 2 === 1;
                  const isSelected = selectedLocker === lockerNum;
                  const isSq = isSquare(lockerNum);
                  const isPr = isPrime(lockerNum);

                  const highlighted =
                    filterHighlight === 'squares' ? isSq : filterHighlight === 'primes' ? isPr : false;

                  return (
                    <button
                      key={lockerNum}
                      type="button"
                      onClick={() => setSelectedLocker(lockerNum)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center font-bold transition-all cursor-pointer select-none text-[10px] sm:text-xs border ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500 scale-105 z-10' : ''
                        } ${open
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-extrabold'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                        } ${highlighted ? 'ring-2 ring-amber-500 ring-offset-1 scale-105 font-black' : ''}`}
                    >
                      <span>{lockerNum}</span>
                      {open ? (
                        <Unlock className="w-2.5 h-2.5 text-amber-600 mt-0.5" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-slate-400 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Locker Inspector Card with Door Toggles and Concept Hint */}
            <div
              className="w-full max-w-4xl p-4 rounded-2xl bg-white border flex flex-col gap-3.5 shadow-2xs"
              style={{ borderColor: COLORS.divider }}
            >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`p-3 rounded-2xl flex items-center justify-center ${selectedIsOpen ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                              {selectedIsOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-statement font-bold text-slate-900">Locker #{selectedLocker}</h4>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-micro font-bold ${selectedIsOpen
                                      ? 'bg-amber-200 text-amber-900'
                                      : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                  {selectedIsOpen ? 'OPEN' : 'CLOSED'}
                                </span>
                      {selectedIsSquare && (
                        <span className="px-2 py-0.5 rounded-full text-micro font-bold bg-orange-100 text-orange-800">
                          Square ({Math.round(Math.sqrt(selectedLocker))}²)
                        </span>
                      )}
                      {selectedIsPrime && (
                        <span className="px-2 py-0.5 rounded-full text-micro font-bold bg-blue-100 text-blue-800">
                          Prime (Passcode)
                        </span>
                      )}
                    </div>
                    <p className="text-small text-slate-600 mt-1">
                      Toggled <strong>{selectedTogglers.length} times</strong> so far by:{' '}
                      <span className="font-mono font-semibold text-blue-800">
                        {selectedTogglers.length > 0 ? selectedTogglers.join(', ') : 'None'}
                      </span>
                    </p>
                  </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowDoorTogglesHistory((prev) => !prev)}
                                className="px-3 py-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100 text-micro font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                                style={{ borderColor: COLORS.divider }}
                              >
                                <History className="w-3.5 h-3.5 text-slate-500" />
                                <span>{showDoorTogglesHistory ? 'Hide Toggles' : 'View Toggle History'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowDoorConceptHint((prev) => !prev)}
                                className="px-3 py-1.5 rounded-xl border bg-amber-50 hover:bg-amber-100 text-micro font-semibold text-amber-900 flex items-center gap-1.5 cursor-pointer border-amber-200"
                              >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span>{showDoorConceptHint ? 'Hide Concept' : 'Why this door?'}</span>
                              </button>
                            </div>
                          </div>

                              {/* Expandable Step-by-Step Toggle Sequence */}
                              {showDoorTogglesHistory && (
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 animate-fade-rise">
                                  <div className="text-micro font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                    <History className="w-3.5 h-3.5" />
                                    <span>Sequential Door Toggles for Locker #{selectedLocker}:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedTogglers.map((p, idx) => {
                                      const isNowOpen = idx % 2 === 0;
                                      return (
                                        <div
                                          key={p}
                                          className={`px-2 py-1 rounded-lg text-micro font-medium flex items-center gap-1 border ${isNowOpen
                                              ? 'bg-amber-100/70 border-amber-200 text-amber-950 font-semibold'
                                              : 'bg-slate-200/70 border-slate-300 text-slate-700'
                                            }`}
                                        >
                                          <span className="font-bold">P{p}:</span>
                                          <span>{isNowOpen ? 'Opens 🔓' : 'Closes 🔒'}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
              )}

                            {/* Concept Hint Box for Selected Door */}
                            {showDoorConceptHint && (
                              <div
                                className="p-3 rounded-xl border text-small leading-relaxed animate-fade-rise"
                                style={{
                                  backgroundColor: selectedIsSquare ? '#FEF3C7' : '#EFF6FF',
                                  borderColor: selectedIsSquare ? '#FDE68A' : '#BFDBFE',
                                  color: selectedIsSquare ? '#78350F' : '#1E3A8A',
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Concept insight for Locker #{selectedLocker}:</strong>{' '}
                                    {selectedIsSquare ? (
                                      <span>
                                        Notice its factor pairs:{' '}
                                        <span className="font-mono font-bold">
                                          {selectedPairs.map(([a, b]) => `${a}×${b}`).join(', ')}
                                        </span>
                                        . Because{' '}
                                        <strong>
                                          {Math.round(Math.sqrt(selectedLocker))} × {Math.round(Math.sqrt(selectedLocker))} = {selectedLocker}
                                        </strong>
                                        , it pairs with itself! That means it has an <strong>ODD</strong> number of factors (
                                        {selectedAllFactors.length} toggles). Since every open/close alternates, an ODD number of
                                        toggles guarantees it <strong>stays OPEN</strong>!
                                      </span>
                                    ) : (
                                      <span>
                                        Notice its factor pairs:{' '}
                                        <span className="font-mono font-bold">
                                          {selectedPairs.map(([a, b]) => `${a}×${b}`).join(', ')}
                                        </span>
                                        . Every factor has a distinct partner, so they always come in pairs of 2. That gives an{' '}
                                        <strong>EVEN</strong> number of factors ({selectedAllFactors.length} toggles). An EVEN number
                                        of toggles guarantees it <strong>ends up CLOSED</strong>!
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
        )}

                        {/* Step 4: Interactive Student Puzzle Challenge (with Progressive Hints!) */}
                        {stepIndex === 3 && (
                            <div className="w-full max-w-4xl flex flex-col items-center gap-4 text-center">
                              <HighlightHeadline
                                text="Can You Solve Queen Ratnamanjuri's Puzzle?"
                                focusWord="Solve Queen Ratnamanjuri's Puzzle"
                                focusColor="root"
                              />

                                <p className="text-body text-slate-600 max-w-xl">
                                  Queen Ratnamanjuri promised the entire inheritance to whoever figures it out first.
                                  Before revealing Khoisnam's answer, <strong>can you find the open lockers yourself?</strong>
                                </p>

                                    {/* Progressive Hints Accordion */ }
                                    <div className="w-full bg-white p-4 rounded-3xl border shadow-xs flex flex-col gap-2.5 text-left" style={{ borderColor: COLORS.divider }}>
                                      <div className="flex items-center justify-between">
                                        <span className="text-ui font-bold text-slate-800 flex items-center gap-2">
                                          <Lightbulb className="w-4 h-4 text-amber-500" />
                                          <span>Progressive Concept Hints ({revealedHintCount} of {PUZZLE_HINTS.length} Unlocked)</span>
                                        </span>
                                        {revealedHintCount < PUZZLE_HINTS.length && (
                                          <button
                                            type="button"
                                            onClick={() => setRevealedHintCount((c) => Math.min(PUZZLE_HINTS.length, c + 1))}
                                            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-micro cursor-pointer shadow-2xs transition-colors"
                                          >
                                            Unlock Next Hint (+1)
                                          </button>
                                        )}
                                      </div>

                                      <div className="space-y-2 mt-1">
                                        {PUZZLE_HINTS.slice(0, revealedHintCount).map((hint) => (
                                          <div
                                            key={hint.level}
                                            className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-small text-slate-800 leading-relaxed animate-fade-rise"
                                          >
                                            <strong className="text-amber-900 block mb-0.5">{hint.title}:</strong>
                                            <span>{hint.content}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Interactive Guessing / Testing Chamber */ }
            <div className="w-full bg-white p-4 rounded-3xl border shadow-xs flex flex-col items-center gap-3" style={{ borderColor: COLORS.divider }}>
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 text-left">
                <div>
                  <h4 className="text-statement font-bold text-slate-900">Tap to Select Your Predicted Open Lockers</h4>
                  <p className="text-small text-slate-600">
                    Which locker numbers will have an odd number of factors? (Click to mark)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-small font-bold text-blue-900 px-3 py-1 rounded-full bg-blue-100">
                    Selected: {predictedLockers.size} / 10 Open Lockers
                  </span>
                </div>
              </div>

              {/* 10x10 Tap-to-Predict Grid */}
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[640px]">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
                  const isPredicted = predictedLockers.has(num);
                  const isSq = isSquare(num);
                  const isRevealedSquare = showSolutionRevealed && isSq;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => togglePrediction(num)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center font-bold transition-all cursor-pointer select-none text-[10px] sm:text-xs border ${
                        isRevealedSquare
                          ? 'bg-amber-300 text-amber-950 border-amber-500 ring-2 ring-amber-400 font-black scale-105 shadow-xs'
                          : isPredicted
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs scale-105'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span>{num}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert if tested */}
              {solverFeedback && (
                <div className="w-full p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 font-semibold text-small animate-fade-rise">
                  {solverFeedback}
                </div>
              )}

              {/* Buttons: Check My Prediction OR Reveal Khoisnam's Solution */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckPredictions}
                  className="px-5 py-2.5 rounded-full text-ui font-bold text-white shadow-xs hover:opacity-95 cursor-pointer transition-all"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Check My Prediction
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPredictedLockers(new Set(SQUARE_LOCKERS));
                    setShowSolutionRevealed(true);
                    setRevealedHintCount(4);
                  }}
                  className="px-5 py-2.5 rounded-full border bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-ui cursor-pointer border-amber-200 shadow-2xs"
                >
                  Reveal Khoisnam's Solution
                </button>

                {predictedLockers.size > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPredictedLockers(new Set());
                      setShowSolutionRevealed(false);
                      setSolverFeedback(null);
                    }}
                    className="p-2 rounded-full border bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Clear selections"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Revealed Solution Card */}
              {showSolutionRevealed && (
                <div className="w-full mt-2 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center animate-fade-rise">
                  <h4 className="text-statement font-extrabold text-amber-950 mb-2">
                    ✨ Exactly 10 Lockers Remain Open:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-xl mx-auto">
                    {SQUARE_LOCKERS.map((num) => {
                      const root = Math.round(Math.sqrt(num));
                      return (
                        <div key={num} className="p-2 rounded-xl bg-white border border-amber-300 font-bold text-amber-950 shadow-2xs">
                          <span className="text-ui font-black">#{num}</span>
                          <span className="block text-[11px] text-amber-700">{root}² ({root}×{root})</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-small text-amber-900 mt-3 max-w-lg mx-auto">
                    Only these numbers have a factor multiplied by itself, producing an <strong>odd number of factors</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

                                {/* Step 5: The Secret Passcode */}
                                {stepIndex === 4 && (
                                  <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
                                    <HighlightHeadline
                                      text="The Secret Passcode: Touched Exactly Twice"
                                      focusWord="Touched Exactly Twice"
                                      focusColor="root"
                                    />

                                    <div
                                      className="w-full p-6 md:p-8 rounded-3xl border bg-white shadow-sm flex flex-col items-center gap-5"
                                      style={{ borderColor: COLORS.divider }}
                                    >
                                      <p className="text-statement text-slate-700 max-w-xl">
                                        Inside the 10 open lockers, Khoisnam gathered word clues that read:
                                      </p>

                                      <blockquote className="text-headline text-blue-950 font-bold bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl shadow-inner">
                                        “The passcode consists of the first five locker numbers that were touched exactly twice.”
                                      </blockquote>

                                      <div className="flex flex-wrap items-center justify-center gap-3">
                                        {FIRST_5_PRIMES.map((p) => (
                                          <div
                                            key={p}
                                            className="h-14 w-14 rounded-2xl bg-blue-600 text-white font-black text-title flex items-center justify-center shadow-sm"
                                          >
                                            {p}
                                          </div>
                                        ))}
                                      </div>

                                      <div className="text-body text-slate-600 max-w-lg leading-relaxed">
                                        A locker was touched <strong>exactly twice</strong> if and only if its only factors are <strong>1</strong> and <strong>itself</strong>.
                                        These are the <strong>prime numbers</strong>!
                                        <div className="mt-2 text-ui font-bold text-emerald-700">
                                          Safe Passcode: 2 – 3 – 5 – 7 – 11 🔓
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              );
  }

                              // Render SubTab 2: Factor Pairs & Squares
                              return (
                              <div className="w-full flex flex-col items-center gap-4 animate-fade-rise">
                                {/* Step 1: Toggles = Factors */}
                                {stepIndex === 0 && (
                                  <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
                                    <HighlightHeadline
                                      text="The Golden Rule: Odd vs Even Toggles"
                                      focusWord="Odd vs Even"
                                      focusColor="root"
                                    />

                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                      <div className="p-5 rounded-3xl bg-white border shadow-2xs flex flex-col gap-3" style={{ borderColor: COLORS.divider }}>
                                        <div className="flex items-center gap-2.5 text-blue-700 font-bold text-statement">
                                          <Lock className="w-5 h-5" />
                                          <span>Even Number of Toggles</span>
                                        </div>
                                        <p className="text-body text-slate-600">
                                          Starts <strong>Closed</strong> → Person 1 Opens → Person 2 Closes → Person 3 Opens → Person 4 Closes...
                                        </p>
                                        <div className="p-3 rounded-xl bg-slate-100 font-bold text-slate-800 text-ui">
                                          Result: Ends CLOSED 🔒
                                        </div>
                                        <span className="text-small text-slate-500">Every factor has a separate partner factor.</span>
                                      </div>

                                      <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col gap-3">
                                        <div className="flex items-center gap-2.5 text-amber-800 font-bold text-statement">
                                          <Unlock className="w-5 h-5 text-amber-600" />
                                          <span>Odd Number of Toggles</span>
                                        </div>
                                        <p className="text-body text-slate-700">
                                          Starts <strong>Closed</strong> → Opens (1) → Closes (2) → Opens (3) → Closes (4) → <strong>Opens (5)</strong>!
                                        </p>
                                        <div className="p-3 rounded-xl bg-amber-200 font-bold text-amber-900 text-ui">
                                          Result: Ends OPEN 🔑
                                        </div>
                                        <span className="text-small text-amber-800">One factor is paired with itself, leaving an odd count!</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Step 2: Partner Factors of Normal Numbers */}
                                {stepIndex === 1 && (
                                  <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
                                    <HighlightHeadline
                                      text="Partner Factors: Why Normal Numbers are Even"
                                      focusWord="Partner Factors"
                                      focusColor="number"
                                    />

                                    <p className="text-body text-slate-600 max-w-xl">
                                      Each factor of a number has a <strong>partner factor</strong> so that their product yields the number:
                                    </p>

                                    <div className="w-full p-6 rounded-3xl bg-white border shadow-2xs flex flex-col items-center gap-4" style={{ borderColor: COLORS.divider }}>
                                      <div className="flex items-center gap-3">
                                        <span className="text-title font-extrabold text-blue-900">Examining Locker #6:</span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                                          <div className="text-statement font-bold text-blue-900">1 × 6 = 6</div>
                                          <div className="text-small text-blue-700 mt-1">Partner pair: 1 &amp; 6</div>
                                        </div>
                                        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                                          <div className="text-statement font-bold text-blue-900">2 × 3 = 6</div>
                                          <div className="text-small text-blue-700 mt-1">Partner pair: 2 &amp; 3</div>
                                        </div>
                                      </div>

                                      <p className="text-body text-slate-700 max-w-lg">
                                        Factors of 6 are <strong>1, 2, 3, and 6</strong> (total <strong>4 factors</strong>).
                                        Because factors come in 2 pairs of distinct numbers, the count is <strong>4 (an even number)</strong>.
                                        Person 1 opens, Person 2 closes, Person 3 opens, Person 6 closes. It ends <strong>CLOSED</strong>.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Step 3: The Self-Pair (Square Numbers) */}
                                {stepIndex === 2 && (
                                  <div className="w-full max-w-3xl flex flex-col items-center gap-5 text-center">
                                    <HighlightHeadline
                                      text="The Self-Pair: The Secret of 36 (and all Squares)"
                                      focusWord="Secret of 36"
                                      focusColor="area"
                                    />

                                    <div className="w-full p-6 rounded-3xl bg-white border shadow-2xs flex flex-col items-center gap-4" style={{ borderColor: COLORS.divider }}>
                                      <span className="text-title font-bold text-slate-900">Factor Pairs of 36:</span>

                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full max-w-2xl">
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                          <span className="text-ui font-semibold text-slate-700">1 × 36</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                          <span className="text-ui font-semibold text-slate-700">2 × 18</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                          <span className="text-ui font-semibold text-slate-700">3 × 12</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                          <span className="text-ui font-semibold text-slate-700">4 × 9</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-orange-100 border border-orange-300 text-center font-bold text-orange-900 shadow-2xs">
                                          <span>6 × 6</span>
                                          <span className="block text-[10px] text-orange-700">Self-Pair!</span>
                                        </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-body text-slate-800 leading-relaxed max-w-xl">
                                        Every factor of 36 has a distinct partner, <strong>except 6</strong>!
                                        The factor 6 pairs with itself (6 × 6 = 36), so it only gets listed <strong>once</strong> in the factor list:
                                        <div className="font-mono font-bold text-blue-900 my-1">
                                          {'{ 1, 2, 3, 4, 6, 9, 12, 18, 36 }'} → 9 factors (ODD!)
                                        </div>
                                        An odd number of toggles guarantees that Locker 36 ends up <strong>OPEN</strong>!
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Step 4: Squares as Tile Areas */}
                                {stepIndex === 3 && (
                                  <div className="w-full max-w-3xl flex flex-col items-center gap-4 text-center">
                                    <HighlightHeadline
                                      text="Why are they called 'Square' Numbers?"
                                      focusWord="'Square' Numbers"
                                      focusColor="area"
                                    />

                                    <p className="text-body text-slate-600 max-w-xl">
                                      A square of side length <em>n</em> contains exactly <span style={{ color: COLORS.area.solid }}>n × n = n²</span> unit squares of area.
                                    </p>

                                    <div className="w-full p-5 rounded-3xl bg-white border shadow-2xs flex flex-col items-center gap-4" style={{ borderColor: COLORS.divider }}>
                                      <div className="flex items-center gap-3">
                                        <label htmlFor="area-slider" className="text-ui font-bold text-slate-800">
                                          Side length (n): <span className="text-emerald-700 text-title font-extrabold">{sideN}</span>
                                        </label>
                                        <input
                                          id="area-slider"
                                          type="range"
                                          min={1}
                                          max={10}
                                          value={sideN}
                                          onChange={(e) => setSideN(parseInt(e.target.value, 10))}
                                          className="w-40 accent-[#16A34A] cursor-pointer"
                                        />
                                      </div>

                                      {/* SVG Square Tile Area Visualizer */}
                                      <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                        <svg width={Math.min(260, sideN * 26)} height={Math.min(260, sideN * 26)} className="transition-all">
                                          {Array.from({ length: sideN }).map((_, row) =>
                                            Array.from({ length: sideN }).map((_, col) => {
                                              const tileSize = Math.min(26, 260 / sideN);
                                              return (
                                                <rect
                                                  key={`${row}-${col}`}
                                                  x={col * tileSize + 1}
                                                  y={row * tileSize + 1}
                                                  width={tileSize - 2}
                                                  height={tileSize - 2}
                                                  rx={3}
                                                  fill={COLORS.area.solid}
                                                  fillOpacity={0.85}
                                                  stroke="#EA580C"
                                                  strokeWidth={1}
                                                />
                                              );
                                            })
                                          )}
                                        </svg>
                                      </div>

                                      <div className="text-statement font-bold text-slate-900">
                                        Area = <span style={{ color: COLORS.side.solid }}>{sideN}</span> ×{' '}
                                        <span style={{ color: COLORS.side.solid }}>{sideN}</span> ={' '}
                                        <span style={{ color: COLORS.area.solid }}>{sideN * sideN} unit squares</span> ({sideN}²)
                                      </div>

                                      {/* Fractions and decimals box */}
                                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-small text-slate-700">
                                          <strong>Fraction square:</strong>
                                          <div className="mt-1">
                                            <Katex latex="\\left(\\frac{3}{5}\\right)^2 = \\frac{3}{5} \\times \\frac{3}{5} = \\frac{9}{25}" />
                                          </div>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-small text-slate-700">
                                          <strong>Decimal square:</strong>
                                          <div className="mt-1">
                                            <Katex latex="(2.5)^2 = 2.5 \\times 2.5 = 6.25" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Step 5: Story Quiz */}
                                {stepIndex === 4 && (
                                  <div className="w-full max-w-2xl flex flex-col items-center gap-5 text-center">
                                    <HighlightHeadline
                                      text="Figure It Out: Story Mastery Quiz"
                                      focusWord="Mastery Quiz"
                                      focusColor="root"
                                    />

                                    <div className="w-full flex flex-col gap-4 text-left">
                                      {/* Q1 */}
                                      <div className="p-5 rounded-2xl bg-white border shadow-2xs" style={{ borderColor: COLORS.divider }}>
                                        <h4 className="text-ui font-bold text-slate-900 mb-2.5">
                                          1. Why does Locker #49 remain open at the very end?
                                        </h4>
                                        <div className="space-y-1.5">
                                          {[
                                            'Because 49 is an odd number',
                                            'Because 7 × 7 = 49 gives it an odd number of factors (3 factors: 1, 7, 49)',
                                            'Because Person 49 opens it and nobody touches it again',
                                          ].map((opt, optIdx) => {
                                            const isSelected = quizAnswers[0] === optIdx;
                                            const isCorrect = optIdx === 1;
                                            return (
                                              <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [0]: optIdx }))}
                                                className={`w-full p-3 rounded-xl border text-small text-left flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                                    ? isCorrect
                                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                                      : 'bg-red-50 border-red-300 text-red-950'
                                                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                                                  }`}
                                              >
                                                <span>{opt}</span>
                                                {isSelected && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />)}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Q2 */}
                                      <div className="p-5 rounded-2xl bg-white border shadow-2xs" style={{ borderColor: COLORS.divider }}>
                                        <h4 className="text-ui font-bold text-slate-900 mb-2.5">
                                          2. How many people toggle Locker #12, and what is its final state?
                                        </h4>
                                        <div className="space-y-1.5">
                                          {[
                                            '6 people (1, 2, 3, 4, 6, 12) → ends CLOSED (even count)',
                                            '5 people → ends OPEN',
                                            '12 people → ends CLOSED',
                                          ].map((opt, optIdx) => {
                                            const isSelected = quizAnswers[1] === optIdx;
                                            const isCorrect = optIdx === 0;
                                            return (
                                              <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [1]: optIdx }))}
                                                className={`w-full p-3 rounded-xl border text-small text-left flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                                    ? isCorrect
                                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                                      : 'bg-red-50 border-red-300 text-red-950'
                                                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                                                  }`}
                                              >
                                                <span>{opt}</span>
                                                {isSelected && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />)}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Q3 */}
                                      <div className="p-5 rounded-2xl bg-white border shadow-2xs" style={{ borderColor: COLORS.divider }}>
                                        <h4 className="text-ui font-bold text-slate-900 mb-2.5">
                                          3. What were the first five lockers touched exactly twice (the safe passcode)?
                                        </h4>
                                        <div className="space-y-1.5">
                                          {[
                                            '1, 4, 9, 16, 25 (Squares)',
                                            '2, 3, 5, 7, 11 (Prime Numbers)',
                                            '2, 4, 6, 8, 10 (Even Numbers)',
                                          ].map((opt, optIdx) => {
                                            const isSelected = quizAnswers[2] === optIdx;
                                            const isCorrect = optIdx === 1;
                                            return (
                                              <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [2]: optIdx }))}
                                                className={`w-full p-3 rounded-xl border text-small text-left flex items-center justify-between cursor-pointer transition-colors ${isSelected
                                                    ? isCorrect
                                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                                      : 'bg-red-50 border-red-300 text-red-950'
                                                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                                                  }`}
                                              >
                                                <span>{opt}</span>
                                                {isSelected && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />)}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              );
};
