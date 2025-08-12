import { deleteProblemSet, getProblemSetSearch, postProblemSet } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  Modal,
  ProblemPreview,
  SearchInput,
  SectionCard,
  TwoButtonModalTemplate,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { GetProblemSetSearchParams } from '@types';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem-set/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateProblemSet } = useInvalidate();
  const { navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState<GetProblemSetSearchParams>({});
  const { register, handleSubmit, reset } = useForm<GetProblemSetSearchParams>();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemSetId = useRef<number | null>(null);

  const { data: problemSetList } = getProblemSetSearch(searchQuery);
  const { mutate: mutatePostProblemSet } = postProblemSet();
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();

  const handleClickSearch = (data: GetProblemSetSearchParams) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );

    setSearchQuery({ ...filteredData });
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery({});
  };

  const handleClickDelete = (problemSetId: number) => {
    deleteProblemSetId.current = problemSetId;
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemSetId.current) return;

    mutateDeleteProblemSet(
      {
        params: {
          path: {
            id: deleteProblemSetId.current,
          },
        },
      },
      {
        onSuccess: async () => {
          await invalidateProblemSet(deleteProblemSetId.current ?? 0);
          closeDeleteModal();
        },
      }
    );
  };

  return (
    <>
      <Header title='세트 목록' />
      <form
        className='mt-1200 flex items-end justify-between gap-400'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-600'>
          <SearchInput
            sizeType='long'
            label='세트 타이틀'
            placeholder='입력해주세요.'
            {...register('setTitle', { required: false })}
          />
          <SearchInput
            sizeType='long'
            label='문항 타이틀'
            placeholder='입력해주세요.'
            {...register('problemTitle', { required: false })}
          />
        </div>
        <div className='flex gap-400'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      <div className='mt-1600 flex flex-col gap-1200'>
        {problemSetList?.data.map((problemSet) => (
          <Link
            key={problemSet.id}
            to={'/problem-set/$problemSetId'}
            params={{
              problemSetId: problemSet.id?.toString(),
            }}>
            <SectionCard>
              <div className='flex items-center justify-between'>
                <h2 className='font-bold-24 text-black'>{problemSet.title}</h2>
                <div className='flex gap-400'>
                  <IconButton
                    variant='delete'
                    onClick={(e) => {
                      e.preventDefault();
                      handleClickDelete(problemSet.id);
                    }}
                  />
                  <IconButton variant='right' />
                </div>
              </div>
              <div className='mt-800 flex gap-800 overflow-auto'>
                {problemSet.problems.map((problem, index) => {
                  const mainProblemImageUrl = problem.problem.problemContent?.blocks?.find(
                    (block) => block.type === 'IMAGE'
                  )?.data;

                  return (
                    <ProblemPreview
                      key={`problem-${index}`}
                      title={problem.problem.title ?? ''}
                      memo={problem.problem.memo ?? ''}
                      imgSrc={mainProblemImageUrl ?? ''}
                    />
                  );
                })}
              </div>
            </SectionCard>
          </Link>
        ))}
      </div>
      <FloatingButton onClick={() => navigate({ to: '/problem-set/register' })}>
        새로운 세트 등록하기
      </FloatingButton>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='세트를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
