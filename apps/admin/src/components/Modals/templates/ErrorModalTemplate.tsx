import { IcError } from '@svg';

import BaseModalTemplate from './BaseModalTemplate';

interface ErrorModalTemplateProps {
  text: string;
  buttonText: string;
  handleClickButton: () => void;
}

const ErrorModalTemplate = ({ text, buttonText, handleClickButton }: ErrorModalTemplateProps) => {
  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <IcError width={50} height={50} />
        <p className='text-center'>{text}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={handleClickButton}>
          {buttonText}
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default ErrorModalTemplate;
