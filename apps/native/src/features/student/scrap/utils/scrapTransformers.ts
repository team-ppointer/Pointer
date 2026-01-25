import { components } from '@schema';

type ScrapDetailResp = components['schemas']['ScrapDetailResp'];
type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];

/**
 * 스크랩 상세 정보를 AllPointingsScreen에서 사용할 수 있는 형식으로 변환합니다.
 * 스크랩 데이터 구조(ScrapDetailResp)를 문제 그룹 구조(PublishProblemGroupResp)로 매핑합니다.
 *
 * @param scrapDetail - 변환할 스크랩 상세 정보
 * @returns 변환된 문제 그룹 데이터, 문제가 없는 경우 null 반환
 */
export function convertScrapToGroup(scrapDetail: ScrapDetailResp): PublishProblemGroupResp | null {
  if (!scrapDetail?.problem) {
    return null;
  }

  // 포인팅 데이터 변환: PointingResp -> PointingWithFeedbackResp
  // 스크랩에서 가져온 포인팅은 이미 스크랩된 상태이므로 isScrapped를 true로 설정
  const pointings: PointingWithFeedbackResp[] =
    scrapDetail.pointings?.map((pointing) => ({
      id: pointing.id,
      no: pointing.no,
      questionContent: pointing.questionContent,
      commentContent: pointing.commentContent,
      concepts: pointing.concepts,
      isUnderstood: undefined,
      isScrapped: true,
    })) ?? [];

  // 문제 데이터 변환: ProblemExtendResp -> ProblemWithStudyInfoResp
  // 학습 관련 필드들은 스크랩에서는 사용하지 않으므로 기본값으로 설정
  const problem: ProblemWithStudyInfoResp = {
    id: scrapDetail.problem.id,
    problemType: scrapDetail.problem.problemType,
    parentProblem: scrapDetail.problem.parentProblem,
    parentProblemTitle: scrapDetail.problem.parentProblemTitle,
    customId: scrapDetail.problem.customId,
    createType: scrapDetail.problem.createType,
    practiceTest: scrapDetail.problem.practiceTest,
    practiceTestNo: scrapDetail.problem.practiceTestNo,
    problemContent: scrapDetail.problem.problemContent,
    title: scrapDetail.problem.title,
    answerType: scrapDetail.problem.answerType,
    answer: scrapDetail.problem.answer,
    difficulty: scrapDetail.problem.difficulty,
    recommendedTimeSec: scrapDetail.problem.recommendedTimeSec,
    memo: scrapDetail.problem.memo,
    concepts: scrapDetail.problem.concepts,
    mainAnalysisImage: scrapDetail.problem.mainAnalysisImage,
    mainHandAnalysisImage: scrapDetail.problem.mainHandAnalysisImage,
    readingTipContent: scrapDetail.problem.readingTipContent,
    oneStepMoreContent: scrapDetail.problem.oneStepMoreContent,
    pointings,
    progress: 'NONE',
    submitAnswer: 0,
    isCorrect: false,
    isDone: false,
    childProblems: [],
  };

  // 문제 그룹 데이터 생성
  // 스크랩은 단일 문제만 포함하므로 no는 1로, progress는 DONE으로 설정
  return {
    no: 1,
    problemId: scrapDetail.problem.id,
    progress: 'DONE',
    problem,
    childProblems: [],
  };
}

/**
 * 여러 TipTap JSON 문서를 하나로 병합합니다.
 * 각 doc의 content 배열을 합쳐서 새로운 doc을 생성합니다.
 *
 * @param jsonStrings - 병합할 JSON 문자열 배열
 * @param addSeparator - 각 doc 사이에 구분선(horizontalRule)을 추가할지 여부
 * @returns 병합된 JSON 문자열
 */
export function mergeTipTapDocs(
  jsonStrings: (string | undefined | null)[],
  addSeparator: boolean = false
): string {
  const EMPTY_DOC = { type: 'doc', content: [] };

  const validDocs = jsonStrings
    .filter((json): json is string => typeof json === 'string' && json.trim().length > 0)
    .map((json) => {
      try {
        return JSON.parse(json);
      } catch (error) {
        console.warn('[mergeTipTapDocs] Invalid JSON string, skipping:', error);
        return null;
      }
    })
    .filter(
      (doc): doc is { type: string; content?: any[] } =>
        doc !== null && doc.type === 'doc' && Array.isArray(doc.content)
    );

  if (validDocs.length === 0) {
    return JSON.stringify(EMPTY_DOC);
  }

  const mergedContent: any[] = [];

  validDocs.forEach((doc, index) => {
    if (index > 0 && addSeparator) {
      // 각 doc 사이에 구분선 추가
      mergedContent.push({ type: 'horizontalRule' });
    }

    if (doc.content && doc.content.length > 0) {
      mergedContent.push(...doc.content);
    }
  });

  const mergedDoc = {
    type: 'doc',
    content: mergedContent,
  };

  return JSON.stringify(mergedDoc);
}
