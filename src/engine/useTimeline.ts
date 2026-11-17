/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export function useTimeline(totalBeats: number) {
  const [t, setTState] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const tRef = useRef<number>(0);
  const targetTRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);

  // Arrival convention: beatIndex is the step being shown/entered (ceil of t)
  const beatIndex = Math.min(totalBeats - 1, Math.max(0, t === 0 ? 0 : Math.ceil(t)));
  const progress = beatIndex === 0 ? 1 : Math.max(0, Math.min(1, t - (beatIndex - 1)));

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const animateTo = useCallback((targetT: number, durationMs = 700) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    const clampedTarget = Math.max(0, Math.min(totalBeats - 1, targetT));
    const startT = tRef.current;
    const distance = clampedTarget - startT;

    if (Math.abs(distance) < 0.001) {
      isAnimatingRef.current = false;
      targetTRef.current = clampedTarget;
      tRef.current = clampedTarget;
      setTState(clampedTarget);
      return;
    }

    targetTRef.current = clampedTarget;
    isAnimatingRef.current = true;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(1, elapsed / durationMs);

      const ease = progressRatio < 0.5
        ? 4 * progressRatio * progressRatio * progressRatio
        : 1 - Math.pow(-2 * progressRatio + 2, 3) / 2;

      const current = Math.max(0, Math.min(totalBeats - 1, startT + distance * ease));
      tRef.current = current;
      setTState(current);

      if (progressRatio < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
        isAnimatingRef.current = false;
        tRef.current = clampedTarget;
        setTState(clampedTarget);
      }
    };

    animRef.current = requestAnimationFrame(step);
  }, [totalBeats]);

  const finishAnimation = useCallback((): boolean => {
    if (!isAnimatingRef.current) return false;
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    isAnimatingRef.current = false;
    const target = Math.max(0, Math.min(totalBeats - 1, targetTRef.current));
    tRef.current = target;
    setTState(target);
    return true;
  }, [totalBeats]);

  const isAnimating = useCallback(() => isAnimatingRef.current, []);

  const getCurrentOrTargetBeat = useCallback(() => {
    if (isAnimatingRef.current) {
      return Math.min(totalBeats - 1, Math.max(0, Math.round(targetTRef.current)));
    }
    const cur = tRef.current;
    return Math.min(totalBeats - 1, Math.max(0, cur === 0 ? 0 : Math.ceil(cur)));
  }, [totalBeats]);

  const goNext = useCallback(() => {
    const baseBeat = isAnimatingRef.current
      ? Math.round(targetTRef.current)
      : Math.round(tRef.current);
    const nextBeat = Math.min(totalBeats - 1, baseBeat + 1);
    animateTo(nextBeat);
  }, [totalBeats, animateTo]);

  const goBack = useCallback(() => {
    const baseBeat = isAnimatingRef.current
      ? Math.round(targetTRef.current)
      : Math.round(tRef.current);
    const prevBeat = Math.max(0, baseBeat - 1);
    animateTo(prevBeat);
  }, [animateTo]);

  const setT = useCallback((newT: number) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    isAnimatingRef.current = false;
    const clamped = Math.max(0, Math.min(totalBeats - 1, newT));
    targetTRef.current = clamped;
    tRef.current = clamped;
    setTState(clamped);
  }, [totalBeats]);

  return {
    t,
    beatIndex,
    progress,
    goNext,
    goBack,
    setT,
    isAnimating,
    finishAnimation,
    getCurrentOrTargetBeat,
  };
}
