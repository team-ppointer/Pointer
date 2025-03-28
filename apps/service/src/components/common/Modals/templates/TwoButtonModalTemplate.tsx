import BaseModalTemplate from './BaseModalTemplate';

interface TwoButtonModalTemplateProps {
  text: string;
  topButtonText: string;
  bottomButtonText: string;
  handleClickTopButton: () => void;
  handleClickBottomButton: () => void;
}

const TwoButtonModalTemplate = ({
  text,
  topButtonText,
  bottomButtonText,
  handleClickTopButton,
  handleClickBottomButton,
}: TwoButtonModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <p>{text}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickTopButton}>
          {topButtonText}
        </BaseModalTemplate.Button>
        <BaseModalTemplate.Button onClick={handleClickBottomButton} variant='light'>
          {bottomButtonText}
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default TwoButtonModalTemplate;
