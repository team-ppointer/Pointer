import { components } from '@schema';

type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

export const transformToProblemUpdateRequest = (
  serverData: ProblemInfoResp
): ProblemUpdateRequest => {
  return {
    customId: serverData.customId,
    problemType: serverData.problemType ?? 'GICHUL_PROBLEM',
    practiceTestId: serverData.practiceTest?.id,
    practiceTestNo: serverData.practiceTestNo,
    title: serverData.title ?? '',
    concepts: serverData.concepts?.map((concept) => concept.id) ?? [],
    answerType: serverData.answerType ?? 'MULTIPLE_CHOICE',
    answer: serverData.answer ?? 1,
    difficulty: serverData.difficulty ?? 1,
    recommendedTimeSec: serverData.recommendedTimeSec ?? 0,
    memo: serverData.memo ?? '',
    problemContent: {
      id: serverData.problemContent?.id,
      blocks:
        serverData.problemContent?.blocks?.map((block, index) => ({
          id: block.id,
          rank: index,
          type: block.type,
          data: block.data,
        })) ?? [],
    },
    pointings: [],
    mainAnalysisImageId: serverData.mainAnalysisImage?.id,
    mainHandAnalysisImageId: serverData.mainHandAnalysisImage?.id,
    readingTipContent: {
      id: serverData.readingTipContent?.id,
      blocks:
        serverData.readingTipContent?.blocks?.map((block, index) => ({
          id: block.id,
          rank: index,
          type: block.type,
          data: block.data,
        })) ?? [],
    },
    oneStepMoreContent: {
      id: serverData.oneStepMoreContent?.id,
      blocks:
        serverData.oneStepMoreContent?.blocks?.map((block, index) => ({
          id: block.id,
          rank: index,
          type: block.type,
          data: block.data,
        })) ?? [],
    },
    childProblems:
      serverData.childProblems?.map((childProblem, index) => ({
        id: childProblem.id,
        no: childProblem.no ?? index + 1,
        problemContent: {
          id: childProblem.problemContent?.id,
          blocks:
            childProblem.problemContent?.blocks?.map((block, blockIndex) => ({
              id: block.id,
              rank: blockIndex,
              type: block.type,
              data: block.data,
            })) ?? [],
        },
        answerType: childProblem.answerType ?? 'MULTIPLE_CHOICE',
        answer: childProblem.answer ?? 1,
        concepts: childProblem.concepts?.map((concept) => concept.id) ?? [],
        pointings:
          childProblem.pointings?.map((pointing) => ({
            id: pointing.id,
            no: pointing.no,
            questionContent: {
              id: pointing.questionContent?.id,
              blocks:
                pointing.questionContent?.blocks?.map((block, blockIndex) => ({
                  id: block.id,
                  rank: blockIndex,
                  type: block.type,
                  data: block.data,
                })) ?? [],
            },
            commentContent: {
              id: pointing.commentContent?.id,
              blocks:
                pointing.commentContent?.blocks?.map((block, blockIndex) => ({
                  id: block.id,
                  rank: blockIndex,
                  type: block.type,
                  data: block.data,
                })) ?? [],
            },
            concepts: pointing.concepts?.map((concept) => concept.id) ?? [],
          })) ?? [],
      })) ?? [],
  };
};
