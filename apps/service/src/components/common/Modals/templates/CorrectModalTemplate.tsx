import { IcCorrect } from '@svg';

import BaseModalTemplate from './BaseModalTemplate';

interface CorrectModalTemplateProps {
  handleClickButton?: () => void;
}

const CorrectModalTemplate = ({ handleClickButton }: CorrectModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <IcCorrect width={48} height={48} />
      </BaseModalTemplate.Content>
      <BaseModalTemplate.Text text='정답이에요' />
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickButton}>
          다시 풀어보기
        </BaseModalTemplate.Button>
        <BaseModalTemplate.Button onClick={handleClickButton} variant='light'>
          다음 문제로 넘어가기
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default CorrectModalTemplate;
