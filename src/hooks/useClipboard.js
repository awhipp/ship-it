import { useState, useRef, useEffect, useCallback } from 'react';

function fallbackCopy(text) {
  if (typeof document === 'undefined') return;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      let success = false;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        success = true;
      } catch {
        try {
          fallbackCopy(text);
          success = true;
        } catch {
          success = false;
        }
      }

      if (success) {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      }
    },
    [resetMs]
  );

  return [copied, copy];
}
