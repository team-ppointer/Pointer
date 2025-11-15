import type { FC, ReactNode } from 'react';
import { ComponentWithLabel } from '@components';
import { Control } from 'react-hook-form';
import { components } from '@schema';
import { postOcr } from '@apis';

import { EditorField } from '@/components/problem';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

interface TipSectionProps {
  children: ReactNode;
}

const BaseTipSection: FC<TipSectionProps> = ({ children }) => {
  return <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>{children}</div>;
};

interface ReadingTipCardProps {
  control: Control<ProblemUpdateRequest>;
}

const ReadingTipCard: FC<ReadingTipCardProps> = ({ control }) => {
  const ocrMutation = postOcr();

  return (
    <ComponentWithLabel label='문제를 읽어내려 갈 때' labelWidth='12rem' direction='column'>
      <div>
        <EditorField
          control={control}
          name='readingTipContent'
          ocrApiCall={ocrMutation.mutateAsync}
        />
      </div>
    </ComponentWithLabel>
  );
};

interface OneStepMoreCardProps {
  control: Control<ProblemUpdateRequest>;
}

const OneStepMoreCard: FC<OneStepMoreCardProps> = ({ control }) => {
  const ocrMutation = postOcr();

  return (
    <ComponentWithLabel label='한 걸음 더' labelWidth='15.4rem' direction='column'>
      <div>
        <EditorField
          control={control}
          name='oneStepMoreContent'
          ocrApiCall={ocrMutation.mutateAsync}
        />
      </div>
    </ComponentWithLabel>
  );
};

type TipSectionComponent = FC<TipSectionProps> & {
  ReadingTipCard: typeof ReadingTipCard;
  OneStepMoreCard: typeof OneStepMoreCard;
};

export const TipSection = BaseTipSection as TipSectionComponent;

TipSection.ReadingTipCard = ReadingTipCard;
TipSection.OneStepMoreCard = OneStepMoreCard;
