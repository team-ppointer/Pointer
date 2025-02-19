import { postProblems } from '@apis';
import { Button, Header, ProblemEssentialInput } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ProblemType } from '@types';
import { Controller, useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

type EssentialInput = {
  problemType: ProblemType;
  practiceTestId: number | undefined;
  number: number | undefined;
};

function RouteComponent() {
  const { navigate } = useRouter();

  const { mutate } = postProblems();
  const { control, setValue, watch, handleSubmit } = useForm<EssentialInput>({
    defaultValues: {
      problemType: 'GICHUL_PROBLEM',
      practiceTestId: undefined,
      number: undefined,
    },
  });
  const problemType = watch('problemType');

  const handleClickRegister = (data: EssentialInput) => {
    console.log('EssentialInput', data);

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
              <Controller
                control={control}
                name='number'
                render={({ field }) => (
                  <ProblemEssentialInput.PraticeTestNumber
                    practiceTestNumber={field.value}
                    handleChangeNumber={field.onChange}
                  />
                )}
              />
            </ProblemEssentialInput.PracticeTestSection>
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
