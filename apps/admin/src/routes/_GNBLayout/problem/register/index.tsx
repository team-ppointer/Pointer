import { postProblems } from '@apis';
import { Button, Header, ProblemEssentialInput } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { problemTypeSchema } from '@types';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { components } from '@schema';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

type ProblemPostRequest = components['schemas']['ProblemPostRequest'];

const essentialInputSchema = z.object({
  problemType: problemTypeSchema,
  practiceTestId: z.number().optional(),
  number: z.number().optional(),
});

function RouteComponent() {
  const { navigate } = useRouter();

  const { mutate } = postProblems();
  const {
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(essentialInputSchema),
    defaultValues: {
      problemType: 'GICHUL_PROBLEM',
      practiceTestId: undefined,
      number: undefined,
    },
  });
  const problemType = watch('problemType');

  const handleClickRegister = (data: ProblemPostRequest) => {
    if (data.problemType !== 'CREATION_PROBLEM' && (!data.practiceTestId || !data.number)) {
      setError('practiceTestId', {
        message: '모의고사와 문항 번호는 필수 입력 항목입니다.',
      });
      setError('number', {
        message: '모의고사와 문항 번호는 필수 입력 항목입니다.',
      });
      return;
    }

    mutate(
      {
        body: data,
      },
      {
        onSuccess: (data) => {
          const { id } = data.data;
          navigate({ to: `/problem/${id}` });
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
                render={({ field }) => (
                  <ProblemEssentialInput.PracticeTest
                    practiceTest={field.value}
                    handlePracticeTest={field.onChange}
                  />
                )}
              />
              <ProblemEssentialInput.PraticeTestNumber
                {...register('number', { valueAsNumber: true })}
              />
            </ProblemEssentialInput.PracticeTestSection>
          )}
          {(errors.practiceTestId || errors.number) && (
            <p className='text-red font-medium-18 mt-[2rem]'>
              모의고사와 문항 번호는 필수 입력 항목입니다.
            </p>
          )}
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
