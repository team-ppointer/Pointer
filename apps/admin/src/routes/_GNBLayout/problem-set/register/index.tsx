import { postProblemSet } from '@apis';
import {
  Button,
  ComponentWithLabel,
  Header,
  IconButton,
  Input,
  PlusButton,
  ProblemCard,
  Tag,
} from '@components';
import { components } from '@schema';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem-set/register/')({
  component: RouteComponent,
});

type ProblemSetPostRequest = components['schemas']['ProblemSetPostRequest'];

function RouteComponent() {
  // api
  const { mutate: mutateProblemSet } = postProblemSet();

  // RHF
  const { register, handleSubmit, watch } = useForm<ProblemSetPostRequest>({
    defaultValues: {
      problemSetTitle: '',
      problems: [],
    },
  });
  const problemList = watch('problems');

  const handleClickRegister = handleSubmit((data: ProblemSetPostRequest) => {
    mutateProblemSet({
      body: {
        ...data,
      },
    });
  });

  return (
    <>
      <Header
        title='새로운 세트 등록하기'
        description='문항을 잡고 드래그해서 순서를 바꿀 수 있어요'
      />
      <div className='mt-[6.4rem] flex justify-between'>
        <div className='w-[81.5rem]'>
          <ComponentWithLabel label='세트 제목'>
            <Input placeholder='입력해주세요' {...register('problemSetTitle')} />
          </ComponentWithLabel>
        </div>
        <Button variant='dark' onClick={handleClickRegister}>
          저장하기
        </Button>
      </div>
      <div className='mt-[4.8rem] grid w-full auto-cols-[48rem] grid-flow-col gap-[3.2rem] overflow-auto'>
        {problemList.length == 0 ? (
          <ProblemCard>
            <ProblemCard.EmptyView onClick={() => {}} />
          </ProblemCard>
        ) : (
          problemList.map((problem) => (
            <ProblemCard>
              <ProblemCard.TextSection>
                <ProblemCard.Title title='문항 제목' />
                <ProblemCard.Info label='문항 ID' content='00' />
                <ProblemCard.Info label='문항 타이틀' content='타이틀' />
                <ProblemCard.Info label='문항 메모' content='메모' />
                <ProblemCard.TagSection>
                  <Tag label='태그명' />
                  <Tag label='태그명' />
                </ProblemCard.TagSection>
              </ProblemCard.TextSection>

              <ProblemCard.ButtonSection>
                <IconButton variant='modify' />
                <IconButton variant='delete' />
              </ProblemCard.ButtonSection>

              <ProblemCard.CardImage src='' height={'34.4rem'} />
            </ProblemCard>
          ))
        )}
        <div className='flex items-center'>
          <PlusButton onClick={() => {}} />
        </div>
      </div>
    </>
  );
}
