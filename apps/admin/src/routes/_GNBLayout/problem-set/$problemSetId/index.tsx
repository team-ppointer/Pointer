import {
  $api,
  deleteProblemSet,
  getProblemSetById,
  putConfirmProblemSet,
  putProblemSet,
} from '@apis';
import {
  Button,
  ComponentWithLabel,
  ErrorModalTemplate,
  Header,
  IconButton,
  Input,
  Modal,
  PlusButton,
  ProblemCard,
  ProblemSearchModal,
  StatusToggle,
  Tag,
  TwoButtonModalTemplate,
} from '@components';
import { useModal } from '@hooks';
import { components } from '@schema';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';

export const Route = createFileRoute('/_GNBLayout/problem-set/$problemSetId/')({
  component: RouteComponent,
});

type ProblemSetUpdateRequest = components['schemas']['ProblemSetUpdateRequest'];
type ProblemSummaryResponse = components['schemas']['ProblemSummaryResponse'];
type ProblemSearchGetResponse = components['schemas']['ProblemSearchGetResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];

function RouteComponent() {
  const { problemSetId } = Route.useParams();
  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const [problemSummaries, setProblemSummaries] = useState<ProblemSummaryResponse[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [deleteProblemIndex, setDeleteProblemIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const {
    isOpen: isSetDeleteModalOpen,
    openModal: openSetDeleteModal,
    closeModal: closeSetDeleteModal,
  } = useModal();

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

  // api
  const { data: problemSetData } = getProblemSetById(Number(problemSetId));
  const { mutate: mutatePutProblemSet } = putProblemSet();
  const { mutate: mutateConfirmProblemSet } = putConfirmProblemSet();
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();
  const confirmStatus = problemSetData?.data.confirmStatus;

  // RHF
  const { register, handleSubmit, watch, setValue } = useForm<ProblemSetUpdateRequest>({
    defaultValues: {
      problemSetTitle: '',
      problemIds: [],
    },
  });
  const problemList = watch('problemIds');

  const handleClickConfirm = () => {
    if (!isSaved) {
      setErrorMessage(`저장되지 않은 내용이 있어요\n저장 후 다시 시도해주세요`);
      openErrorModal();
      return;
    }

    mutateConfirmProblemSet(
      {
        params: {
          path: {
            problemSetId: Number(problemSetId),
          },
        },
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/problemSet/{problemSetId}', {
              params: {
                path: {
                  problemSetId: Number(problemSetId),
                },
              },
            }).queryKey,
          });
          if (data.data === 'CONFIRMED') {
            toast.success('컨펌이 완료되었습니다');
          } else {
            toast.info('컨펌이 취소되었습니다');
          }
        },
        onError: (error: ErrorResponse) => {
          setErrorMessage(error.message);
          openErrorModal();
        },
      }
    );
  };

  const handleMutateSetDelete = () => {
    mutateDeleteProblemSet(
      {
        params: {
          path: {
            problemSetId: Number(problemSetId),
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/problemSet/search').queryKey,
          });
          navigate({ to: '/problem-set' });
        },
      }
    );
  };

  // functions
  const handleClickSetDelete = () => {
    if (problemSetData?.data.publishedDates && problemSetData?.data.publishedDates.length > 0) {
      setErrorMessage('발행된 세트는 삭제할 수 없어요');
      openErrorModal();
      return;
    }
    openSetDeleteModal();
  };

  const createModifyError = () => {
    setErrorMessage('컨펌된 세트는 문항을 수정할 수 없어요');
    openErrorModal();
  };

  const handleClickAdd = () => {
    if (confirmStatus === 'CONFIRMED') {
      createModifyError();
      return;
    }

    setValue('problemIds', [...problemList, 0]);
  };

  const handleAddProblem = (index: number) => {
    setCurrentProblemIndex(index);
    openSearchModal();
  };

  const handleClickDeleteProblem = (index: number) => {
    if (confirmStatus === 'CONFIRMED') {
      createModifyError();
      return;
    }

    setDeleteProblemIndex(index);
    openProblemDeleteModal();
  };

  const handleDeleteProblem = (index: number) => {
    setIsSaved(false);
    if (problemList.length === 1) {
      resetProblemSummaries();
      setValue('problemIds', [0]);
      closeProblemDeleteModal();
      return;
    }

    const newProblemList = [...problemList];
    newProblemList.splice(index, 1);
    setValue('problemIds', newProblemList);

    const newProblemSummaries = [...problemSummaries];
    newProblemSummaries.splice(index, 1);
    setProblemSummaries(newProblemSummaries);

    closeProblemDeleteModal();
  };

  const resetProblemSummaries = () => {
    setProblemSummaries([
      {
        problemId: 0,
        problemCustomId: '',
        memo: '',
        mainProblemImageUrl: undefined,
        tagNames: [],
      },
    ]);
  };

  const handleAddProblemSummary = (index: number, problemSummary: ProblemSearchGetResponse) => {
    const newProblemList = [...problemList];
    newProblemList[index] = problemSummary.problemId;
    setValue('problemIds', newProblemList);

    const newProblemSummaries = [...problemSummaries];
    newProblemSummaries[index] = problemSummary;
    setProblemSummaries(newProblemSummaries);

    closeSearchModal();
    setIsSaved(false);
  };

  const handleClickSave = (data: ProblemSetUpdateRequest) => {
    const filteredProblemIds = data.problemIds.filter((problemId) => problemId !== 0);

    if (filteredProblemIds.length === 0) {
      setErrorMessage('추가된 문항이 없어요');
      openErrorModal();
      return;
    }

    const filteredData = {
      ...data,
      problemIds: filteredProblemIds,
    };

    mutatePutProblemSet(
      {
        body: {
          ...filteredData,
        },
        params: {
          path: {
            problemSetId: Number(problemSetId),
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/problemSet/{problemSetId}', {
              params: {
                path: {
                  problemSetId: Number(problemSetId),
                },
              },
            }).queryKey,
          });
          toast.success('저장이 완료되었습니다');
          setIsSaved(true);
        },
      }
    );
  };

  // useEffect
  useEffect(() => {
    if (problemSetData) {
      setValue('problemSetTitle', problemSetData.data.title ?? '');
      if (problemSetData.data.problemSummaries.length === 0) {
        setValue('problemIds', [0]);
        resetProblemSummaries();
      } else {
        setValue(
          'problemIds',
          problemSetData.data.problemSummaries.map((problem) => problem.problemId)
        );
        setProblemSummaries(problemSetData.data.problemSummaries);
      }
    }
  }, [problemSetData]);

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
      <Header
        title='세트 수정하기'
        description={`문항을 잡고 드래그해서 순서를 바꿀 수 있어요\n컨펌된 세트도 타이틀 수정이 가능해요`}
        deleteButton='세트 삭제'
        onClickDelete={handleClickSetDelete}
      />
      <div className='mt-[6.4rem] flex justify-between'>
        <div className='w-[81.5rem]'>
          <ComponentWithLabel label='세트 제목'>
            <Input
              placeholder='입력해주세요'
              {...register('problemSetTitle', {
                onChange: () => setIsSaved(false),
              })}
            />
          </ComponentWithLabel>
        </div>

        <div className='flex items-center gap-[2.4rem]'>
          <StatusToggle
            selectedStatus={confirmStatus ?? 'NOT_CONFIRMED'}
            onSelect={() => {
              handleSubmit(handleClickSave);
              handleClickConfirm();
            }}
          />
          <div className='flex items-center gap-[0.8rem]'>
            <Button variant='light'>미리보기</Button>
            <Button variant='dark' onClick={handleSubmit(handleClickSave)}>
              저장하기
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-[4.8rem] grid w-full auto-cols-[48rem] grid-flow-col gap-[3.2rem] overflow-auto'>
        {problemList.map((problemId: number, index: number) => {
          return (
            <ProblemCard key={`${problemId}-${index}`}>
              {problemId === 0 ? (
                <ProblemCard.EmptyView onClick={() => handleAddProblem(index)} />
              ) : (
                <>
                  <ProblemCard.TextSection>
                    <ProblemCard.Title title={`문항 ${index + 1}`} />
                    <ProblemCard.Info
                      label='문항 ID'
                      content={problemSummaries[index]?.problemCustomId.toString()}
                    />
                    <ProblemCard.Info
                      label='문항 타이틀'
                      content={problemSummaries[index]?.problemTitle}
                    />
                    <ProblemCard.Info label='문항 메모' content={problemSummaries[index]?.memo} />
                    <ProblemCard.TagSection>
                      {problemSummaries[index]?.tagNames.map((tag, tagIndex) => {
                        return <Tag key={`${tag}-${tagIndex}`} label={tag} />;
                      })}
                    </ProblemCard.TagSection>
                  </ProblemCard.TextSection>
                  <ProblemCard.ButtonSection>
                    <IconButton
                      variant='modify'
                      onClick={() =>
                        navigate({
                          to: '/problem/$problemId',
                          params: { problemId: problemId.toString() },
                        })
                      }
                    />
                    <IconButton variant='delete' onClick={() => handleClickDeleteProblem(index)} />
                  </ProblemCard.ButtonSection>
                  <ProblemCard.CardImage
                    src={problemSummaries[index]?.mainProblemImageUrl}
                    height={'34.4rem'}
                  />
                </>
              )}
            </ProblemCard>
          );
        })}
        <div className='flex items-center'>
          <PlusButton onClick={handleClickAdd} />
        </div>
      </div>
      <Modal isOpen={isSetDeleteModalOpen} onClose={closeSetDeleteModal}>
        <TwoButtonModalTemplate
          text='세트를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeSetDeleteModal}
          handleClickRightButton={handleMutateSetDelete}
        />
      </Modal>
      <Modal isOpen={isProblemDeleteModalOpen} onClose={closeProblemDeleteModal}>
        <TwoButtonModalTemplate
          text='문항을 세트에서 제외할까요??'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeProblemDeleteModal}
          handleClickRightButton={() => handleDeleteProblem(deleteProblemIndex)}
        />
      </Modal>
      <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
        <ProblemSearchModal
          onClickCard={(problem: ProblemSearchGetResponse) => {
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
