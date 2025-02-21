import { deleteProblemSet, getProblemSetById, putConfirmProblemSet } from '@apis';
import {
  Button,
  ComponentWithLabel,
  Header,
  IconButton,
  Input,
  Modal,
  PlusButton,
  ProblemCard,
  ProblemSearchModal,
  StatusToggle,
  Tag,
} from '@components';
import { useModal } from '@hooks';
import { components } from '@schema';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem-set/$problemSetId/')({
  component: RouteComponent,
});

type ProblemSetPostRequest = components['schemas']['ProblemSetPostRequest'];

function RouteComponent() {
  const { problemSetId } = Route.useParams();
  const {
    isOpen: isSearchModalOpen,
    openModal: openSearchModal,
    closeModal: closeSearchModal,
  } = useModal();

  // api
  const { data: problemSetData } = getProblemSetById(Number(problemSetId));
  const { mutate: mutateConfirmProblemSet } = putConfirmProblemSet();
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();

  // RHF
  const { register, handleSubmit, watch, reset } = useForm<ProblemSetPostRequest>({
    defaultValues: {
      problemSetTitle: '',
      problems: [],
    },
  });
  const problemList = watch('problems');

  const handleClickConfirm = () => {
    mutateConfirmProblemSet({
      params: {
        path: {
          problemSetId: Number(problemSetId),
        },
      },
    });
  };

  const handleClickDelete = () => {
    mutateDeleteProblemSet({
      params: {
        path: {
          problemSetId: Number(problemSetId),
        },
      },
    });
  };

  // // useEffect
  // useEffect(() => {
  //   if (problemSetData) {
  //     reset(problemSetData.data);
  //   }
  // }, [problemSetData]);

  return (
    <>
      <Header
        title='새로운 세트 등록하기'
        description='문항을 잡고 드래그해서 순서를 바꿀 수 있어요'
        deleteButton='세트 삭제'
        onClickDelete={handleClickDelete}
      />
      <div className='mt-[6.4rem] flex justify-between'>
        <div className='w-[81.5rem]'>
          <ComponentWithLabel label='세트 제목'>
            <Input placeholder='입력해주세요' {...register('problemSetTitle')} />
          </ComponentWithLabel>
        </div>

        <div className='flex items-center gap-[2.4rem]'>
          <StatusToggle
            selectedStatus={problemSetData?.data.confirmStatus ?? 'NOT_CONFIRMED'}
            onSelect={handleClickConfirm}
          />
          <div className='flex items-center gap-[0.8rem]'>
            <Button variant='light'>미리보기</Button>
            <Button variant='dark' onClick={() => {}}>
              저장하기
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-[4.8rem] grid w-full auto-cols-[48rem] grid-flow-col gap-[3.2rem] overflow-auto'>
        {problemList.length === 0 ? (
          <ProblemCard>
            <ProblemCard.EmptyView onClick={openSearchModal} />
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
          <PlusButton onClick={openSearchModal} />
        </div>
      </div>
      <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
        <ProblemSearchModal />
      </Modal>
    </>
  );
}
