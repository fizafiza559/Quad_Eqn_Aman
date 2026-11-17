/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { COLORS } from '../design/tokens';
import { SectionConfig, SectionId } from '../content/sections';

interface IndexDrawerProps {
  open: boolean;
  onClose: () => void;
  sections: SectionConfig[];
  activeSectionId: SectionId;
  activeTopicId?: string;
  onSelectSection: (sectionId: SectionId) => void;
  onSelectTopic?: (topicId: string, sectionId?: SectionId) => void;
}

export const IndexDrawer: React.FC<IndexDrawerProps> = ({
  open,
  onClose,
  sections,
  activeSectionId,
  activeTopicId,
  onSelectSection,
  onSelectTopic,
}) => {
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Reset 'How to use' collapsed state, focus panel, and scroll active item into view on open
  useEffect(() => {
    if (!open) return;

    setHowToUseOpen(false);

    const frameId = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
      activeItemRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // Keep keyboard focus trapped inside the drawer while open
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-no-nav="true"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Soft dimmed backdrop */}
      <div
        data-no-nav="true"
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/25 animate-backdrop-in"
      />

      {/* Right-side drawer: full width on phones, 340px wide on desktop */}
      <div
        ref={drawerRef}
        id="index-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="index-drawer-title"
        data-no-nav="true"
        className="relative z-10 h-full w-full sm:w-[340px] bg-white border-l shadow-2xl flex flex-col animate-drawer-in"
        style={{ borderColor: COLORS.divider }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: COLORS.divider }}
        >
          <h2
            id="index-drawer-title"
            className="text-title"
            style={{ color: COLORS.headingText }}
          >
            Index
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close index"
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: COLORS.mutedText }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable sections & topics list (built from sections prop) */}
        <nav
          aria-label="Chapter index"
          className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2"
        >
          {sections.map((sec) => {
            const isActiveSection = sec.id === activeSectionId;
            const hasSingleTopic = sec.subTabs.length <= 1;

            return (
              <div key={sec.id} className="space-y-0.5">
                {/* Level 1: Section row */}
                <button
                  ref={isActiveSection && hasSingleTopic ? activeItemRef : undefined}
                  type="button"
                  onClick={() => {
                    onSelectSection(sec.id);
                    onClose();
                  }}
                  aria-current={isActiveSection && hasSingleTopic ? 'page' : undefined}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-full text-left text-ui flex items-center transition-colors cursor-pointer hover:bg-slate-100/80"
                  style={{
                    fontWeight: 700,
                    backgroundColor: isActiveSection ? 'rgba(0, 85, 131, 0.10)' : 'transparent',
                    color: isActiveSection ? COLORS.primary : COLORS.headingText,
                  }}
                >
                  <span className="leading-snug">{sec.label}</span>
                </button>

                {/* Level 2: Indented topics (omitted when section has only a single topic) */}
                {!hasSingleTopic && (
                  <div className="pl-4 space-y-0.5">
                    {sec.subTabs.map((topic) => {
                      const isActiveTopic = isActiveSection && topic.id === activeTopicId;
                      return (
                        <button
                          key={topic.id}
                          ref={isActiveTopic ? activeItemRef : undefined}
                          type="button"
                          onClick={() => {
                            if (onSelectTopic) {
                              onSelectTopic(topic.id, sec.id);
                            } else {
                              onSelectSection(sec.id);
                            }
                            onClose();
                          }}
                          aria-current={isActiveTopic ? 'page' : undefined}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-full text-left text-small flex items-center transition-colors cursor-pointer hover:bg-slate-100/80"
                          style={{
                            fontWeight: 500,
                            backgroundColor: isActiveTopic ? 'rgba(0, 85, 131, 0.10)' : 'transparent',
                            color: isActiveTopic ? COLORS.primary : COLORS.bodyText,
                          }}
                        >
                          <span className="leading-snug">{topic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom collapsed 'How to use' row */}
        <div
          className="shrink-0 border-t px-3 py-2 bg-slate-50/70"
          style={{ borderColor: COLORS.divider }}
        >
          <button
            type="button"
            onClick={() => setHowToUseOpen((prev) => !prev)}
            aria-expanded={howToUseOpen}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between text-ui hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ color: COLORS.headingText }}
          >
            <span>How to use</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                howToUseOpen ? 'rotate-180' : ''
              }`}
              style={{ color: COLORS.mutedText }}
            />
          </button>

          {howToUseOpen && (
            <ul
              className="px-3 pb-3 pt-1 space-y-2 text-small leading-relaxed animate-fade-rise max-h-[40vh] overflow-y-auto"
              style={{ color: COLORS.bodyText }}
            >
              <li>
                <strong style={{ color: COLORS.headingText }}>Tap &amp; Double-tap:</strong> Tap to continue - double-tap to go back.
              </li>
              <li>
                <strong style={{ color: COLORS.headingText }}>Step rail &amp; keys:</strong> Jump with numbers on the left rail, or use Space, Enter, and Arrow keys.
              </li>
              <li>
                <strong style={{ color: COLORS.headingText }}>Sliders:</strong> Drag interactive sliders to test numbers live, then tap Continue or the headline area.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
