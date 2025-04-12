import { postProblems } from '@apis';
import { Button, Header } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { components } from '@schema';
import { useInvalidate } from '@hooks';

import { ProblemEssentialInput } from '@/components/problem';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

type ProblemPostRequest = components['schemas']['ProblemPostRequest'];

function RouteComponent() {
  const { navigate } = useRouter();
  const { invalidateAll } = useInvalidate();

  const { mutate } = postProblems();
  const {
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<ProblemPostRequest>({
    defaultValues: {
      problemType: 'GICHUL_PROBLEM',
      practiceTestId: undefined,
      number: undefined,
    },
  });
  const problemType = watch('problemType');

  const handleClickRegister = (data: ProblemPostRequest) => {
    mutate(
      {
        body: data,
      },
      {
        onSuccess: (data) => {
          invalidateAll();
          const { id } = data.data;
          navigate({ to: '/problem/$problemId', params: { problemId: id.toString() } });
        },
      }
    );

    return;
  };

  return (
    <>
      <Header title='문항 등록' />
      <form onSubmit={handleSubmit(handleClickRegister)}>
        <ProblemEssentialInput>
          <Controller
            control={control}
            name='problemType'
            render={({ field }) => (
              <ProblemEssentialInput.ProblemTypeSection
                problemType={field.value}
                handleChangeType={(type) => {
                  if (type === 'CREATION_PROBLEM') {
                    setValue('practiceTestId', undefined);
                    setValue('number', undefined);
                  }
                  clearErrors();
                  field.onChange(type);
                }}
              />
            )}
          />
          {problemType !== 'CREATION_PROBLEM' && (
            <ProblemEssentialInput.PracticeTestSection>
              <Controller
                control={control}
                name='practiceTestId'
                rules={{
                  required: '모의고사와 문항 번호는 필수 입력 항목입니다.',
                }}
                render={({ field }) => (
                  <ProblemEssentialInput.PracticeTest
                    practiceTest={field.value}
                    handlePracticeTest={field.onChange}
                  />
                )}
              />
              <ProblemEssentialInput.PraticeTestNumber
                {...register('number', {
                  valueAsNumber: true,
                  required: '모의고사와 문항 번호는 필수 입력 항목입니다.',
                })}
              />
            </ProblemEssentialInput.PracticeTestSection>
          )}
          <ProblemEssentialInput.ProblemError
            isError={Boolean(errors.practiceTestId || errors.number)}
            errorMessage='모의고사와 문항 번호는 필수 입력 항목입니다.'
          />
        </ProblemEssentialInput>
        <div className='mt-[2.4rem] flex w-full items-center justify-end'>
          <Button type='submit' sizeType='long' variant='dark'>
            완료
          </Button>
        </div>
      </form>
    </>
  );
}
