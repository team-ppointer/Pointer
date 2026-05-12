/**
 * 서버 API 응답 → home mode init 메시지 변환.
 */
import type {
  RNToWebViewMessage,
  HomeCard,
  HomeCommentCard,
  HomeStudySummaryCard,
  HomeStudyGroup,
  HomeStudyItem,
  HomeStudyBadge,
  JSONNode,
} from '@repo/pointer-content-renderer';

import type { components } from '@schema';

type DailyCommentResp = components['schemas']['DailyCommentResp'];
type FocusCardIssuanceResp = components['schemas']['FocusCardIssuanceResp'];
type ListRespFocusCardIssuanceResp = components['schemas']['ListRespFocusCardIssuanceResp'];

const EMPTY_DOC: JSONNode = { type: 'doc', content: [] };

function parseTipTapDoc(raw?: string | null): JSONNode {
  if (raw == null || raw === '') return EMPTY_DOC;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      typeof (parsed as { type: unknown }).type === 'string'
    ) {
      return parsed as JSONNode;
    }
    return EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}

/**
 * 데일리 코멘트 → HomeCommentCard 변환.
 * expiryAt 로부터 남은 시간 계산.
 */
function toCommentCard(comment: DailyCommentResp): HomeCommentCard {
  const now = Date.now();
  const expiry = comment.expiryAt ? new Date(comment.expiryAt).getTime() : now;
  const remainingMs = Math.max(0, expiry - now);
  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));

  return {
    type: 'comment',
    timeRemainingInHours: remainingHours,
    content: parseTipTapDoc(comment.contentJson),
  };
}

/**
 * 집중학습 카드 목록 → HomeStudySummaryCard 변환.
 * 발급일 기준으로 오늘/다가오는 학습 그룹 분리.
 */
function toStudySummaryCard(
  issuances: FocusCardIssuanceResp[],
  name: string
): HomeStudySummaryCard {
  const today = new Date();
  const todayStr = formatLocalDate(today);

  const todayItems: HomeStudyItem[] = [];
  const upcomingItems: HomeStudyItem[] = [];

  for (const issuance of issuances) {
    const item: HomeStudyItem = {
      badges: [
        {
          text: '집중학습',
          variant: issuance.issuedDate === todayStr ? 'orange' : 'green',
        },
      ],
      headerText: issuance.card.description || '',
      content: parseTipTapDoc(issuance.card.content),
    };

    if (issuance.issuedDate === todayStr) {
      todayItems.push(item);
    } else {
      upcomingItems.push(item);
    }
  }

  const groups: HomeStudyGroup[] = [];
  if (todayItems.length > 0) {
    groups.push({ label: '오늘의 학습', highlighted: true, items: todayItems });
  }
  if (upcomingItems.length > 0) {
    groups.push({ label: '다가오는 학습', highlighted: false, items: upcomingItems });
  }

  return {
    type: 'study-summary',
    name,
    groups,
  };
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Home mode init 메시지 구성.
 */
export function buildHomeInit(opts: {
  name: string;
  comments?: DailyCommentResp[];
  focusCards?: ListRespFocusCardIssuanceResp | null;
}): (RNToWebViewMessage & { type: 'init'; mode: 'home' }) | null {
  const cards: HomeCard[] = [];

  // 1:1 코멘트 (첫 번째만)
  if (opts.comments && opts.comments.length > 0) {
    cards.push(toCommentCard(opts.comments[0]));
  }

  // 학습 내용 정리
  if (opts.focusCards?.data && opts.focusCards.data.length > 0) {
    cards.push(toStudySummaryCard(opts.focusCards.data, opts.name));
  }

  if (cards.length === 0) return null;

  return {
    type: 'init',
    mode: 'home',
    name: opts.name,
    cards,
  };
}
