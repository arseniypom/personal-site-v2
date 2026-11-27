'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import styles from './guide.module.css';

/** Prompt box with a copy button. [Brackets] are highlighted as fill-in fields. */
export default function CopyPrompt({
  text,
  note,
  title = 'Prompt',
  previewParagraphs,
}: {
  text: string;
  note?: ReactNode;
  title?: string;
  previewParagraphs?: number;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const paragraphs = text.split('\n\n');
  const limit = Math.max(0, previewParagraphs ?? 0);
  const wholeParagraphs = Math.floor(limit);
  const partialParagraph = paragraphs[wholeParagraphs] ?? '';
  const partialWords = [...partialParagraph.matchAll(/\S+/g)];
  const lastWord = partialWords[Math.ceil(partialWords.length * (limit % 1)) - 1];
  const partial = lastWord ? partialParagraph.slice(0, lastWord.index! + lastWord[0].length) : '';
  const preview = limit ? [...paragraphs.slice(0, wholeParagraphs), ...(partial ? [partial] : [])].join('\n\n') : text;
  const collapsible = preview.length < text.length;
  const textRef = useRef<HTMLParagraphElement>(null);

  const toggleExpanded = () => {
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    const restoreTop = window.scrollY + top - 24;
    flushSync(() => setExpanded(value => !value));
    if (expanded && top < 0) window.scrollTo({ top: Math.max(0, restoreTop), behavior: 'instant' });
  };

  const flash = (s: 'copied' | 'manual') => {
    setState(s);
    setTimeout(() => setState('idle'), 2200);
  };

  // Older or locked-down browsers block the async clipboard API; fall back to execCommand,
  // and if that fails too, select the text so the reader can copy it by hand.
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    if (ok) return flash('copied');
    if (collapsible) flushSync(() => setExpanded(true));
    const el = textRef.current;
    const sel = window.getSelection();
    if (el && sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    flash('manual');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash('copied');
    } catch {
      fallback();
    }
  };

  const renderText = (value: string) => value.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith('[') ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  );

  return (
    <div ref={cardRef} className={styles.prompt}>
      <div className={styles.promptBar}>
        <span className={styles.promptTitle}>{title}</span>
        <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
          {state === 'copied' ? 'Copied' : state === 'manual' ? 'Selected, copy it' : 'Copy'}
        </button>
      </div>
      {note && <p className={styles.promptNote}>{note}</p>}
      {collapsible && !expanded && <p className={`${styles.promptText} ${styles.promptPreview}`}>{renderText(preview)}</p>}
      <p id={contentId} ref={textRef} className={styles.promptText} hidden={collapsible && !expanded}>
        {renderText(text)}
      </p>
      {collapsible && <div className={styles.promptDisclosure}>
        <button type="button" className={styles.promptToggle} aria-expanded={expanded} aria-controls={contentId} onClick={toggleExpanded}>
          {expanded ? 'Collapse' : 'Expand'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={expanded ? styles.promptChevronUp : undefined}>
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>}

    </div>
  );
}
