import { useState } from 'react';
import { Button, Header, Modal, TagSelectModal, TwoButtonModalTemplate } from '@components';
import { components } from '@schema';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { deleteProblem, getConcept, getProblemById, putProblemById } from '@apis';
import { getEmptyContentString, transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Info, FileText, Lightbulb, Trash2, Link2, SaveIcon, Sparkles } from 'lucide-react';

import {
  ProblemEssentialInput,
  MainProblemSection,
  ProblemPointingInput,
  TipSection,
} from '@/components/problem';
import ProblemSearchModal from '@/components/common/Modals/ProblemSearchModal';

import '@team-ppointer/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ProblemMetaResp = components['schemas']['ProblemMetaResp'];

interface ParentProblemSnapshot {
  id: number;
  title?: string;
  customId?: string;
}

function RouteComponent() {
  const { invalidateAll } = useInvalidate();
  const { navigate } = useRouter();
  const { problemId } = Route.useParams();

  const { data: fetchedProblemData } = getProblemById({ id: Number(problemId) });
  const { mutate: mutateUpdateProblem } = putProblemById();
  const { mutate: mutateDeleteProblem } = deleteProblem();
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  if (!fetchedProblemData) {
    return null;
  }

  return (
    <ProblemForm
      key={fetchedProblemData.id}
      fetchedProblemData={fetchedProblemData}
      mutateUpdateProblem={mutateUpdateProblem}
      mutateDeleteProblem={mutateDeleteProblem}
      navigate={navigate}
      invalidateAll={invalidateAll}
      tagsNameMap={tagsNameMap}
    />
  );
}

