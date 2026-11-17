/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COLORS } from '../design/tokens';
import { Katex } from './Katex';
import { Box, Layers, Plus, Minus } from 'lucide-react';

export interface IsometricCubeRendererProps {
  initialN?: number;
  className?: string;
  onNChange?: (n: number) => void;
}

function projectIso(
  x: number,
  y: number,
  z: number,
  size: number,
  cx: number,
  cy: number
) {
  const cos30 = 0.8660254; // cos(30 deg)
  const sin30 = 0.5;       // sin(30 deg)
  const screenX = cx + (x - y) * size * cos30;
  const screenY = cy + (x + y) * size * sin30 - z * size;
  return { x: screenX, y: screenY };
}

function getCubeFaces(
  x: number,
  y: number,
  z: number,
  size: number,
  cx: number,
  cy: number
) {
  const p0 = projectIso(x, y, z + 1, size, cx, cy);
  const p1 = projectIso(x + 1, y, z + 1, size, cx, cy);
  const p2 = projectIso(x + 1, y + 1, z + 1, size, cx, cy);
  const p3 = projectIso(x, y + 1, z + 1, size, cx, cy);

  const p5 = projectIso(x + 1, y, z, size, cx, cy);
  const p6 = projectIso(x + 1, y + 1, z, size, cx, cy);
  const p7 = projectIso(x, y + 1, z, size, cx, cy);

  const topFace = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  const rightFace = `${p1.x},${p1.y} ${p5.x},${p5.y} ${p6.x},${p6.y} ${p2.x},${p2.y}`;
  const leftFace = `${p3.x},${p3.y} ${p2.x},${p2.y} ${p6.x},${p6.y} ${p7.x},${p7.y}`;

  return { topFace, rightFace, leftFace };
}

