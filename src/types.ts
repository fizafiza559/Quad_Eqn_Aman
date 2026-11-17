/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuickCheckQuestion {
  prompt: string;
  latex?: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type SymbolColorKey =
  | 'number'
  | 'root'
  | 'side'
  | 'area'
  | 'volume'
  | 'primary'
  | 'x'
  | 'a'
  | 'b'
  | 'c';

export interface Beat {
  id: string;
  headline?: string;
  focusWord?: string;
  focusColor?: SymbolColorKey;
  caption?: string;
  narration: string;
  latex: string[];
  highlight?: string[];
  params?: Record<string, number>;
  interactive?: boolean;
}

export interface Scene {
  id: string;
  title: string;
  subtitle: string;
  beats: Beat[];
  quickCheck?: QuickCheckQuestion[];
  refresherId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
}

export interface RefresherMiniClip {
  id: string;
  title: string;
  beats: Beat[];
}

export interface SceneComponentProps {
  t: number;
  beatIndex: number;
  beatId?: string;
  localProgress: number;
  params: Record<string, number>;
  setParam?: (key: string, value: number) => void;
  setParams?: (updates: Record<string, number>) => void;
}
