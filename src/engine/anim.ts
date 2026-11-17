/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOut(t: number): number {
  const p = clamp01(t);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

export function isAt(currentBeatId: string, targetId: string): boolean {
  return currentBeatId === targetId;
}

export function enter(
  targetId: string,
  currentBeatId: string,
  beatIndex: number,
  targetIndex: number,
  progress: number
): number {
  if (currentBeatId === targetId) {
    return easeInOut(progress);
  }
  if (beatIndex > targetIndex) {
    return 1;
  }
  return 0;
}

export function hasReached(currentBeatIndex: number, targetIndex: number): boolean {
  return currentBeatIndex >= targetIndex;
}
