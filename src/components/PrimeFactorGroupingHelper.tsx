/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COLORS } from '../design/tokens';
import { Katex } from './Katex';
import { Calculator, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export interface PrimeFactorGroupingHelperProps {
  initialNumber?: number;
  className?: string;
}

const PRESET_NUMBERS = [
  { num: 144, label: '144 (Square: 12²)' },
  { num: 252, label: '252 (NCERT Multiply by 7)' },
  { num: 392, label: '392 (NCERT Multiply by 7)' },
  { num: 675, label: '675 (NCERT Cube)' },
  { num: 1323, label: '1323 (Prompt Example: 3³ × 7²)' },
  { num: 9408, label: '9408 (NCERT Divide by 3)' },
  { num: 17576, label: '17576 (Cube: 26³)' },
];

interface FactorLadderStep {
  divisor: number;
  quotient: number;
}

function computePrimeFactorLadder(n: number): { factors: number[]; steps: FactorLadderStep[] } {
  let temp = n;
  const factors: number[] = [];
  const steps: FactorLadderStep[] = [];
  let d = 2;

  while (d * d <= temp) {
    while (temp % d === 0) {
      factors.push(d);
      steps.push({ divisor: d, quotient: temp });
      temp = Math.floor(temp / d);
    }
    d++;
  }
  if (temp > 1) {
    factors.push(temp);
    steps.push({ divisor: temp, quotient: temp });
    steps.push({ divisor: 1, quotient: 1 });
  } else if (steps.length > 0) {
    steps.push({ divisor: 1, quotient: 1 });
  }

  return { factors, steps };
}

export const PrimeFactorGroupingHelper: React.FC<PrimeFactorGroupingHelperProps> = ({
  initialNumber = 1323,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState<string>(String(initialNumber));
  const [groupMode, setGroupMode] = useState<'square' | 'cube'>('cube');

  const num = Math.max(2, Math.min(999999, parseInt(inputVal, 10) || 12));
  const { factors, steps } = computePrimeFactorLadder(num);

  // Count occurrences of each prime
  const factorCounts: Record<number, number> = {};
  factors.forEach((f) => {
    factorCounts[f] = (factorCounts[f] || 0) + 1;
  });

  const groupSize = groupMode === 'square' ? 2 : 3;

  // Compute multiplier & divider needed
  let multiplier = 1;
  let divider = 1;
  let isAlreadyPerfect = true;

  Object.entries(factorCounts).forEach(([factorStr, count]) => {
    const factor = parseInt(factorStr, 10);
    const remainder = count % groupSize;
    if (remainder !== 0) {
      isAlreadyPerfect = false;
      const neededToComplete = groupSize - remainder;
      multiplier *= Math.pow(factor, neededToComplete);
      divider *= Math.pow(factor, remainder);
    }
  });

  const resultingMultiplied = num * multiplier;
  const resultingMultipliedRoot =
    groupMode === 'square'
      ? Math.round(Math.sqrt(resultingMultiplied))
      : Math.round(Math.cbrt(resultingMultiplied));

  const resultingDivided = Math.floor(num / divider);
  const resultingDividedRoot =
    groupMode === 'square'
      ? Math.round(Math.sqrt(resultingDivided))
      : Math.round(Math.cbrt(resultingDivided));

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded-3xl border bg-white p-5 md:p-6 shadow-sm flex flex-col gap-6 ${className}`}
      style={{ borderColor: COLORS.divider }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: COLORS.divider }}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: COLORS.headingText }}>
            <Calculator className="w-5 h-5 text-[#005583]" />
            Prime-Factor Grouping Helper &amp; Multiplier/Divider Finder
          </h3>
          <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
            Box factors into pairs (for square roots) and triplets (for cube roots)
          </p>
        </div>

        {/* Group Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setGroupMode('square')}
            className={`px-3 py-1.5 rounded-lg text-micro font-bold transition-all cursor-pointer ${
              groupMode === 'square'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pairs of 2 (Square Root)
          </button>
          <button
            type="button"
            onClick={() => setGroupMode('cube')}
            className={`px-3 py-1.5 rounded-lg text-micro font-bold transition-all cursor-pointer ${
              groupMode === 'cube'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Triplets of 3 (Cube Root)
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-micro font-bold text-slate-500">NCERT Cases:</span>
        {PRESET_NUMBERS.map((p) => (
          <button
            key={p.num}
            type="button"
            onClick={() => setInputVal(String(p.num))}
            className={`px-2.5 py-1 rounded-lg text-micro font-semibold border transition-all cursor-pointer ${
              num === p.num
                ? 'bg-[#005583] text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Manual Input Bar */}
      <div className="flex items-center gap-3 p-2 rounded-2xl border bg-slate-50 border-slate-200">
        <label htmlFor="num-input" className="text-body font-bold ml-2 text-slate-700">
          Enter any number:
        </label>
        <input
          id="num-input"
          type="number"
          min={2}
          max={999999}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-36 px-3 py-1.5 rounded-xl border bg-white text-title font-extrabold text-[#005583] outline-none border-slate-300 focus:border-[#005583]"
        />
        <span className="text-micro font-semibold text-slate-500">
          N = {num}
        </span>
      </div>

      {/* Prime Factor Grouping Display */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-ui font-bold" style={{ color: COLORS.headingText }}>
            Prime Factorisation of {num}:
          </span>
          <span
            className="text-micro font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: isAlreadyPerfect ? '#DCFCE7' : '#FEF3C7',
              color: isAlreadyPerfect ? '#15803D' : '#B45309',
            }}
          >
            {isAlreadyPerfect
              ? groupMode === 'square'
                ? 'PERFECT SQUARE'
                : 'PERFECT CUBE'
              : groupMode === 'square'
              ? 'NOT A PERFECT SQUARE'
              : 'NOT A PERFECT CUBE'}
          </span>
        </div>

        {/* Visual Boxed Groups */}
        <div className="flex items-center gap-2.5 flex-wrap p-4 rounded-2xl bg-white border border-slate-200">
          {Object.entries(factorCounts).map(([factorStr, count]) => {
            const factor = parseInt(factorStr, 10);
            const fullGroupsCount = Math.floor(count / groupSize);
            const remainder = count % groupSize;
            const groups: React.ReactNode[] = [];

            // Complete groups
            for (let g = 0; g < fullGroupsCount; g++) {
              groups.push(
                <div
                  key={`group-${factor}-${g}`}
                  className="px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 shadow-2xs"
                  style={{
                    backgroundColor: groupMode === 'square' ? COLORS.area.tint : COLORS.volume.tint,
                    borderColor: groupMode === 'square' ? COLORS.area.solid : COLORS.volume.solid,
                  }}
                >
                  <span
                    className="text-ui font-extrabold"
                    style={{ color: groupMode === 'square' ? COLORS.area.text : COLORS.volume.text }}
                  >
                    ({Array(groupSize).fill(factor).join(' × ')})
                  </span>
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: groupMode === 'square' ? COLORS.area.solid : COLORS.volume.solid }}
                  />
                </div>
              );
            }

            // Incomplete group
            if (remainder > 0) {
              groups.push(
                <div
                  key={`incomplete-${factor}`}
                  className="px-3 py-1.5 rounded-xl border-2 border-dashed flex items-center gap-1.5 bg-rose-50 border-rose-400"
                >
                  <span className="text-ui font-extrabold text-rose-800">
                    {Array(remainder).fill(factor).join(' × ')}
                  </span>
                  <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                    Needs {groupSize - remainder} more
                  </span>
                </div>
              );
            }

            return (
              <div key={factor} className="flex items-center gap-2">
                {groups}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multiplier / Divider Finder Cards */}
      {!isAlreadyPerfect ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Multiply Card */}
          <div className="p-4 rounded-2xl border bg-emerald-50/70 border-emerald-200 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-ui">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Smallest Number to MULTIPLY:
            </div>
            <div className="text-2xl font-extrabold text-emerald-900">
              Multiply by {multiplier}
            </div>
            <div className="text-micro text-emerald-800 space-y-1">
              <p>
                {num} × <span className="font-bold">{multiplier}</span> ={' '}
                <span className="font-extrabold">{resultingMultiplied}</span>
              </p>
              <p className="font-semibold">
                {groupMode === 'square' ? `√${resultingMultiplied}` : `∛${resultingMultiplied}`} ={' '}
                <span className="text-emerald-950 font-extrabold">
                  {resultingMultipliedRoot}
                </span>
              </p>
            </div>
          </div>

          {/* Divide Card */}
          <div className="p-4 rounded-2xl border bg-purple-50/70 border-purple-200 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-ui">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Smallest Number to DIVIDE:
            </div>
            <div className="text-2xl font-extrabold text-purple-900">
              Divide by {divider}
            </div>
            <div className="text-micro text-purple-800 space-y-1">
              <p>
                {num} ÷ <span className="font-bold">{divider}</span> ={' '}
                <span className="font-extrabold">{resultingDivided}</span>
              </p>
              <p className="font-semibold">
                {groupMode === 'square' ? `√${resultingDivided}` : `∛${resultingDivided}`} ={' '}
                <span className="text-purple-950 font-extrabold">
                  {resultingDividedRoot}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-center space-y-1">
          <div className="text-ui font-extrabold text-emerald-900">
            {num} is already a perfect {groupMode === 'square' ? 'square' : 'cube'}!
          </div>
          <div className="text-title font-bold text-emerald-800">
            {groupMode === 'square'
              ? `√${num} = ${Math.round(Math.sqrt(num))}`
              : `∛${num} = ${Math.round(Math.cbrt(num))}`}
          </div>
        </div>
      )}

      {/* Step-by-Step Division Ladder */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-micro font-bold text-slate-700">
          Prime Division Ladder:
        </span>
        <div className="flex items-center gap-2 flex-wrap font-mono text-small font-bold text-slate-800">
          {steps.map((st, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                {st.quotient} ÷ <span className="text-rose-600 font-bold">{st.divisor}</span>
              </span>
              {i < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
