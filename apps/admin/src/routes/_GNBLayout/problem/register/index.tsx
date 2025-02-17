import { postProblems } from '@apis';
import { Button, Header, ProblemEssentialInput } from '@components';
import { useProblemEssentialInput } from '@hooks';
import { createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { navigate } = useRouter();
  const {
    problemType,
    practiceTest,
    practiceTestNumber,
    handleChangeType,
    handlePracticeTest,
    handleChangeNumber,
  } = useProblemEssentialInput();

  const { mutate } = postProblems();

  const handleClickRegister = () => {
    const requestBody =
      problemType === 'CREATION_PROBLEM'
        ? { problemType, practiceTestId: undefined, number: undefined }
        : { problemType, practiceTestId: practiceTest?.id, number: practiceTestNumber };

    mutate(
      {
        body: requestBody,
      },
      {
        // onSuccess: (data) => {
        //   const { problemId } = data;
        //   navigate({ to: `/problem/${problemId}` });
        // },
      }
    );

    return;
  };
  return (
    <>
      <Header title='문항 등록' />
      <ProblemEssentialInput
        problemType={problemType}
        practiceTest={practiceTest}
        practiceTestNumber={practiceTestNumber}
        handleChangeType={handleChangeType}
        handlePracticeTest={handlePracticeTest}
        handleChangeNumber={handleChangeNumber}
      />
      <div className='mt-[2.4rem] flex w-full items-center justify-end'>
        <Button type='button' sizeType='long' variant='dark' onClick={handleClickRegister}>
          완료
        </Button>
      </div>
    </>
  );
}
