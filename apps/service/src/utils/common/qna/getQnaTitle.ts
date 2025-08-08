export const getQnaTitle = (type: string) => {
  switch (type) {
    case 'PROBLEM_CONTENT':
      return '메인 문제';
    case 'CHILD_PROBLEM_CONTENT':
      return '새끼 문제';
    case 'PROBLEM_POINTING_QUESTION':
      return '메인 문제 포인팅-분석';
    case 'CHILD_PROBLEM_POINTING_QUESTION':
      return '새끼 문제 포인팅-분석';
    case 'PROBLEM_POINTING_COMMENT':
      return '메인 문제 포인팅-처방';
    case 'CHILD_PROBLEM_POINTING_COMMENT':
      return '새끼 문제 포인팅-처방';
    case 'PROBLEM_MAIN_ANALYSIS':
      return '분석';
    case 'PROBLEM_MAIN_HAND_ANALYSIS':
      return '손해설';
    case 'PROBLEM_READING_TIP_CONTENT':
      return '문제를 읽어내려갈 때';
    case 'PROBLEM_ONE_STEP_MORE':
      return '한걸음 더';
    default:
      return '문제';
  }
};
