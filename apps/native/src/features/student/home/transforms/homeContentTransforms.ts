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
} from '@repo/pointer-content-renderer';

import type { components } from '@schema';
import { parseTipTapDoc } from '@utils/tiptap';

type DailyCommentResp = components['schemas']['DailyCommentResp'];
type FocusCardIssuanceResp = components['schemas']['FocusCardIssuanceResp'];

/**
 * 데일리 코멘트 → HomeCommentCard 변환.
 */
function toCommentCard(comment: DailyCommentResp, name: string): HomeCommentCard {
  return {
    type: 'comment',
    title: `${name}님을 위한 1:1 코멘트`,
    subtitle: '출제진이 직접 작성한 코멘트에요.',
    expiryAt: comment.expiryAt ? new Date(comment.expiryAt).getTime() : null,
    content: parseTipTapDoc(comment.contentJson),
  };
}

/**
 * 집중학습 카드 목록 → HomeStudySummaryCard 변환.
 * 발급일이 `todayStr` 인 항목은 "오늘의 학습", 그 외는 "다가오는 학습" 그룹으로 분리.
 */
function toStudySummaryCard(
  issuances: FocusCardIssuanceResp[],
  name: string,
  todayStr: string
): HomeStudySummaryCard {
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
      title: parseTipTapDoc(issuance.card.title),
      description: parseTipTapDoc(issuance.card.description),
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
    title: `${name}님을 위한 학습 내용 정리`,
    subtitle: `${name}님의 학습을 분석해 취약점을 도출했어요.\n지금 바로 출제진의 문제 접근법을 배워봐요.`,
    groups,
  };
}

/**
 * Home mode init 메시지 구성.
 *
 * @param todayStr "오늘" 판정 기준. 호출자(스크린)가 단일 source-of-truth로 보유 및 전달.
 */
export function buildHomeInit(opts: {
  name: string;
  todayStr: string;
  comments?: DailyCommentResp[];
  focusCardItems?: FocusCardIssuanceResp[];
}): (RNToWebViewMessage & { type: 'init'; mode: 'home' }) | null {
  const cards: HomeCard[] = [];

  // 1:1 코멘트 (첫 번째만 표시 — 현재 기획상 동시 노출 1건)
  if (opts.comments && opts.comments.length > 0) {
    cards.push(toCommentCard(opts.comments[0], opts.name));
  }

  // 학습 내용 정리
  if (opts.focusCardItems && opts.focusCardItems.length > 0) {
    cards.push(toStudySummaryCard(opts.focusCardItems, opts.name, opts.todayStr));
  }

  if (cards.length === 0) return null;

  return {
    type: 'init',
    mode: 'home',
    cards,
  };
}
