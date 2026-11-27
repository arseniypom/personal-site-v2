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
  const paragraphs = text.split('\n\n');
  const collapsible = !!previewParagraphs && previewParagraphs > 0 && paragraphs.length > previewParagraphs;
  const preview = collapsible ? paragraphs.slice(0, previewParagraphs).join('\n\n') : text;
  const remainder = collapsible ? '\n\n' + paragraphs.slice(previewParagraphs).join('\n\n') : '';
  const textRef = useRef<HTMLParagraphElement>(null);

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
    <div className={styles.prompt}>
      <div className={styles.promptBar}>
        <span className={styles.promptTitle}>{title}</span>
        <div className={styles.promptControls}>
          {collapsible && <button type="button" className={styles.promptToggle} aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)}>
            {expanded ? 'Show less' : 'Show full prompt'}
          </button>}
        <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
          {state === 'copied' ? 'Copied' : state === 'manual' ? 'Selected, copy it' : 'Copy'}
        </button>
        </div>
      </div>
      {note && <p className={styles.promptNote}>{note}</p>}
      <p ref={textRef} className={styles.promptText}>
        {renderText(preview)}
        {collapsible && <span id={contentId} hidden={!expanded}>{renderText(remainder)}</span>}
      </p>
    </div>
  );
}
