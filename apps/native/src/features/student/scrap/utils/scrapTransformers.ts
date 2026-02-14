import { components } from '@schema';

type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];
type ProblemEntireResp = components['schemas']['ProblemEntireResp'];
type PointingEntireResp = components['schemas']['PointingEntireResp'];
/**
 * 스크랩 상세 정보를 AllPointingsScreen에서 사용할 수 있는 형식으로 변환합니다.
 * 스크랩 데이터 구조(ScrapDetailResp)를 문제 그룹 구조(PublishProblemGroupResp)로 매핑합니다.
 *
 * @param entireProblem - 전체 문제 데이터
 * @param problemEntirePointing - 문제 전체 포인팅 데이터
 * @returns 변환된 문제 그룹 데이터, 문제가 없는 경우 null 반환
 */
export function convertScrapToGroup(
  entireProblem: ProblemEntireResp[],
  entirePointing: PointingEntireResp[]
): PublishProblemGroupResp | null {
  if (!entireProblem || entireProblem.length === 0) {
    return null;
  }

  const mainProblem = entireProblem.find((p) => p.problemType === 'MAIN_PROBLEM');
  const childProblemsData = entireProblem.filter((p) => p.problemType === 'CHILD_PROBLEM');

  if (!mainProblem) {
    return null;
  }

  const pointingsForProblem = entirePointing.filter((p) => p.problemId === mainProblem.problemId);

  // 포인팅 데이터 변환
  const pointings: PointingWithFeedbackResp[] = pointingsForProblem ?? [];

  // childProblems를 ProblemWithStudyInfoResp 형태로 변환
  const transformedChildProblems = childProblemsData.map((childProblem) => {
    const childPointings = entirePointing.filter((p) => p.problemId === childProblem.problemId);
    return {
      ...childProblem,
      pointings: childPointings,
      childProblems: [],
    } as unknown as ProblemWithStudyInfoResp;
  });

  // 문제 데이터 변환
  const problem: ProblemWithStudyInfoResp = {
    ...mainProblem,
    pointings,
    childProblems: transformedChildProblems,
  } as unknown as ProblemWithStudyInfoResp;

  return {
    problemId: mainProblem.problemId,
    problem,
    childProblems: transformedChildProblems,
  } as PublishProblemGroupResp;
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
