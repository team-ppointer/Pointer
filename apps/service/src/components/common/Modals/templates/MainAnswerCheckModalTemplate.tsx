import { IcCorrect, IcIncorrect } from '@svg';
import { ProblemStatus } from '@types';

import BaseModalTemplate from './BaseModalTemplate';

interface MainAnswerCheckModalTemplateProps {
  handleClickButton?: () => void;
  onClose: () => void;
  result: ProblemStatus | undefined;
}

const MainAnswerCheckModalTemplate = ({
  handleClickButton,
  result,
  onClose,
}: MainAnswerCheckModalTemplateProps) => {
  if (!result) return null;
  const isCorrect = result === 'CORRECT' || result === 'RETRY_CORRECT';

  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        {isCorrect ? <IcCorrect width={48} height={48} /> : <IcIncorrect width={48} height={48} />}
      </BaseModalTemplate.Content>
      <BaseModalTemplate.Text text={isCorrect ? '정답이에요' : '오답이에요'} />
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={onClose}>다시 풀어보기</BaseModalTemplate.Button>
        <BaseModalTemplate.Button onClick={handleClickButton} variant='light'>
          해설 보기
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default MainAnswerCheckModalTemplate;
