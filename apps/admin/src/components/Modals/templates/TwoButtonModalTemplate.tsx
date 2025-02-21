import BaseModalTemplate from './BaseModalTemplate';

interface TwoButtonModalTemplateProps {
  text: string;
  leftButtonText: string;
  rightButtonText: string;
  handleClickLeftButton: () => void;
  handleClickRightButton: () => void;
}

const TwoButtonModalTemplate = ({
  text,
  leftButtonText,
  rightButtonText,
  handleClickLeftButton,
  handleClickRightButton,
}: TwoButtonModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <p>{text}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickLeftButton} variant='light'>
          {leftButtonText}
        </BaseModalTemplate.Button>
        <BaseModalTemplate.Button onClick={handleClickRightButton}>
          {rightButtonText}
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default TwoButtonModalTemplate;
