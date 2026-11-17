/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COLORS } from '../design/tokens';
import { Katex } from './Katex';
import { Layers, Grid, Sparkles, Plus, Minus } from 'lucide-react';

export interface DotGridSquareVisualizerProps {
  initialN?: number;
  initialMode?: 'square' | 'odd-borders';
  className?: string;
  onNChange?: (n: number) => void;
}

const L_LAYER_COLORS = [
  { fill: '#FEF3C7', stroke: '#D97706', text: '#B45309' }, // 1st layer: +1
  { fill: '#DCFCE7', stroke: '#16A34A', text: '#15803D' }, // 2nd layer: +3
  { fill: '#E0F2FE', stroke: '#0284C7', text: '#0369A1' }, // 3rd layer: +5
  { fill: '#FFEDD5', stroke: '#EA580C', text: '#C2410C' }, // 4th layer: +7
  { fill: '#F3E8FF', stroke: '#9333EA', text: '#7E22CE' }, // 5th layer: +9
  { fill: '#FCE7F3', stroke: '#DB2777', text: '#BE185D' }, // 6th layer: +11
  { fill: '#CCFBF1', stroke: '#0D9488', text: '#0F766E' }, // 7th layer: +13
  { fill: '#FEE2E2', stroke: '#DC2626', text: '#991B1B' }, // 8th layer: +15
  { fill: '#E0E7FF', stroke: '#4F46E5', text: '#3730A3' }, // 9th layer: +17
  { fill: '#FEF9C3', stroke: '#CA8A04', text: '#854D0E' }, // 10th layer: +19
];