function ProblemForm({
  fetchedProblemData,
  mutateUpdateProblem,
  mutateDeleteProblem,
  navigate,
  invalidateAll,
  tagsNameMap,
}: {
  fetchedProblemData: ProblemInfoResp;
  mutateUpdateProblem: ReturnType<typeof putProblemById>['mutate'];
  mutateDeleteProblem: ReturnType<typeof deleteProblem>['mutate'];
  navigate: ReturnType<typeof useRouter>['navigate'];
  invalidateAll: ReturnType<typeof useInvalidate>['invalidateAll'];
  tagsNameMap: Record<number, string>;
}) {
  const { problemId } = Route.useParams();

  const { isOpen: isTagModalOpen, openModal: openTagModal, closeModal: closeTagModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isParentSelectModalOpen,
    openModal: openParentSelectModal,
    closeModal: closeParentSelectModal,
  } = useModal();

  const [selectedParentProblem, setSelectedParentProblem] = useState<ParentProblemSnapshot | null>(
    fetchedProblemData.parentProblem
      ? {
          id: fetchedProblemData.parentProblem,
          title: fetchedProblemData.parentProblemTitle ?? '',
        }
      : null
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<ProblemUpdateRequest>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: transformToProblemUpdateRequest(fetchedProblemData),
  });

  const concepts = watch('concepts') ?? [];

  const normalizeContent = (value?: string) => value || getEmptyContentString();

  const handleSubmitUpdate: SubmitHandler<ProblemUpdateRequest> = (data) => {
    const sanitizedPointings = (data.pointings ?? []).map((pointing, index) => ({
      ...pointing,
      id: typeof pointing?.id === 'string' ? undefined : pointing?.id,
      no: index + 1,
      questionContent: normalizeContent(pointing?.questionContent),
      commentContent: normalizeContent(pointing?.commentContent),
      concepts: pointing?.concepts?.filter((concept) => concept != null) ?? [],
    }));

    const processedData: ProblemUpdateRequest = {
      ...data,
      parentProblem: data.parentProblem != null ? Number(data.parentProblem) : undefined,
      answer: typeof data.answer === 'string' ? parseInt(data.answer, 10) : data.answer,
      problemContent: normalizeContent(data.problemContent),
      readingTipContent: normalizeContent(data.readingTipContent),
      oneStepMoreContent: normalizeContent(data.oneStepMoreContent),
      pointings: sanitizedPointings,
      mainAnalysisImageId: data.mainAnalysisImageId ?? undefined,
      mainHandAnalysisImageId: data.mainHandAnalysisImageId ?? undefined,
    };

    mutateUpdateProblem(
      {
        body: processedData,
        params: {
          path: {
            id: Number(problemId),
          },
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          toast.success('저장이 완료되었습니다');
        },
        onError: (error: unknown) => {
          console.error('저장 실패 상세:', error);
          toast.error((error as { message?: string })?.message || '저장에 실패했습니다');
        },
      }
    );
  };

  const handleMutateDelete = () => {
    mutateDeleteProblem(
      {
        params: {
          path: {
            id: Number(problemId),
          },
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          navigate({ to: '/problem' });
        },
      }
    );
  };

  const handleChangeTagList = (tagList: number[]) => {
    setValue('concepts', [...tagList], { shouldDirty: true, shouldValidate: true });
  };

  const handleRemoveTag = (tag: number) => {
    const nextTags = concepts.filter((concept) => concept !== tag);
    setValue('concepts', nextTags, { shouldDirty: true, shouldValidate: true });
  };

  const handleClearParentProblem = () => {
    setSelectedParentProblem(null);
    setValue('parentProblem', undefined, { shouldDirty: true, shouldValidate: true });
  };

  const handleClickSave = handleSubmit(handleSubmitUpdate);

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
      <div className='min-h-screen bg-gray-50'>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className='pb-32'>
          <Header title='문제 수정'>
            <div className='flex items-center gap-3'>
              <Header.Button Icon={Trash2} color='destructive' onClick={openDeleteModal}>
                문제 삭제
              </Header.Button>
              <button
                type='button'
                disabled={!isValid}
                onClick={handleClickSave}
                className='bg-main shadow-main/20 flex items-center gap-2 rounded-2xl py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'>
                <SaveIcon className='h-4 w-4' />
                저장하기
              </button>
            </div>
          </Header>

          <div className='mx-auto max-w-7xl px-8 py-8'>
            <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
              <div className='px-6 pt-6'>
                <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
                  <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                    <Info className='h-5 w-5 text-white' />
                  </div>
                  기본 정보
                </h2>
              </div>
              <div className='space-y-6 p-8'>
                <ProblemEssentialInput>
                  <ProblemEssentialInput.ProblemID
                    {...register('customId', {
                      required: '문제 ID는 필수 입력 항목입니다.',
                    })}
                  />
                  <ProblemEssentialInput.ProblemTitle
                    {...register('title', {
                      required: '문제 제목은 필수 입력 항목입니다.',
                    })}
                  />
                  <ProblemEssentialInput.ProblemType
                    enabled={false}
                    defaultValue={fetchedProblemData.problemType}
                  />

                  {/* <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <span className='text-sm font-semibold text-gray-600'>출제 유형</span>
                      <div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700'>
                        {fetchedProblemData.createType === 'GICHUL_PROBLEM'
                          ? '기출 문제'
                          : fetchedProblemData.createType === 'VARIANT_PROBLEM'
                            ? '변형 문제'
                            : '창작 문제'}
                      </div>
                    </div>
                  </div> */}

                  {fetchedProblemData.problemType === 'CHILD_PROBLEM' && (
                    <div className='space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4'>
                      <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                        <Link2 className='text-main h-4 w-4' />
                        부모 문제 연결
                      </div>
                      <div className='flex flex-wrap items-center gap-3'>
                        {selectedParentProblem ? (
                          <div className='rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700'>
                            {selectedParentProblem.customId
                              ? `${selectedParentProblem.customId} · ${selectedParentProblem.title ?? ''}`
                              : selectedParentProblem.title || `ID ${selectedParentProblem.id}`}
                          </div>
                        ) : (
                          <span className='text-sm text-gray-500'>
                            연결된 부모 문제가 없습니다.
                          </span>
                        )}
                        <Button
                          type='button'
                          variant='light'
                          sizeType='fit'
                          onClick={openParentSelectModal}>
                          부모 문제 선택
                        </Button>
                        {selectedParentProblem && (
                          <Button
                            type='button'
                            variant='danger'
                            sizeType='fit'
                            onClick={handleClearParentProblem}>
                            연결 해제
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </ProblemEssentialInput>
              </div>
            </div>

            <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
              <div className='px-6 pt-6'>
                <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
                  <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                    <FileText className='h-5 w-5 text-white' />
                  </div>
                  문제 정보
                </h2>
              </div>
              <div className='space-y-8 p-8'>
                <MainProblemSection>
                  <MainProblemSection.ConceptTagInput
                    concepts={concepts}
                    tagsNameMap={tagsNameMap}
                    onRemoveTag={handleRemoveTag}
                    onOpenTagModal={openTagModal}
                  />
                  <MainProblemSection.AnswerInput
                    control={control}
                    register={register}
                    errors={errors}
                  />
                  <MainProblemSection.DifficultyInput control={control} errors={errors} />
                  <MainProblemSection.RecommendedTimeInput
                    control={control}
                    register={register}
                    setValue={setValue}
                    errors={errors}
                  />
                  <MainProblemSection.ProblemContentEditor control={control} />
                  <MainProblemSection.MemoInput register={register} />
                </MainProblemSection>
              </div>
            </div>

            <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
              <div className='px-6 pt-6'>
                <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
                  <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                    <Sparkles className='h-5 w-5 text-white' />
                  </div>
                  포인팅 정보
                </h2>
              </div>
              <div className='space-y-8 p-8'>
                <ProblemPointingInput
                  control={control}
                  setValue={setValue}
                  tagsNameMap={tagsNameMap}
                />
              </div>
            </div>

            <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
              <div className='px-6 pt-6'>
                <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
                  <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                    <Lightbulb className='h-5 w-5 text-white' />
                  </div>
                  추가 정보
                </h2>
              </div>
              <div className='p-8'>
                <TipSection>
                  <TipSection.ReadingTipCard control={control} />
                  <TipSection.OneStepMoreCard control={control} />
                </TipSection>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Modal isOpen={isTagModalOpen} onClose={closeTagModal}>
        <TagSelectModal
          onClose={closeTagModal}
          selectedTagList={concepts || []}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
      <Modal isOpen={isParentSelectModalOpen} onClose={closeParentSelectModal}>
        <ProblemSearchModal
          onClickCard={(problem: ProblemMetaResp) => {
            if (problem.problemType !== 'MAIN_PROBLEM') {
              toast.error('새끼 문제는 부모 문제로 선택할 수 없습니다.');
              return;
            }
            setSelectedParentProblem({
              id: problem.id,
              title: problem.title,
              customId: problem.customId,
            });
            setValue('parentProblem', problem.id, { shouldDirty: true, shouldValidate: true });
            closeParentSelectModal();
          }}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문제를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
