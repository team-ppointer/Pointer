import BaseModalTemplate from './BaseModalTemplate';

interface OneButtonModalTemplateProps {
  text: string;
  buttonText: string;
  handleClickButton: () => void;
}

const OneButtonModalTemplate = ({
  text,
  buttonText,
  handleClickButton,
}: OneButtonModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <p>{text}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickButton}>
          {buttonText}
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default OneButtonModalTemplate;
