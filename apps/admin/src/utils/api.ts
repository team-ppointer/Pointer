import { components } from '@schema';
import { TagType } from '@types';

type ProblemGetResponse = components['schemas']['ProblemGetResponse'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

export const tagToQueryParams = (tags: TagType[]) => {
  if (!tags.length) return {};
  return { conceptTagIds: tags.map((tag) => tag.id) };
};

export const transformToProblemUpdateRequest = (
  serverData: ProblemGetResponse
): ProblemUpdateRequest => {
  return {
    problemType: serverData.problemType ?? 'GICHUL_PROBLEM',
    practiceTestId: serverData.practiceTestId,
    number: serverData.number,
    conceptTagIds: serverData.conceptTagIds ?? [],
    answer: serverData.answer,
    title: serverData.title,
    difficulty: serverData.difficulty,
    memo: serverData.memo ?? '',
    mainProblemImageUrl: serverData.mainProblemImageUrl,
    mainAnalysisImageUrl: serverData.mainAnalysisImageUrl,
    mainHandwritingExplanationImageUrl: serverData.mainHandwritingExplanationImageUrl,
    readingTipImageUrl: serverData.readingTipImageUrl,
    seniorTipImageUrl: serverData.seniorTipImageUrl,
    prescriptionImageUrls: serverData.prescriptionImageUrls ?? [],

    answerType: serverData.answerType,
    recommendedMinute: serverData.recommendedMinute,
    recommendedSecond: serverData.recommendedSecond,

    updateChildProblems: (serverData.childProblems || []).map((child) => ({
      childProblemId: child.childProblemId,
      conceptTagIds: [...child.conceptTagIds],
      imageUrl: child.imageUrl ?? '',
      answerType: child.answerType,
      answer: child.answer,
      prescriptionImageUrls: child.prescriptionImageUrls ?? [''],
    })),
  };
};
