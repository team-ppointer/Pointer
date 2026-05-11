import type { TiptapPayload } from '@repo/pointer-editor-v2';
import { components } from '@schema';

type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type PointingUpdateRequest = components['schemas']['PointingUpdateRequest'];

const EMPTY_TIPTAP_DOC = { type: 'doc', content: [] } as const;
const EMPTY_TIPTAP_STRING = JSON.stringify(EMPTY_TIPTAP_DOC);

const normalizeContentString = (raw?: string | null): string => {
  if (!raw) {
    return EMPTY_TIPTAP_STRING;
  }

  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  } catch (error) {
    console.warn('[transform] Invalid tiptap json string. Falling back to empty doc.', error);
    return EMPTY_TIPTAP_STRING;
  }
};

const mapPointings = (pointings?: ProblemInfoResp['pointings']): PointingUpdateRequest[] => {
  return (
    pointings?.map((pointing, index) => ({
      id: pointing.id,
      no: pointing.no ?? index + 1,
      questionContent: normalizeContentString(pointing.questionContent),
      commentContent: normalizeContentString(pointing.commentContent),
      concepts: pointing.concepts?.map((concept) => concept.id) ?? [],
    })) ?? []
  );
};

export const transformToProblemUpdateRequest = (
  serverData: ProblemInfoResp
): ProblemUpdateRequest => {
  return {
    createType: serverData.createType ?? 'GICHUL_PROBLEM',
    practiceTestId: serverData.practiceTest?.id ?? undefined,
    practiceTestNo: serverData.practiceTestNo ?? undefined,
    title: serverData.title ?? '',
    concepts: serverData.concepts?.map((concept) => concept.id) ?? [],
    answerType: serverData.answerType ?? 'MULTIPLE_CHOICE',
    answer: serverData.answer ?? 1,
    difficulty: serverData.difficulty ?? 1,
    recommendedTimeSec: serverData.recommendedTimeSec ?? 0,
    memo: serverData.memo ?? '',
    problemContent: normalizeContentString(serverData.problemContent),
    pointings: mapPointings(serverData.pointings),
    mainAnalysisImageId: serverData.mainAnalysisImage?.id ?? undefined,
    mainHandAnalysisImageId: serverData.mainHandAnalysisImage?.id ?? undefined,
    readingTipContent: normalizeContentString(serverData.readingTipContent),
    oneStepMoreContent: normalizeContentString(serverData.oneStepMoreContent),
  };
};

export const parseEditorContent = (raw?: string | null) => {
  try {
    return raw ? JSON.parse(raw) : EMPTY_TIPTAP_DOC;
  } catch {
    return EMPTY_TIPTAP_DOC;
  }
};

export const serializeEditorPayload = (payload?: TiptapPayload | null): string => {
  if (!payload || !payload.json) {
    return EMPTY_TIPTAP_STRING;
  }
  return JSON.stringify(payload.json);
};

export const getEmptyContentString = () => EMPTY_TIPTAP_STRING;

type TiptapNode = {
  type?: string;
  attrs?: Record<string, unknown> | null;
  content?: TiptapNode[];
  text?: string;
};

const NON_TEXT_CONTENT_TYPES = new Set([
  'image',
  'imageUpload',
  'imageOCR',
  'inlineMath',
  'blockMath',
  'horizontalRule',
  'table',
]);

const hasMeaningfulNonTextContent = (node: TiptapNode): boolean => {
  if (!node.type || !NON_TEXT_CONTENT_TYPES.has(node.type)) return false;
  if (!node.attrs) return true;

  return Object.values(node.attrs).some((value) => {
    return typeof value !== 'string' || value.trim().length > 0;
  });
};

const hasEditorContentDeep = (node: TiptapNode | undefined): boolean => {
  if (!node) return false;
  if (node.text && node.text.trim().length > 0) return true;
  if (hasMeaningfulNonTextContent(node)) return true;
  return !!node.content?.some(hasEditorContentDeep);
};

export const hasEditorContent = (serialized: string): boolean => {
  const parsed = parseEditorContent(serialized) as TiptapNode;
  return hasEditorContentDeep(parsed);
};
