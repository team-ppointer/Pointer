import type { Editor } from '@tiptap/react';
import DOMPurify from 'dompurify';

export type TiptapPayload = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any;
  html: string; // sanitize된 HTML
  text: string; // 플레인 텍스트
  excerpt?: string; // 미리보기
};

export function extractPayload(
  editor: Editor,
  opts?: { excerptLen?: number; version?: number }
): TiptapPayload {
  const json = editor.getJSON();
  const html = DOMPurify.sanitize(editor.getHTML(), { USE_PROFILES: { html: true } });
  const text = editor.getText();
  const excerptLen = opts?.excerptLen ?? 200;

  return {
    json,
    html,
    text,
    excerpt: text.slice(0, excerptLen),
  };
}
