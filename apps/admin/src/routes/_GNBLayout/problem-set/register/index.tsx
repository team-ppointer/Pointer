import {
  ComponentWithLabel,
  Header,
  Input,
  Button,
  ProblemSearchModal,
  Modal,
  ProblemCard,
  Tag,
  IconButton,
  PlusButton,
  TwoButtonModalTemplate,
  ErrorModalTemplate,
} from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { Slide, ToastContainer } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useModal, useInvalidate } from '@hooks';
import { postProblemSet } from '@apis';
import { useForm } from 'react-hook-form';
import { components } from '@schema';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { StatusToggle } from '@/components/problemSet';

export const Route = createFileRoute('/_GNBLayout/problem-set/register/')({
  component: RouteComponent,
});

type ProblemSetItemRequest = components['schemas']['ProblemSetItemRequest'];
type ProblemMetaResp = components['schemas']['ProblemMetaResp'];

function RouteComponent() {
  const [confirmStatus, setConfirmStatus] = useState<'CONFIRMED' | 'DOING'>('DOING');
  const [problemSummaries, setProblemSummaries] = useState<ProblemSetItemRequest[]>([
    {
      no: 1,
      problemId: 0,
    },
  ]);
  const [problemDetails, setProblemDetails] = useState<Map<number, ProblemMetaResp>>(new Map());
  const [deleteProblemIndex, setDeleteProblemIndex] = useState<number>(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    isOpen: isProblemDeleteModalOpen,
    openModal: openProblemDeleteModal,
    closeModal: closeProblemDeleteModal,
  } = useModal();

  const {
    isOpen: isSearchModalOpen,
    openModal: openSearchModal,
    closeModal: closeSearchModal,
  } = useModal();

  const {
    isOpen: isErrorModalOpen,
    openModal: openErrorModal,
    closeModal: closeErrorModal,
  } = useModal();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const navigate = useNavigate();
  const { invalidateProblemSet } = useInvalidate();

  // api
  const { mutate: mutatePostProblemSet } = postProblemSet();

  // RHF
  const { register, handleSubmit, setValue } = useForm<{
    title: string;
    problems: ProblemSetItemRequest[];
  }>({
    defaultValues: {
      title: '',
      problems: [],
    },
  });

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = problemSummaries.findIndex((item) => item.problemId === active.id);
      const newIndex = problemSummaries.findIndex((item) => item.problemId === over.id);

      const newProblemSummaries = arrayMove(problemSummaries, oldIndex, newIndex);
      setProblemSummaries(newProblemSummaries);
      setValue('problems', newProblemSummaries);
    }
  };

  // 문제 추가 핸들러
  const handleClickAdd = () => {
    const newProblem: ProblemSetItemRequest = {
      no: problemSummaries.length + 1,
      problemId: 0, // 빈 카드를 나타내는 ID
    };
    const newProblemSummaries = [...problemSummaries, newProblem];
    setProblemSummaries(newProblemSummaries);
    setValue('problems', newProblemSummaries);
  };

  // 특정 인덱스에 문제 추가
  const handleAddProblem = (index: number) => {
    setCurrentProblemIndex(index);
    openSearchModal();
  };

  // 문제 요약 추가
  const handleAddProblemSummary = (index: number, problem: ProblemMetaResp) => {
    const updatedProblemSummaries = [...problemSummaries];
    updatedProblemSummaries[index] = {
      no: index + 1,
      problemId: problem.id,
    };
    setProblemSummaries(updatedProblemSummaries);
    setValue('problems', updatedProblemSummaries);

    // 문제 상세 정보 저장
    const newProblemDetails = new Map(problemDetails);
    newProblemDetails.set(problem.id, problem);
    setProblemDetails(newProblemDetails);

    closeSearchModal();
  };

  // 문제 삭제 클릭 핸들러
  const handleClickDeleteProblem = (index: number) => {
    setDeleteProblemIndex(index);
    openProblemDeleteModal();
  };

  // 문제 삭제 실행
  const handleDeleteProblem = (index: number) => {
    const newProblemSummaries = problemSummaries.filter((_, i) => i !== index);
    // no 값 재정렬
    const reorderedProblems = newProblemSummaries.map((item, i) => ({
      ...item,
      no: i + 1,
    }));
    setProblemSummaries(reorderedProblems);
    setValue('problems', reorderedProblems);
    closeProblemDeleteModal();
  };

  // 폼 저장 핸들러
  const handleClickSave = (data: { title: string; problems: ProblemSetItemRequest[] }) => {
    // 빈 문제 세트 검증
    const validProblems = data.problems.filter((problem) => problem.problemId !== 0);

    if (validProblems.length === 0) {
      setErrorMessage('추가된 문제가 없어요');
      openErrorModal();
      return;
    }

    if (!data.title.trim()) {
      setErrorMessage('세트 제목을 입력해주세요.');
      openErrorModal();
      return;
    }

    // API 호출
    mutatePostProblemSet(
      {
        body: {
          title: data.title,
          problems: validProblems,
        },
      },
      {
        onSuccess: async () => {
          toast.success('문제 세트가 성공적으로 등록되었습니다.');
          // 문제 세트 목록 캐시 무효화하여 새로 등록된 세트가 바로 표시되도록 함
          await invalidateProblemSet(0);
          navigate({ to: '/problem-set' });
        },
        onError: () => {
          setErrorMessage('문제 세트 등록에 실패했습니다. 다시 시도해주세요.');
          openErrorModal();
        },
      }
    );
  };

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='dark'
        transition={Slide}
        style={{
          fontSize: '1.6rem',
        }}
      />
      <Header title='새로운 세트 등록하기' />
      <div className='mt-1600 flex justify-between'>
        <div className='w-[81.5rem]'>
          <ComponentWithLabel label='세트 제목'>
            <Input placeholder='입력해주세요' {...register('title', { required: true })} />
          </ComponentWithLabel>
        </div>

        <div className='flex items-center gap-600'>
          <StatusToggle
            selectedStatus={confirmStatus}
            onSelect={(status) => {
              if (status !== confirmStatus) {
                setConfirmStatus(status);
              }
            }}
          />
          <div className='flex items-center gap-200'>
            <Button variant='light'>미리보기</Button>
            <Button variant='dark' onClick={handleSubmit(handleClickSave)}>
              등록하기
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-1200 grid w-full auto-cols-[48rem] grid-flow-col gap-800 overflow-auto'>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={problemSummaries.map((item) => item.problemId)}
            strategy={horizontalListSortingStrategy}>
            {problemSummaries.map((item: ProblemSetItemRequest, index: number) => {
              const handlePointerDown = (event: React.PointerEvent) => {
                event.stopPropagation(); // 이벤트가 상위로 전파되지 않도록 차단
              };
              const problem = problemDetails.get(item.problemId);
              const getImageUrl = () => {
                if (!problem?.problemContent?.blocks) return '';
                const imageBlock = problem.problemContent.blocks.find(
                  (block: { type: string; data?: string }) => block.type === 'IMAGE'
                );
                return imageBlock?.data || '';
              };

              return (
                <ProblemCard key={`${item.problemId}-${index}`} problemId={item.problemId}>
                  {item.problemId === 0 ? (
                    <ProblemCard.EmptyView onClick={() => handleAddProblem(index)} />
                  ) : problem ? (
                    <>
                      <ProblemCard.TextSection>
                        <ProblemCard.Title title={`문제 ${index + 1}`} />
                        <ProblemCard.Info label='문제 ID' content={problem.customId} />
                        <ProblemCard.Info label='문제 타이틀' content={problem.title} />
                        <ProblemCard.Info label='문제 메모' content={problem.memo} />
                        <ProblemCard.TagSection>
                          {problem.concepts?.map((concept: { name: string }, tagIndex: number) => {
                            return <Tag key={`${concept.name}-${tagIndex}`} label={concept.name} />;
                          })}
                        </ProblemCard.TagSection>
                      </ProblemCard.TextSection>
                      <ProblemCard.ButtonSection>
                        <IconButton
                          variant='modify'
                          onClick={() =>
                            navigate({
                              to: '/problem/$problemId',
                              params: { problemId: problem.id.toString() },
                            })
                          }
                          onPointerDown={handlePointerDown}
                        />
                        <IconButton
                          variant='delete'
                          onClick={() => handleClickDeleteProblem(index)}
                          onPointerDown={handlePointerDown}
                        />
                      </ProblemCard.ButtonSection>
                      <ProblemCard.CardImage src={getImageUrl()} height={'34.4rem'} />
                    </>
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <span className='font-medium-18 text-lightgray500'>
                        문제를 불러오는 중...
                      </span>
                    </div>
                  )}
                </ProblemCard>
              );
            })}
          </SortableContext>
        </DndContext>
        <div className='flex items-center'>
          <PlusButton onClick={handleClickAdd} />
        </div>
      </div>
      <Modal isOpen={isProblemDeleteModalOpen} onClose={closeProblemDeleteModal}>
        <TwoButtonModalTemplate
          text='문제를 세트에서 제외할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeProblemDeleteModal}
          handleClickRightButton={() => handleDeleteProblem(deleteProblemIndex)}
        />
      </Modal>
      <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
        <ProblemSearchModal
          onClickCard={(problem: ProblemMetaResp) => {
            handleAddProblemSummary(currentProblemIndex, problem);
          }}
        />
      </Modal>
      <Modal isOpen={isErrorModalOpen} onClose={closeErrorModal}>
        <ErrorModalTemplate
          text={errorMessage}
          buttonText='닫기'
          handleClickButton={closeErrorModal}
        />
      </Modal>
    </>
  );
}
