import { ChangeEvent } from 'react';
import type { FC, ReactNode } from 'react';
import { AnswerInput, ComponentWithLabel, Tag, SegmentedControl } from '@components';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { components } from '@schema';
import { AlertCircle, Plus } from 'lucide-react';
import { postOcr } from '@apis';

import { EditorField, TextArea } from '@/components/problem';
import { ProblemAnswerType } from '@/types/component';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

interface MainProblemSectionProps {
  children: ReactNode;
}

const BaseMainProblemSection: FC<MainProblemSectionProps> = ({ children }) => {
  return <div className='space-y-6'>{children}</div>;
};

interface ConceptTagInputProps {
  concepts?: number[];
  tagsNameMap?: Record<number, string>;
  onRemoveTag?: (tag: number) => void;
  onOpenTagModal?: () => void;
}

const ConceptTagInput: FC<ConceptTagInputProps> = ({
  concepts,
  tagsNameMap = {},
  onRemoveTag,
  onOpenTagModal,
}) => {
  return (
    <ComponentWithLabel label='개념 태그' labelWidth='4rem'>
      <div className='flex flex-wrap gap-2'>
        {concepts?.map((tag) => (
          <Tag
            key={tag}
            label={tagsNameMap[tag] ?? ''}
            removable
            color='dark'
            onClick={() => onRemoveTag?.(tag)}
          />
        ))}
        <Tag icon={Plus} label='태그 추가하기' color='dashed' onClick={onOpenTagModal} />
        {concepts && concepts.length === 0 && (
          <div className='mt-2 flex w-full items-center gap-2 text-sm text-red-600'>
            <AlertCircle className='h-4 w-4' />
            개념 태그를 추가해주세요.
          </div>
        )}
      </div>
    </ComponentWithLabel>
  );
};

interface AnswerInputProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  errors: FieldErrors<ProblemUpdateRequest>;
}

const AnswerInputSection: FC<AnswerInputProps> = ({ control, register, errors }) => {
  const answerRegistration = register('answer', {
    valueAsNumber: true,
    required: '필수 입력 항목입니다.',
  });
  const watchedAnswer = useWatch({
    control,
    name: 'answer',
  });
  const selectedAnswerType = useWatch({
    control,
    name: 'answerType',
  }) as ProblemAnswerType | undefined;

  return (
    <ComponentWithLabel label='답안' labelWidth='4rem'>
      <div
        className={`w-full overflow-hidden rounded-xl transition-all duration-200 ${
          errors?.answerType || errors?.answer ? 'ring-2 ring-red-200 ring-offset-2' : 'ring-0'
        }`}>
        <AnswerInput>
          <Controller
            control={control}
            name='answerType'
            rules={{
              required: '필수 입력 항목입니다.',
            }}
            render={({ field }) => (
              <AnswerInput.AnswerTypeSection
                selectedAnswerType={field.value as ProblemAnswerType | undefined}
                onChange={(nextValue) => field.onChange(nextValue)}
              />
            )}
          />
          <AnswerInput.AnswerInputSection
            selectedAnswerType={selectedAnswerType}
            selectedAnswer={watchedAnswer}
            isError={Boolean(errors?.answer)}
            registration={answerRegistration}
          />
        </AnswerInput>
      </div>
      {(errors?.answerType || errors?.answer) && (
        <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' />
          답안 유형과 정답을 선택해주세요.
        </div>
      )}
    </ComponentWithLabel>
  );
};

interface DifficultyInputProps {
  control: Control<ProblemUpdateRequest>;
  errors: FieldErrors<ProblemUpdateRequest>;
}

const DifficultyInput: FC<DifficultyInputProps> = ({ control, errors }) => {
  return (
    <ComponentWithLabel label='난이도' labelWidth='4rem'>
      <div>
        <Controller
          control={control}
          name='difficulty'
          rules={{ required: '필수 입력 항목입니다.' }}
          render={({ field }) => (
            <SegmentedControl
              value={field.value != null ? String(field.value) : undefined}
              onChange={(nextValue) => field.onChange(Number(nextValue))}
              items={[
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' },
                { label: '5', value: '5' },
                { label: '6', value: '6' },
                { label: '7', value: '7' },
                { label: '8', value: '8' },
                { label: '9', value: '9' },
                { label: '10', value: '10' },
              ]}
            />
          )}
        />
      </div>
      {errors?.difficulty && (
        <div className='mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' />
          {(errors.difficulty as { message?: string })?.message || '난이도를 선택해주세요.'}
        </div>
      )}
    </ComponentWithLabel>
  );
};

interface RecommendedTimeInputProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  setValue: UseFormSetValue<ProblemUpdateRequest>;
  errors: FieldErrors<ProblemUpdateRequest>;
}

