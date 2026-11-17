/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface KatexProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const Katex: React.FC<KatexProps> = ({ latex, displayMode = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
        });
      } catch (e) {
        if (containerRef.current) {
          containerRef.current.textContent = latex;
        }
      }
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};
