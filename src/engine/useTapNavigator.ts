/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface RevealUnit {
  id: string;
  title?: string;
}

export interface TapRipple {
  id: number;
  x: number;
  y: number;
}

export interface UseTapNavigatorOptions {
  units: RevealUnit[];
  currentIndex: number;
  goNext: () => boolean | void;
  goBack: () => void;
  isAnimating?: () => boolean;
  finishAnimation?: () => boolean;
  disabled?: boolean;
  onFirstSuccessfulTap?: () => void;
}

export const DOUBLE_TAP_MS = 250;
export const DOUBLE_TAP_DISTANCE = 30;
export const TAP_MAX_MOVE = 10;

const MIN_BOUNCE_MS = 40;
const TAP_MAX_DURATION_MS = 400;
const RIPPLE_DURATION_MS = 300;

const NO_NAV_SELECTOR =
  'button, a, input, select, textarea, label, summary, [role="button"], [role="slider"], [role="option"], [role="listbox"], [role="dialog"], [role="menu"], [role="menuitem"], [data-no-nav]';

export function isNoNavTarget(target: EventTarget | null): boolean {
  const el =
    target instanceof Element
      ? target
      : target instanceof Node
      ? target.parentElement
      : null;
  if (!el) return false;
  return Boolean(el.closest(NO_NAV_SELECTOR));
}

function logTapNav(
  action: 'goNext' | 'goBack',
  cause: 'single-tap' | 'double-tap' | 'keyboard'
) {
  if (import.meta.env?.DEV) {
    console.debug(`[TapNavigator] ${action}`, {
      cause,
      timestamp: new Date().toISOString(),
      perfMs: Math.round(performance.now()),
    });
  }
}

export function useTapNavigator({
  units,
  currentIndex,
  goNext,
  goBack,
  isAnimating,
  finishAnimation,
  disabled = false,
  onFirstSuccessfulTap,
}: UseTapNavigatorOptions) {
  const [ripples, setRipples] = useState<TapRipple[]>([]);
  const rippleIdRef = useRef(0);
  const rippleTimersRef = useRef<Set<number>>(new Set());

  const activePointerRef = useRef<{
    id: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const lastPointerDownTimeRef = useRef<number>(0);

  const pendingTapRef = useRef<{
    x: number;
    y: number;
    time: number;
    timerId: number;
  } | null>(null);

  // Always read latest callbacks inside delayed timer / event handlers
  const callbacksRef = useRef({
    goNext,
    goBack,
    isAnimating,
    finishAnimation,
    disabled,
    onFirstSuccessfulTap,
  });
  callbacksRef.current = {
    goNext,
    goBack,
    isAnimating,
    finishAnimation,
    disabled,
    onFirstSuccessfulTap,
  };

  useEffect(() => {
    const rippleTimers = rippleTimersRef.current;
    return () => {
      if (pendingTapRef.current) {
        window.clearTimeout(pendingTapRef.current.timerId);
        pendingTapRef.current = null;
      }
      rippleTimers.forEach((id) => window.clearTimeout(id));
      rippleTimers.clear();
    };
  }, []);

  const clearPendingTap = useCallback(() => {
    if (pendingTapRef.current) {
      window.clearTimeout(pendingTapRef.current.timerId);
      pendingTapRef.current = null;
    }
  }, []);

  const spawnRipple = useCallback((x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    const tid = window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
      rippleTimersRef.current.delete(tid);
    }, RIPPLE_DURATION_MS);
    rippleTimersRef.current.add(tid);
  }, []);

  const resolveSingleTap = useCallback((cause: 'single-tap' | 'keyboard') => {
    const cb = callbacksRef.current;
    if (cb.disabled) return;
    if (cb.isAnimating?.() && cb.finishAnimation?.()) {
      cb.onFirstSuccessfulTap?.();
      return;
    }
    const result = cb.goNext();
    if (result !== false) {
      logTapNav('goNext', cause);
      cb.onFirstSuccessfulTap?.();
    }
  }, []);

  const resolveDoubleTap = useCallback((cause: 'double-tap' | 'keyboard') => {
    const cb = callbacksRef.current;
    if (cb.disabled) return;
    logTapNav('goBack', cause);
    cb.goBack();
    cb.onFirstSuccessfulTap?.();
  }, []);

  const handleStageTapAt = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      const pending = pendingTapRef.current;

      if (pending) {
        window.clearTimeout(pending.timerId);
        pendingTapRef.current = null;

        const withinTime = now - pending.time <= DOUBLE_TAP_MS;
        const withinDist = Math.hypot(x - pending.x, y - pending.y) <= DOUBLE_TAP_DISTANCE;

        if (withinTime && withinDist) {
          resolveDoubleTap('double-tap');
          return;
        }

        // Farther than DOUBLE_TAP_DISTANCE or past DOUBLE_TAP_MS: flush previous tap, then start fresh sequence
        resolveSingleTap('single-tap');
      }

      spawnRipple(x, y);
      const timerId = window.setTimeout(() => {
        pendingTapRef.current = null;
        resolveSingleTap('single-tap');
      }, DOUBLE_TAP_MS);

      pendingTapRef.current = { x, y, time: now, timerId };
    },
    [resolveDoubleTap, resolveSingleTap, spawnRipple]
  );

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (callbacksRef.current.disabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    if (e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX > rect.left + e.currentTarget.clientWidth ||
        e.clientY > rect.top + e.currentTarget.clientHeight
      ) {
        activePointerRef.current = null;
        return;
      }
    }

    if (isNoNavTarget(e.target)) {
      activePointerRef.current = null;
      return;
    }

    const now = performance.now();
    if (lastPointerDownTimeRef.current > 0 && now - lastPointerDownTimeRef.current < MIN_BOUNCE_MS) {
      return;
    }
    lastPointerDownTimeRef.current = now;

    activePointerRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      time: now,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const start = activePointerRef.current;
    if (!start || start.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MAX_MOVE) {
      activePointerRef.current = null;
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const start = activePointerRef.current;
      activePointerRef.current = null;
      if (callbacksRef.current.disabled || !start || start.id !== e.pointerId) return;
      if (isNoNavTarget(e.target)) return;

      const dt = performance.now() - start.time;
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (dt > TAP_MAX_DURATION_MS || dist > TAP_MAX_MOVE) return;

      handleStageTapAt(e.clientX, e.clientY);
    },
    [handleStageTapAt]
  );

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (activePointerRef.current?.id === e.pointerId) {
      activePointerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled) {
      clearPendingTap();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target;
      if (
        target instanceof Element &&
        target.closest(
          'button, a, input, select, textarea, [contenteditable="true"], [role="slider"], [role="listbox"], [role="dialog"]'
        )
      ) {
        return;
      }

      if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        clearPendingTap();
        resolveSingleTap('keyboard');
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        clearPendingTap();
        resolveDoubleTap('keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearPendingTap, disabled, resolveDoubleTap, resolveSingleTap]);

  const totalUnits = Math.max(1, units.length);
  const clampedIndex = Math.max(0, Math.min(totalUnits - 1, currentIndex));
  const currentUnit = units[clampedIndex];

  return {
    stagePointerProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    ripples,
    totalUnits,
    clampedIndex,
    currentUnit,
  };
}
