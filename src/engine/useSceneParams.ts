/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Scene } from '../types';
import { easeInOut } from './anim';

export function useSceneParams(scene: Scene, beatIndex: number, progress: number) {
  const [interactiveValues, setInteractiveValues] = useState<Record<string, Record<string, number>>>({});

  const setParam = (name: string, value: number) => {
    const currentBeat = scene.beats[beatIndex];
    if (!currentBeat) return;
    setInteractiveValues((prev) => ({
      ...prev,
      [currentBeat.id]: {
        ...(prev[currentBeat.id] || currentBeat.params || {}),
        [name]: value,
      },
    }));
  };

  const setParams = (updates: Record<string, number>) => {
    const currentBeat = scene.beats[beatIndex];
    if (!currentBeat) return;
    setInteractiveValues((prev) => ({
      ...prev,
      [currentBeat.id]: {
        ...(prev[currentBeat.id] || currentBeat.params || {}),
        ...updates,
      },
    }));
  };

  // Cumulative resolution across beats
  let cumulative: Record<string, number> = {};
  const resolvedList: Record<string, number>[] = [];

  for (let i = 0; i < scene.beats.length; i++) {
    const b = scene.beats[i];
    const beatParams = b.params || {};
    const userOverrides = (b.interactive && interactiveValues[b.id]) || {};
    cumulative = { ...cumulative, ...beatParams, ...userOverrides };
    resolvedList.push({ ...cumulative });
  }

  const prevResolved = beatIndex > 0 ? resolvedList[beatIndex - 1] : resolvedList[0];
  const currResolved = resolvedList[beatIndex];

  const interpolated: Record<string, number> = {};
  const allKeys = Array.from(new Set([...Object.keys(prevResolved), ...Object.keys(currResolved)]));

  const p = easeInOut(progress);

  for (const key of allKeys) {
    const v1 = prevResolved[key] ?? currResolved[key] ?? 0;
    const v2 = currResolved[key] ?? v1;
    interpolated[key] = v1 + (v2 - v1) * p;
  }

  return {
    params: interpolated,
    setParam,
    setParams,
  };
}
