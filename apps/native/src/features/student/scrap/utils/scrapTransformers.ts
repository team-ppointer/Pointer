import { components } from '@/types/api/schema';

type ScrapExtendResp = components['schemas']['ScrapExtendResp'];
type PublishProblemGroupResp = components['schemas']['PublishProblemGroupResp'];
type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];
type ProblemWithStudyInfoResp = components['schemas']['ProblemWithStudyInfoResp'];

/**
 * 스크랩 데이터를 AllPointings에 전달할 형식(PublishProblemGroupResp)으로 변환합니다.
 * @param scrapDetail - 스크랩 상세 정보
 * @returns 변환된 PublishProblemGroupResp 또는 null (문제가 없는 경우)
 */
export function convertScrapToGroup(
  scrapDetail: ScrapExtendResp
): PublishProblemGroupResp | null {
  if (!scrapDetail?.problem) return null;

  // PointingResp를 PointingWithFeedbackResp로 변환
  const pointingsWithFeedback: PointingWithFeedbackResp[] =
    scrapDetail.pointings?.map((pointing) => ({
      id: pointing.id,
      no: pointing.no,
      questionContent: pointing.questionContent,
      commentContent: pointing.commentContent,
      concepts: pointing.concepts,
      isUnderstood: undefined, // 스크랩에서는 피드백 정보가 없음
    })) || [];

  // ProblemExtendResp를 ProblemWithStudyInfoResp로 변환
  const problemWithStudyInfo: ProblemWithStudyInfoResp = {
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
    pointings: pointingsWithFeedback,
    progress: 'NONE', // 스크랩에서는 진행 상태가 없음
    submitAnswer: 0, // 스크랩에서는 제출 답안이 없음
    isCorrect: false, // 스크랩에서는 정답 여부가 없음
    isDone: false, // 스크랩에서는 완료 여부가 없음
    childProblems: [], // 스크랩에는 childProblems가 없음
  };

  return {
    no: 1, // 스크랩에서는 번호가 없으므로 1로 설정
    problemId: scrapDetail.problem.id,
    progress: 'DONE', // 스크랩된 문제는 완료된 것으로 간주
    problem: problemWithStudyInfo,
    childProblems: [],
  };
}
