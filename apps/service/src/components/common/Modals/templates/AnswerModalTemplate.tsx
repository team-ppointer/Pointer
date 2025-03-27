import BaseModalTemplate from './BaseModalTemplate';

interface TwoButtonModalTemplateProps {
  answer?: string;
  handleClickButton: () => void;
}

const TwoButtonModalTemplate = ({ answer, handleClickButton }: TwoButtonModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <BaseModalTemplate.Text text='정답' />
        <p className='font-bold-32 text-green'>{answer}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickButton}>닫기</BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default TwoButtonModalTemplate;
