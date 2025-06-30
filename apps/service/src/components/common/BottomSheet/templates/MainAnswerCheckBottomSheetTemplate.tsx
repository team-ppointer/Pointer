import { IcCorrect, IcIncorrect } from '@svg';
import { ProblemStatus } from '@types';

import BaseBottomSheetTemplate from './BaseBottomSheetTemplate';

interface MainAnswerCheckModalTemplateProps {
  result: ProblemStatus | undefined;
  onClose: () => void;
  handleClickStepSolve: () => void;
  handleClickShowReport: () => void;
}

const MainAnswerCheckModalTemplate = ({
  result,
  onClose,
  handleClickStepSolve,
  handleClickShowReport,
}: MainAnswerCheckModalTemplateProps) => {
  if (!result) return null;
  const isCorrect = result === 'CORRECT' || result === 'RETRY_CORRECT';

  return (
    <BaseBottomSheetTemplate>
      <BaseBottomSheetTemplate.Content>
        {isCorrect ? <IcCorrect width={48} height={48} /> : <IcIncorrect width={48} height={48} />}
        <BaseBottomSheetTemplate.Text text={isCorrect ? '정답이에요' : '오답이에요'} />
      </BaseBottomSheetTemplate.Content>
      <BaseBottomSheetTemplate.ButtonSection>
        <BaseBottomSheetTemplate.Button
          variant='recommend'
          label='단계별로 풀어보기'
          onClick={handleClickStepSolve}
        />
        <BaseBottomSheetTemplate.Button label='해설 보기' onClick={handleClickShowReport} />
        {!isCorrect && <BaseBottomSheetTemplate.Button label='다시 풀어보기' onClick={onClose} />}
      </BaseBottomSheetTemplate.ButtonSection>
    </BaseBottomSheetTemplate>
  );
};

export default MainAnswerCheckModalTemplate;