export const IsometricCubeRenderer: React.FC<IsometricCubeRendererProps> = ({
  initialN = 3,
  className = '',
  onNChange,
}) => {
  const [n, setN] = useState<number>(initialN);
  const [visibleLayers, setVisibleLayers] = useState<number>(initialN);

  const handleNChange = (newN: number) => {
    const clamped = Math.max(1, Math.min(5, newN));
    setN(clamped);
    setVisibleLayers(clamped);
    onNChange?.(clamped);
  };

  const viewWidth = 520;
  const viewHeight = 400;

  // Determine unit cube pixel size based on n
  const cubeSize = n <= 2 ? 46 : n === 3 ? 34 : n === 4 ? 26 : 22;
  const cx = viewWidth / 2;
  const cy = 205 + (n - 2) * 16;

  const currentCubesCount = n * n * visibleLayers;
  const totalVolume = n * n * n;

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded-3xl border bg-white p-5 md:p-6 shadow-sm flex flex-col gap-5 ${className}`}
      style={{ borderColor: COLORS.divider }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: COLORS.divider }}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: COLORS.headingText }}>
            <Box className="w-5 h-5 text-purple-600" />
            Isometric Cube Renderer (3D Block Builder)
          </h3>
          <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
            Class 8 NCERT Ganita Prakash: Layer-by-layer volume assembly of cube numbers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-micro font-bold"
            style={{ backgroundColor: COLORS.volume.tint, color: COLORS.volume.text }}
          >
            {n}³ = {totalVolume} unit cubes
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {/* Edge Length Controller */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-ui font-bold" style={{ color: COLORS.headingText }}>
            Edge (<span style={{ color: COLORS.side.solid }}>n</span>):
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
              disabled={n >= 5}
              className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={n}
            onChange={(e) => handleNChange(parseInt(e.target.value, 10))}
            className="w-24 sm:w-28 accent-[#16A34A] cursor-pointer"
          />
        </div>

        {/* Vertical Layer Stacker */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-ui font-bold flex items-center gap-1.5" style={{ color: COLORS.headingText }}>
            <Layers className="w-4 h-4 text-purple-600" />
            Stacked Layers:
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: n }).map((_, lIdx) => (
              <button
                key={lIdx}
                type="button"
                onClick={() => setVisibleLayers(lIdx + 1)}
                className={`w-7 h-7 rounded-md text-micro font-bold border transition-all cursor-pointer ${
                  visibleLayers === lIdx + 1
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-purple-50'
                }`}
                style={{ borderColor: visibleLayers === lIdx + 1 ? '#7E22CE' : COLORS.divider }}
              >
                {lIdx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Isometric SVG Canvas */}
      <div
        className="w-full flex items-center justify-center rounded-2xl border bg-white overflow-hidden relative"
        style={{
          borderColor: COLORS.divider,
          backgroundImage: `radial-gradient(${COLORS.canvasGrid} 1.5px, transparent 1.5px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-auto max-h-[400px] select-none"
        >
          {/* Top Info Stat Badge */}
          <g transform="translate(30, 30)">
            <rect x={0} y={0} width={130} height={52} rx={10} fill={COLORS.surface} stroke={COLORS.side.solid} strokeWidth={1.5} />
            <text x={65} y={20} textAnchor="middle" className="text-micro font-bold" fill={COLORS.side.text}>
              Edge Length (n)
            </text>
            <text x={65} y={40} textAnchor="middle" className="text-title font-extrabold" fill={COLORS.side.text}>
              {n} units
            </text>
          </g>

          <g transform="translate(360, 30)">
            <rect x={0} y={0} width={130} height={52} rx={10} fill={COLORS.surface} stroke={COLORS.volume.solid} strokeWidth={1.5} />
            <text x={65} y={20} textAnchor="middle" className="text-micro font-bold" fill={COLORS.volume.text}>
              Current Cubes
            </text>
            <text x={65} y={40} textAnchor="middle" className="text-title font-extrabold" fill={COLORS.volume.text}>
              {currentCubesCount} / {totalVolume}
            </text>
          </g>

          {/* Unit Cubes Render (Painter's algorithm: z ascending, then y, then x) */}
          <g>
            {Array.from({ length: visibleLayers }).map((_, z) =>
              Array.from({ length: n }).map((_, y) =>
                Array.from({ length: n }).map((_, x) => {
                  const faces = getCubeFaces(x, y, z, cubeSize, cx, cy);
                  return (
                    <g key={`cube-${x}-${y}-${z}`}>
                      {/* Top Face */}
                      <polygon
                        points={faces.topFace}
                        fill={COLORS.volume.tint}
                        stroke={COLORS.volume.solid}
                        strokeWidth={1}
                        strokeLinejoin="round"
                      />
                      {/* Right Face */}
                      <polygon
                        points={faces.rightFace}
                        fill="#DDD6FE"
                        stroke="#7C3AED"
                        strokeWidth={1}
                        strokeLinejoin="round"
                      />
                      {/* Left Face */}
                      <polygon
                        points={faces.leftFace}
                        fill="#C4B5FD"
                        stroke="#6D28D9"
                        strokeWidth={1}
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })
              )
            )}
          </g>

          {/* Layer description note at bottom */}
          <g transform={`translate(${viewWidth / 2}, 375)`}>
            <text textAnchor="middle" className="text-micro font-bold" fill={COLORS.headingText}>
              Layer {visibleLayers} of {n}: {n} × {n} = {n * n} cubes per layer · Total: {currentCubesCount} cubes
            </text>
          </g>
        </svg>
      </div>

      {/* Formula Strip */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
        <div className="text-lg font-bold" style={{ color: COLORS.volume.text }}>
          <Katex
            latex={`\\text{Volume} = \\text{length} \\times \\text{breadth} \\times \\text{height} = ${n} \\times ${n} \\times ${n} = ${n}^3 = ${totalVolume}`}
            displayMode={false}
          />
        </div>
        <p className="text-micro font-medium" style={{ color: COLORS.mutedText }}>
          Each horizontal layer contains {n} × {n} = {n * n} unit cubes. Stacking {n} layers gives {n}³ = {totalVolume} unit cubes.
        </p>
      </div>
    </div>
  );
};
