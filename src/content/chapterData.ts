/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chapter, RefresherMiniClip } from '../types';

export const sampleRefresherClip: RefresherMiniClip = {
  id: 'refresher-multiplication',
  title: 'Refresher: Multiplication as Arrays',
  beats: [
    {
      id: 'r-1',
      headline: 'Multiplication forms a rectangular array',
      focusWord: 'rectangular array',
      focusColor: 'area',
      narration: 'Multiplying two numbers represents an array of rows and columns.',
      latex: ['3 \\times 4 = 12 \\text{ items}'],
    },
    {
      id: 'r-2',
      headline: 'Equal sides form a square',
      focusWord: 'square',
      focusColor: 'area',
      narration: 'When rows and columns are equal, the rectangle becomes a square array.',
      latex: ['3 \\times 3 = 9 = 3^2'],
    },
  ],
};

export const chapterData: Chapter = {
  id: 'squares-cubes-class8',
  title: 'Squares & Square Roots, Cubes & Cube Roots',
  description: 'Class 8 NCERT Mathematics Notes',
  scenes: [
    // Scene 0: What is a Square Number?
    {
      id: 'scene-0',
      title: 'What is a Square Number?',
      subtitle: 'From geometric square tiles to powers of 2',
      refresherId: 'refresher-multiplication',
      beats: [
        {
          id: 's0-b1',
          headline: 'Multiplying a number by itself',
          focusWord: 'itself',
          focusColor: 'number',
          narration: 'If a natural number m can be written as n², where n is a natural number, then m is a square number.',
          latex: ['m = n \\times n = n^2'],
        },
        {
          id: 's0-b2',
          headline: 'Geometric meaning of area',
          focusWord: 'area',
          focusColor: 'area',
          narration: 'Tiles arranged in an n by n grid always form a square with side n and area n².',
          latex: ['m = n \\times n = n^2', '\\text{Area of square} = s^2 = n^2'],
        },
        {
          id: 's0-b3',
          headline: 'Interactive square tile exploration',
          focusWord: 'exploration',
          focusColor: 'side',
          narration: 'Adjust the slider to change side length n and observe how the area n² scales.',
          latex: ['\\text{Side length } n = 4', '\\text{Total Area } A = 4^2 = 16'],
          params: { n: 4 },
          interactive: true,
        },
      ],
      quickCheck: [
        {
          prompt: 'Which of the following is a perfect square number?',
          options: ['28', '36', '42', '54'],
          correctIndex: 1,
          explanation: '36 is a perfect square because 6 × 6 = 36.',
        },
        {
          prompt: 'What is the area of a square of side 7 units?',
          options: ['14', '28', '49', '56'],
          correctIndex: 2,
          explanation: 'Area = side × side = 7 × 7 = 49 square units.',
        },
      ],
    },

    // Scene 1: Patterns in Square Numbers
    {
      id: 'scene-1',
      title: 'Patterns in Square Numbers',
      subtitle: 'Ending digits, consecutive odd sums, and non-square gaps',
      beats: [
        {
          id: 's1-b1',
          headline: 'Units digit pattern',
          focusWord: 'Units digit',
          focusColor: 'number',
          narration: 'Square numbers only end in 0, 1, 4, 5, 6, or 9. They never end in 2, 3, 7, or 8.',
          latex: [
            '\\text{Allowed ending digits: } 0, 1, 4, 5, 6, 9',
            '\\text{Never squares if ending in: } 2, 3, 7, 8',
          ],
        },
        {
          id: 's1-b2',
          headline: 'Sum of consecutive odd numbers',
          focusWord: 'odd numbers',
          focusColor: 'area',
          narration: 'The sum of the first n consecutive odd numbers is equal to n².',
          latex: ['1 = 1^2 = 1', '1 + 3 = 2^2 = 4', '1 + 3 + 5 = 3^2 = 9'],
        },
      ],
      quickCheck: [
        {
          prompt: 'Can 1057 be a perfect square?',
          options: ['Yes', 'No, because it ends in 7', 'No, because it is divisible by 3'],
          correctIndex: 1,
          explanation: 'Square numbers never end in 2, 3, 7, or 8. 1057 ends in 7.',
        },
      ],
    },

    // Scene 2: Concept of Square Root
    {
      id: 'scene-2',
      title: 'Concept of Square Root',
      subtitle: 'Inverse operation of squaring: finding side from area',
      beats: [
        {
          id: 's2-b1',
          headline: 'Undoing the square operation',
          focusWord: 'Undoing',
          focusColor: 'root',
          narration: 'Square root is the inverse of squaring. If 5² = 25, then the square root of 25 is 5.',
          latex: ['\\text{If } s^2 = A, \\quad \\text{then } \\sqrt{A} = s', '5^2 = 25 \\implies \\sqrt{25} = 5'],
        },
        {
          id: 's2-b2',
          headline: 'Square roots on the number line',
          focusWord: 'number line',
          focusColor: 'root',
          narration: 'Square roots of perfect squares land on integers. Non-squares fall smoothly in between.',
          latex: ['25 < 30 < 36 \\implies 5 < \\sqrt{30} < 6'],
        },
      ],
      quickCheck: [
        {
          prompt: 'What is the square root of 64?',
          options: ['6', '7', '8', '9'],
          correctIndex: 2,
          explanation: '8 × 8 = 64, therefore √64 = 8.',
        },
      ],
    },

    // Scene 3: Methods for Square Roots
    {
      id: 'scene-3',
      title: 'Methods for Square Roots',
      subtitle: 'Repeated subtraction, prime factorisation, and long division',
      beats: [
        {
          id: 's3-b1',
          headline: 'Method 1: Repeated subtraction',
          focusWord: 'Repeated subtraction',
          focusColor: 'root',
          narration: 'Subtract successive odd numbers (1, 3, 5, 7...) starting from the given number until you reach 0.',
          latex: ['25 - 1 = 24', '24 - 3 = 21', '21 - 5 = 16', '16 - 7 = 9', '9 - 9 = 0 \\implies \\sqrt{25} = 5'],
        },
        {
          id: 's3-b2',
          headline: 'Method 2: Prime factorisation',
          focusWord: 'Prime factorisation',
          focusColor: 'side',
          narration: 'Group prime factors in equal pairs of two. Take one factor from each pair.',
          latex: ['144 = (2 \\times 2) \\times (2 \\times 2) \\times (3 \\times 3) \\implies \\sqrt{144} = 12'],
        },
      ],
      quickCheck: [
        {
          prompt: 'How many odd subtractions are needed to find √49?',
          options: ['5', '6', '7', '8'],
          correctIndex: 2,
          explanation: 'Since √49 = 7, it takes exactly 7 odd subtractions to reach 0.',
        },
      ],
    },

    // Scene 4: What is a Cube Number?
    {
      id: 'scene-4',
      title: 'What is a Cube Number?',
      subtitle: 'From 3D isometric blocks to powers of 3',
      beats: [
        {
          id: 's4-b1',
          headline: 'Multiplying a number three times',
          focusWord: 'three times',
          focusColor: 'volume',
          narration: 'When a number is multiplied by itself three times, we get its cube: n × n × n = n³.',
          latex: ['n \\times n \\times n = n^3', '2^3 = 8, \\; 3^3 = 27, \\; 4^3 = 64'],
        },
        {
          id: 's4-b2',
          headline: '3D volume of a cube',
          focusWord: 'volume',
          focusColor: 'volume',
          narration: 'A solid cube of edge length n contains n³ unit cubes.',
          latex: ['\\text{Volume} = \\text{edge}^3 = n^3'],
        },
      ],
      quickCheck: [
        {
          prompt: 'What is 4³ equal to?',
          options: ['12', '16', '64', '81'],
          correctIndex: 2,
          explanation: '4³ = 4 × 4 × 4 = 64.',
        },
      ],
    },

    // Scene 5: Finding Cube Roots
    {
      id: 'scene-5',
      title: 'Finding Cube Roots',
      subtitle: 'Prime triplets and the estimation method',
      beats: [
        {
          id: 's5-b1',
          headline: 'Cube root as inverse of cubing',
          focusWord: 'Cube root',
          focusColor: 'root',
          narration: 'Cube root is the inverse operation of cubing: if 4³ = 64, then ∛64 = 4.',
          latex: ['\\text{If } s^3 = V, \\quad \\text{then } \\sqrt[3]{V} = s', '4^3 = 64 \\implies \\sqrt[3]{64} = 4'],
        },
        {
          id: 's5-b2',
          headline: 'Prime factor triplets',
          focusWord: 'triplets',
          focusColor: 'root',
          narration: 'Group prime factors in triplets of three. Take one factor from each triplet.',
          latex: ['216 = (2 \\times 2 \\times 2) \\times (3 \\times 3 \\times 3) \\implies \\sqrt[3]{216} = 6'],
        },
      ],
      quickCheck: [
        {
          prompt: 'What is the cube root of 125?',
          options: ['3', '5', '15', '25'],
          correctIndex: 1,
          explanation: '5 × 5 × 5 = 125, so ∛125 = 5.',
        },
      ],
    },
  ],
};
