/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SceneComponentProps } from '../types';
import { COLORS } from '../design/tokens';

export const FoundationDemoInteractiveControls: React.FC<{
  params: Record<string, number>;
  setParam: (key: string, value: number) => void;
}> = ({ params, setParam }) => {
  const n = params.n ?? 4;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <label htmlFor="foundation-slider" className="text-body font-semibold flex items-center gap-2" style={{ color: COLORS.headingText }}>
          Side length (<span style={{ color: COLORS.side.solid }}>n</span>):
          <span className="px-2.5 py-0.5 rounded-full text-ui font-bold" style={{ backgroundColor: COLORS.side.tint, color: COLORS.side.text }}>
            {n}
          </span>
        </label>
        <input
          id="foundation-slider"
          type="range"
          min={1}
          max={8}
          step={1}
          value={n}
          onChange={(e) => setParam('n', parseInt(e.target.value, 10))}
          className="w-40 accent-[#16A34A] cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 text-ui font-semibold">
        <span>Area (<span style={{ color: COLORS.area.solid }}>n²</span>):</span>
        <span className="px-3 py-1 rounded-full text-title font-bold" style={{ backgroundColor: COLORS.area.tint, color: COLORS.area.text }}>
          {n * n}
        </span>
      </div>
    </div>
  );
};

export const FoundationDemoScene: React.FC<SceneComponentProps> = ({
  t,
  beatIndex,
  localProgress,
  params,
}) => {
  const viewWidth = 500;
  const viewHeight = 340;

  // Derive geometric size smoothly from t and params
  const targetN = params.n ?? (beatIndex === 0 ? 3 : beatIndex === 1 ? 4 : 5);
  const n = targetN;
  const area = n * n;

  const tileSize = Math.min(36, 180 / Math.max(1, n));
  const gridW = n * tileSize;
  const gridH = n * tileSize;
  const startX = (viewWidth - gridW) / 2;
  const startY = (viewHeight - gridH) / 2 + 10;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className="w-full h-auto max-h-[340px] rounded-2xl select-none"
      style={{ backgroundColor: COLORS.canvasBg }}
    >
      {/* Faint Grid Background */}
      <defs>
        <pattern id="foundation-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.canvasGrid} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={viewWidth} height={viewHeight} fill="url(#foundation-grid)" />

      {/* Top dimension line: Side length n (Green #16A34A) */}
      <g transform={`translate(${startX}, ${startY - 16})`}>
        <line x1={0} y1={0} x2={gridW} y2={0} stroke={COLORS.side.solid} strokeWidth={2} strokeLinecap="round" />
        <line x1={0} y1={-4} x2={0} y2={4} stroke={COLORS.side.solid} strokeWidth={2} />
        <line x1={gridW} y1={-4} x2={gridW} y2={4} stroke={COLORS.side.solid} strokeWidth={2} />
        <text
          x={gridW / 2}
          y={-8}
          textAnchor="middle"
          className="text-micro font-bold"
          fill={COLORS.side.text}
        >
          side = {n}
        </text>
      </g>

      {/* Left dimension line: Side length n (Green #16A34A) */}
      <g transform={`translate(${startX - 16}, ${startY})`}>
        <line x1={0} y1={0} x2={0} y2={gridH} stroke={COLORS.side.solid} strokeWidth={2} strokeLinecap="round" />
        <line x1={-4} y1={0} x2={4} y2={0} stroke={COLORS.side.solid} strokeWidth={2} />
        <line x1={-4} y1={gridH} x2={4} y2={gridH} stroke={COLORS.side.solid} strokeWidth={2} />
        <text
          x={-10}
          y={gridH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-micro font-bold"
          fill={COLORS.side.text}
        >
          {n}
        </text>
      </g>

      {/* Square Area Grid (Orange #F27A00) */}
      <g transform={`translate(${startX}, ${startY})`}>
        <rect
          x={0}
          y={0}
          width={gridW}
          height={gridH}
          rx={6}
          fill={COLORS.area.tint}
          stroke={COLORS.area.solid}
          strokeWidth={2}
        />

        {/* Unit Tile Grid */}
        {Array.from({ length: n }).map((_, c) =>
          Array.from({ length: n }).map((_, r) => (
            <rect
              key={`tile-${c}-${r}`}
              x={c * tileSize}
              y={r * tileSize}
              width={tileSize}
              height={tileSize}
              fill="none"
              stroke={COLORS.area.solid}
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          ))
        )}

        {/* Center Area Badge */}
        <g transform={`translate(${gridW / 2}, ${gridH / 2})`}>
          <rect
            x={-42}
            y={-14}
            width={84}
            height={28}
            rx={6}
            fill={COLORS.surface}
            stroke={COLORS.area.solid}
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-micro font-extrabold"
            fill={COLORS.area.text}
          >
            Area = {area}
          </text>
        </g>
      </g>

      {/* Subtitle / Timeline status bar */}
      <g transform={`translate(${viewWidth / 2}, ${startY + gridH + 34})`}>
        <text textAnchor="middle" className="text-micro font-medium" fill={COLORS.mutedText}>
          Timeline t = {t.toFixed(2)} · Beat {beatIndex}
        </text>
      </g>
    </svg>
  );
};