export const DotGridSquareVisualizer: React.FC<DotGridSquareVisualizerProps> = ({
  initialN = 4,
  initialMode = 'square',
  className = '',
  onNChange,
}) => {
  const [n, setN] = useState<number>(initialN);
  const [mode, setMode] = useState<'square' | 'odd-borders'>(initialMode);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  const handleNChange = (newN: number) => {
    const clamped = Math.max(1, Math.min(10, newN));
    setN(clamped);
    onNChange?.(clamped);
  };

  const viewWidth = 520;
  const viewHeight = 380;
  const maxGridPixelSize = 240;
  const tileSize = Math.min(36, maxGridPixelSize / Math.max(1, n));
  const gridW = n * tileSize;
  const gridH = n * tileSize;
  const startX = (viewWidth - gridW) / 2;
  const startY = 60 + (maxGridPixelSize - gridH) / 2;

  // Odd numbers equation string: 1 + 3 + 5 + ... = n^2
  const oddTerms = Array.from({ length: n }, (_, i) => 2 * i + 1);
  const oddSumFormula = oddTerms.join(' + ') + ` = ${n * n}`;

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded-3xl border bg-white p-5 md:p-6 shadow-sm flex flex-col gap-5 ${className}`}
      style={{ borderColor: COLORS.divider }}
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: COLORS.divider }}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: COLORS.headingText }}>
            <Grid className="w-5 h-5 text-[#005583]" />
            Dot-Grid Square Visualizer
          </h3>
          <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
            Class 8 NCERT Ganita Prakash: Geometric representation of squares and odd numbers
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('square')}
            className={`px-3 py-1.5 rounded-lg text-micro font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'square' ? 'bg-white text-[#005583] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Square Area
          </button>
          <button
            type="button"
            onClick={() => setMode('odd-borders')}
            className={`px-3 py-1.5 rounded-lg text-micro font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'odd-borders' ? 'bg-white text-[#005583] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Odd Sums (L-Borders)
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-ui font-bold" style={{ color: COLORS.headingText }}>
            Side length (<span style={{ color: COLORS.side.solid }}>n</span>):
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNChange(n - 1)}
              disabled={n <= 1}
              className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span
              className="w-10 text-center text-ui font-extrabold px-2 py-1 rounded-md"
              style={{ backgroundColor: COLORS.side.tint, color: COLORS.side.text }}
            >
              {n}
            </span>
            <button
              type="button"
              onClick={() => handleNChange(n + 1)}
              disabled={n >= 10}
              className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={n}
            onChange={(e) => handleNChange(parseInt(e.target.value, 10))}
            className="w-28 sm:w-44 accent-[#16A34A] cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ui font-bold text-slate-700">
            Total Area (<span style={{ color: COLORS.area.solid }}>n²</span>):
          </span>
          <span
            className="px-3.5 py-1 rounded-full text-title font-extrabold shadow-2xs"
            style={{ backgroundColor: COLORS.area.tint, color: COLORS.area.text }}
          >
            {n * n}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="w-full flex items-center justify-center rounded-2xl border bg-white overflow-hidden"
        style={{
          borderColor: COLORS.divider,
          backgroundImage: `radial-gradient(${COLORS.canvasGrid} 1.5px, transparent 1.5px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-auto max-h-[380px] select-none"
        >
          {/* Top Dimension Marker: Side length n (Green #16A34A) */}
          <g transform={`translate(${startX}, ${startY - 18})`}>
            <line x1={0} y1={0} x2={gridW} y2={0} stroke={COLORS.side.solid} strokeWidth={2} strokeLinecap="round" />
            <line x1={0} y1={-4} x2={0} y2={4} stroke={COLORS.side.solid} strokeWidth={2} />
            <line x1={gridW} y1={-4} x2={gridW} y2={4} stroke={COLORS.side.solid} strokeWidth={2} />
            <rect
              x={gridW / 2 - 28}
              y={-14}
              width={56}
              height={20}
              rx={10}
              fill={COLORS.side.tint}
              stroke={COLORS.side.solid}
              strokeWidth={1}
            />
            <text
              x={gridW / 2}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-micro font-bold"
              fill={COLORS.side.text}
            >
              n = {n}
            </text>
          </g>

          {/* Left Dimension Marker: Side length n (Green #16A34A) */}
          <g transform={`translate(${startX - 18}, ${startY})`}>
            <line x1={0} y1={0} x2={0} y2={gridH} stroke={COLORS.side.solid} strokeWidth={2} strokeLinecap="round" />
            <line x1={-4} y1={0} x2={4} y2={0} stroke={COLORS.side.solid} strokeWidth={2} />
            <line x1={-4} y1={gridH} x2={4} y2={gridH} stroke={COLORS.side.solid} strokeWidth={2} />
            <rect
              x={-34}
              y={gridH / 2 - 10}
              width={48}
              height={20}
              rx={10}
              fill={COLORS.side.tint}
              stroke={COLORS.side.solid}
              strokeWidth={1}
            />
            <text
              x={-10}
              y={gridH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-micro font-bold"
              fill={COLORS.side.text}
            >
              n = {n}
            </text>
          </g>

          {/* Grid Render */}
          <g transform={`translate(${startX}, ${startY})`}>
            {mode === 'square' ? (
              /* Mode 1: Solid Square Grid */
              <g>
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
                {Array.from({ length: n }).map((_, c) =>
                  Array.from({ length: n }).map((_, r) => (
                    <rect
                      key={`sq-${c}-${r}`}
                      x={c * tileSize}
                      y={r * tileSize}
                      width={tileSize}
                      height={tileSize}
                      fill="none"
                      stroke={COLORS.area.solid}
                      strokeWidth={1}
                      strokeOpacity={0.35}
                    />
                  ))
                )}
                {/* Center Badge */}
                <g transform={`translate(${gridW / 2}, ${gridH / 2})`}>
                  <rect
                    x={-50}
                    y={-16}
                    width={100}
                    height={32}
                    rx={8}
                    fill={COLORS.surface}
                    stroke={COLORS.area.solid}
                    strokeWidth={1.5}
                    filter="drop-shadow(0px 2px 4px rgba(242,122,0,0.15))"
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-ui font-extrabold"
                    fill={COLORS.area.text}
                  >
                    Area = {n * n}
                  </text>
                </g>
              </g>
            ) : (
              /* Mode 2: Concentric L-Borders (Odd Numbers) */
              <g>
                {Array.from({ length: n }).map((_, layerIdx) => {
                  const layerColor = L_LAYER_COLORS[layerIdx % L_LAYER_COLORS.length];
                  const isHovered = hoveredLayer === layerIdx;
                  const tilesInLayer: { col: number; row: number }[] = [];

                  // L-tromino: column layerIdx (rows 0..layerIdx) and row layerIdx (cols 0..layerIdx-1)
                  for (let r = 0; r <= layerIdx; r++) {
                    tilesInLayer.push({ col: layerIdx, row: r });
                  }
                  for (let c = 0; c < layerIdx; c++) {
                    tilesInLayer.push({ col: c, row: layerIdx });
                  }

                  return (
                    <g
                      key={`layer-${layerIdx}`}
                      onMouseEnter={() => setHoveredLayer(layerIdx)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className="cursor-pointer transition-transform"
                    >
                      {tilesInLayer.map((t, i) => (
                        <rect
                          key={`tile-${layerIdx}-${i}`}
                          x={t.col * tileSize}
                          y={t.row * tileSize}
                          width={tileSize}
                          height={tileSize}
                          rx={3}
                          fill={layerColor.fill}
                          stroke={isHovered ? '#002538' : layerColor.stroke}
                          strokeWidth={isHovered ? 2 : 1.5}
                          style={{
                            transition: 'all 0.15s ease',
                          }}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            )}
          </g>

          {/* Bottom Equation / Caption */}
          <g transform={`translate(${viewWidth / 2}, ${startY + gridH + 34})`}>
            {mode === 'square' ? (
              <text textAnchor="middle" className="text-ui font-bold" fill={COLORS.headingText}>
                <tspan fill={COLORS.side.text}>{n}</tspan> rows of <tspan fill={COLORS.side.text}>{n}</tspan> tiles
                <tspan fill={COLORS.mutedText}> = </tspan>
                <tspan fill={COLORS.area.text}>{n}² = {n * n} tiles</tspan>
              </text>
            ) : (
              <text textAnchor="middle" className="text-ui font-bold" fill={COLORS.headingText}>
                {hoveredLayer !== null ? (
                  <tspan fill={L_LAYER_COLORS[hoveredLayer % L_LAYER_COLORS.length].text}>
                    Layer {hoveredLayer + 1}: adds +{2 * hoveredLayer + 1} tiles
                  </tspan>
                ) : (
                  <tspan fill={COLORS.headingText}>
                    Hover any layer to see its odd number (+1, +3, +5...)
                  </tspan>
                )}
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Formula Strip */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        {mode === 'square' ? (
          <div className="text-lg font-bold" style={{ color: COLORS.area.text }}>
            <Katex latex={`\\text{Area} = \\text{side}^2 = ${n}^2 = ${n * n}`} displayMode={false} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold overflow-x-auto py-1" style={{ color: COLORS.primary }}>
              <Katex latex={oddSumFormula} displayMode={false} />
            </div>
            <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
              Sum of the first {n} consecutive odd numbers always produces a perfect square {n}²!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
