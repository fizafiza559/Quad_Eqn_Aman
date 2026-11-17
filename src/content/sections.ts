/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectionId = 'sec-0' | 'sec-1' | 'sec-2' | 'sec-3' | 'sec-4' | 'sec-5';

export type SubTabId =
  | 'locker-story'
  | 'factor-pairs'
  | 'scene-0'
  | 'scene-1'
  | 'scene-2'
  | 'scene-3'
  | 'scene-4'
  | 'scene-5'
  | 'dot-grid'
  | 'isometric-cube'
  | 'prime-factor';

export interface SubTabConfig {
  id: SubTabId;
  label: string;
  sceneIndex?: number;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  shortLabel: string;
  subTabs: SubTabConfig[];
}

export const CHAPTER_SECTIONS: SectionConfig[] = [
  {
    id: 'sec-0',
    label: '0. The 100 Lockers Story',
    shortLabel: '0. Story & Lockers',
    subTabs: [
      { id: 'locker-story', label: '100 Lockers Puzzle' },
      { id: 'factor-pairs', label: 'Factor Pairs & Squares' },
    ],
  },
  {
    id: 'sec-1',
    label: '1. Squares & Patterns',
    shortLabel: '1. Squares',
    subTabs: [
      { id: 'scene-0', label: 'What is a Square?', sceneIndex: 0 },
      { id: 'scene-1', label: 'Patterns & Odd Sums', sceneIndex: 1 },
    ],
  },
  {
    id: 'sec-2',
    label: '2. Square Roots',
    shortLabel: '2. Square Roots',
    subTabs: [
      { id: 'scene-2', label: 'Concept of Square Root', sceneIndex: 2 },
      { id: 'scene-3', label: 'Methods for Square Roots', sceneIndex: 3 },
    ],
  },
  {
    id: 'sec-3',
    label: '3. Cubes & Volume',
    shortLabel: '3. Cubes',
    subTabs: [
      { id: 'scene-4', label: 'What is a Cube?', sceneIndex: 4 },
    ],
  },
  {
    id: 'sec-4',
    label: '4. Cube Roots',
    shortLabel: '4. Cube Roots',
    subTabs: [
      { id: 'scene-5', label: 'Finding Cube Roots', sceneIndex: 5 },
    ],
  },
  {
    id: 'sec-5',
    label: '5. Visualizers & Tools',
    shortLabel: '5. Tools Lab',
    subTabs: [
      { id: 'dot-grid', label: 'Dot-Grid Square' },
      { id: 'isometric-cube', label: 'Isometric Cube' },
      { id: 'prime-factor', label: 'Prime-Factor Helper' },
    ],
  },
];
