/// <reference path="../types/katex-auto-render.d.ts" />

import '../index.css';
import 'katex/dist/katex.min.css';
import * as React from 'react';
import renderMathInElement from 'katex/contrib/auto-render';

type InlineProblemViewerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** The TipTap JSON document string. */
  children?: string | null;
  /** Maximum number of lines to display (defaults to 1). */
  maxLine?: number;
  /** Optional alias for `maxLine` to support different prop casing. */
  maxline?: number;
};

const ATTR_TEXT_KEYS = ['text', 'value', 'alt', 'label', 'title', 'latex'] as const;

const extractTextFromNode = (node: unknown): string => {
  if (!node) return '';

  if (typeof node === 'string') return node;

  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).filter(Boolean).join(' ');
  }

  if (typeof node === 'object') {
    const nodeRecord = node as {
      type?: string;
      text?: string;
      content?: unknown;
      attrs?: Record<string, unknown> | null;
    };

    if (nodeRecord.type === 'text' && typeof nodeRecord.text === 'string') {
      return nodeRecord.text;
    }

    if (nodeRecord.type === 'hardBreak') {
      return ' ';
    }

    const pieces: string[] = [];
    const attrs = nodeRecord.attrs ?? {};
    for (const key of ATTR_TEXT_KEYS) {
      const value = attrs[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        pieces.push(key === 'latex' ? `\\(${value}\\)` : value);
        break;
      }
    }

    if (typeof nodeRecord.text === 'string') {
      pieces.push(nodeRecord.text);
    }

    if (nodeRecord.content !== undefined) {
      const inner = extractTextFromNode(nodeRecord.content);
      if (inner) pieces.push(inner);
    }

    return pieces.filter(Boolean).join(' ');
  }

  return '';
};

const parseContent = (raw: string | null | undefined): string => {
  if (raw == null) return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  try {
    const json = JSON.parse(trimmed);
    const text = extractTextFromNode(json);
    return text.replace(/\s+/g, ' ').trim();
  } catch {
    return trimmed;
  }
};

export const InlineProblemViewer = React.forwardRef<HTMLDivElement, InlineProblemViewerProps>(
  ({ children, maxLine, maxline, className, style, ...rest }, ref) => {
    const internalRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    const lineClamp = React.useMemo<number>(() => {
      if (typeof maxLine === 'number') return maxLine;
      if (typeof maxline === 'number') return maxline;
      return 1;
    }, [maxLine, maxline]);

    const text = React.useMemo(() => parseContent(children), [children]);

    const clampedStyle = React.useMemo<React.CSSProperties>(() => {
      const base: React.CSSProperties = {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: lineClamp === 1 ? 'nowrap' : 'normal',
        wordBreak: 'break-word',
      };

      return style ? { ...base, ...style } : base;
    }, [lineClamp, style]);

    React.useEffect(() => {
      if (!internalRef.current) return;
      renderMathInElement(internalRef.current, {
        delimiters: [
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '$$', right: '$$', display: true },
        ],
        throwOnError: false,
      });
    }, [text]);

    return (
      <div ref={mergedRef} className={className} style={clampedStyle} {...rest}>
        {text}
      </div>
    );
  }
);

InlineProblemViewer.displayName = 'InlineProblemViewer';
