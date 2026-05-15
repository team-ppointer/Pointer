import { AlertCircle } from 'lucide-react';

import BaseModalTemplate from './BaseModalTemplate';

interface TwoButtonModalTemplateProps {
  text: string;
  leftButtonText: string;
  rightButtonText: string;
  handleClickLeftButton: () => void;
  handleClickRightButton: () => void;
  variant?: 'default' | 'danger';
  leftButtonDisabled?: boolean;
  rightButtonDisabled?: boolean;
}

const TwoButtonModalTemplate = ({
  text,
  leftButtonText,
  rightButtonText,
  handleClickLeftButton,
  handleClickRightButton,
  variant = 'default',
  leftButtonDisabled = false,
  rightButtonDisabled = false,
}: TwoButtonModalTemplateProps) => {
  const isDanger = variant === 'danger';

  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        <div className='mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100'>
          <AlertCircle className={`h-7 w-7 ${isDanger ? 'text-red-600' : 'text-gray-600'}`} />
        </div>
        <p className='text-lg font-semibold text-gray-900'>{text}</p>
      </BaseModalTemplate.Content>
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button
          onClick={handleClickLeftButton}
          variant='light'
          disabled={leftButtonDisabled}>
          {leftButtonText}
        </BaseModalTemplate.Button>
        <BaseModalTemplate.Button
          onClick={handleClickRightButton}
          variant={isDanger ? 'light' : 'dark'}
          disabled={rightButtonDisabled}>
          {rightButtonText}
        </BaseModalTemplate.Button>
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default TwoButtonModalTemplate;