const RecommendedTimeInput: FC<RecommendedTimeInputProps> = ({
  control,
  register,
  setValue,
  errors,
}) => {
  const watchedRecommendedTimeSec = useWatch({
    control,
    name: 'recommendedTimeSec',
    defaultValue: 0,
  });
  const minutes = Math.floor((watchedRecommendedTimeSec || 0) / 60);
  const seconds = Math.max(0, (watchedRecommendedTimeSec || 0) % 60);

  const handleChangeMinutes = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    const nextMinutes = raw === '' ? 0 : Math.max(0, Number(raw));
    const nextTotal = nextMinutes * 60 + seconds;
    setValue('recommendedTimeSec', nextTotal, { shouldDirty: true, shouldValidate: true });
  };

  const handleChangeSeconds = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    let nextSeconds = raw === '' ? 0 : Math.max(0, Number(raw));
    if (!Number.isFinite(nextSeconds)) nextSeconds = 0;
    if (nextSeconds > 59) nextSeconds = 59;
    const nextTotal = minutes * 60 + nextSeconds;
    setValue('recommendedTimeSec', nextTotal, { shouldDirty: true, shouldValidate: true });
  };

  const validateRecommendedTime = (value: number | null | undefined) =>
    (value !== undefined && value !== null && !Number.isNaN(value)) || '필수 입력 항목입니다.';

  const recommendedTimeRegistration = register('recommendedTimeSec', {
    valueAsNumber: true,
    validate: validateRecommendedTime,
  });
  return (
    <ComponentWithLabel label='권장 시간' labelWidth='4rem'>
      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <input
              className={`h-[45.8px] w-[45.8px] rounded-xl border bg-white text-center text-sm font-semibold transition-all duration-200 focus:outline-none ${
                errors?.recommendedTimeSec
                  ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'focus:border-main focus:ring-main/20 border-gray-200 hover:border-gray-300 focus:ring-2'
              } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0`}
              type='number'
              min={0}
              value={Number.isFinite(minutes) ? minutes : 0}
              onChange={handleChangeMinutes}
              placeholder='0'
            />
            <span className='text-sm font-semibold text-gray-700'>분</span>
          </div>
          <div className='flex items-center gap-2'>
            <input
              className={`h-[45.8px] w-[45.8px] rounded-xl border bg-white text-center text-sm font-semibold transition-all duration-200 focus:outline-none ${
                errors?.recommendedTimeSec
                  ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'focus:border-main focus:ring-main/20 border-gray-200 hover:border-gray-300 focus:ring-2'
              } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0`}
              type='number'
              min={0}
              max={59}
              value={Number.isFinite(seconds) ? seconds : 0}
              onChange={handleChangeSeconds}
              placeholder='0'
            />
            <span className='text-sm font-semibold text-gray-700'>초</span>
          </div>
          <input type='hidden' {...recommendedTimeRegistration} />
        </div>
        {errors?.recommendedTimeSec && (
          <div className='flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700'>
            <AlertCircle className='h-4 w-4 flex-shrink-0' />
            {(errors.recommendedTimeSec as { message?: string })?.message ||
              '권장 시간을 입력해주세요.'}
          </div>
        )}
      </div>
    </ComponentWithLabel>
  );
};

interface ProblemContentEditorProps {
  control: Control<ProblemUpdateRequest>;
}

const ProblemContentEditor: FC<ProblemContentEditorProps> = ({ control }) => {
  const ocrMutation = postOcr();

  return (
    <ComponentWithLabel label='문제 내용' labelWidth='4rem' direction='column'>
      <div>
        <EditorField control={control} name='problemContent' ocrApiCall={ocrMutation.mutateAsync} />
      </div>
    </ComponentWithLabel>
  );
};

interface MemoInputProps {
  register: UseFormRegister<ProblemUpdateRequest>;
}

const MemoInput: FC<MemoInputProps> = ({ register }) => {
  return (
    <ComponentWithLabel label='메모 작성' labelWidth='4rem'>
      <div className='relative'>
        <TextArea
          placeholder='여기에 메모를 작성해주세요. (선택사항)'
          className='min-h-[120px] resize-y'
          {...register('memo')}
        />
      </div>
    </ComponentWithLabel>
  );
};

type MainProblemSectionComponent = FC<MainProblemSectionProps> & {
  ConceptTagInput: typeof ConceptTagInput;
  AnswerInput: typeof AnswerInputSection;
  DifficultyInput: typeof DifficultyInput;
  RecommendedTimeInput: typeof RecommendedTimeInput;
  ProblemContentEditor: typeof ProblemContentEditor;
  MemoInput: typeof MemoInput;
};

export const MainProblemSection = BaseMainProblemSection as MainProblemSectionComponent;

MainProblemSection.ConceptTagInput = ConceptTagInput;
MainProblemSection.AnswerInput = AnswerInputSection;
MainProblemSection.DifficultyInput = DifficultyInput;
MainProblemSection.RecommendedTimeInput = RecommendedTimeInput;
MainProblemSection.ProblemContentEditor = ProblemContentEditor;
MainProblemSection.MemoInput = MemoInput;
