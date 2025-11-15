import { useMemo, useState } from 'react';
import { Button, Header, Modal, TagSelectModal } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { components } from '@schema';
import { SubmitHandler, useForm, type Control, type UseFormSetValue } from 'react-hook-form';
import { postProblem, getConcept } from '@apis';
import { getEmptyContentString, transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Info, FileText, Lightbulb, Link2, SaveIcon, Sparkles, CheckIcon } from 'lucide-react';

import {
  ProblemEssentialInput,
  MainProblemSection,
  ProblemPointingInput,
  TipSection,
} from '@/components/problem';
import ProblemSearchModal from '@/components/common/Modals/ProblemSearchModal';

type ProblemCreateRequest = components['schemas']['ProblemCreateRequest'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ProblemMetaResp = components['schemas']['ProblemMetaResp'];

interface ParentProblemSnapshot {
  id: number;
  title?: string;
  customId?: string;
}

const createDefaultValues = (): ProblemCreateRequest => {
  const base = transformToProblemUpdateRequest({} as ProblemInfoResp);
  const { childProblems: _childProblems, pointings = [], ...rest } = base;
  return {
    ...(rest as unknown as Omit<ProblemCreateRequest, 'problemType' | 'pointings' | 'no'>),
    no: undefined,
    problemType: 'MAIN_PROBLEM',
    createType: 'CREATION_PROBLEM',
    pointings: pointings.map((pointing, index) => ({
      no: pointing.no ?? index + 1,
      questionContent: pointing.questionContent ?? getEmptyContentString(),
      commentContent: pointing.commentContent ?? getEmptyContentString(),
      concepts: pointing.concepts ?? [],
    })),
  } as ProblemCreateRequest;
};

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateAll } = useInvalidate();
  const { navigate } = useRouter();

  const { mutate: mutateCreateProblem } = postProblem();
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const { isOpen: isTagModalOpen, openModal: openTagModal, closeModal: closeTagModal } = useModal();
  const {
    isOpen: isParentSelectModalOpen,
    openModal: openParentSelectModal,
    closeModal: closeParentSelectModal,
  } = useModal();

  const defaultValues = useMemo(() => createDefaultValues(), []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProblemCreateRequest>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const concepts = watch('concepts') ?? [];
  const problemType = watch('problemType') ?? 'MAIN_PROBLEM';

  const [selectedParentProblem, setSelectedParentProblem] = useState<ParentProblemSnapshot | null>(
    null
  );

  const normalizeContent = (value?: string) => value || getEmptyContentString();

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

  const handleChangeProblemType = (nextType: ProblemCreateRequest['problemType']) => {
    setValue('problemType', nextType, { shouldDirty: true, shouldValidate: true });
    if (nextType !== 'CHILD_PROBLEM') {
      handleClearParentProblem();
    }
  };

  const problemPointingControl = control as unknown as Control<ProblemUpdateRequest>;
  const problemPointingSetValue = setValue as unknown as UseFormSetValue<ProblemUpdateRequest>;

  const handleSubmitCreate: SubmitHandler<ProblemCreateRequest> = (data) => {
    const sanitizedPointings =
      data.pointings?.map((pointing, index) => ({
        no: index + 1,
        questionContent: normalizeContent(pointing?.questionContent),
        commentContent: normalizeContent(pointing?.commentContent),
        concepts: pointing?.concepts?.filter((concept) => concept != null) ?? [],
      })) ?? [];

    const processedData: ProblemCreateRequest = {
      ...data,
      problemType: data.problemType ?? 'MAIN_PROBLEM',
      parentProblem:
        (data.problemType ?? 'MAIN_PROBLEM') === 'CHILD_PROBLEM'
          ? (data.parentProblem ?? selectedParentProblem?.id)
          : undefined,
      concepts: data.concepts?.filter((concept) => concept != null) ?? [],
      answer: typeof data.answer === 'string' ? parseInt(data.answer, 10) : data.answer,
      recommendedTimeSec:
        typeof data.recommendedTimeSec === 'string'
          ? parseInt(data.recommendedTimeSec, 10)
          : data.recommendedTimeSec,
      difficulty:
        typeof data.difficulty === 'string' ? parseInt(data.difficulty, 10) : data.difficulty,
      problemContent: normalizeContent(data.problemContent),
      readingTipContent: normalizeContent(data.readingTipContent),
      oneStepMoreContent: normalizeContent(data.oneStepMoreContent),
      memo: data.memo ?? '',
      pointings: sanitizedPointings.length > 0 ? sanitizedPointings : undefined,
      mainAnalysisImageId: data.mainAnalysisImageId ?? undefined,
      mainHandAnalysisImageId: data.mainHandAnalysisImageId ?? undefined,
    };

    mutateCreateProblem(
      {
        body: processedData,
      },
      {
        onSuccess: () => {
          invalidateAll();
          toast.success('생성이 완료되었습니다');
          navigate({ to: '/problem' });
        },
        onError: (error: unknown) => {
          console.error('생성 실패 상세:', error);
          toast.error((error as { message?: string })?.message || '생성에 실패했습니다');
        },
      }
    );
  };

  const handleClickSave = handleSubmit(handleSubmitCreate);

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
          <Header title='문제 등록'>
            <button
              type='button'
              disabled={!isValid}
              onClick={handleClickSave}
              className='bg-main shadow-main/20 flex items-center gap-2 rounded-2xl py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'>
              <CheckIcon className='h-4 w-4' />
              등록하기
            </button>
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
                    enabled
                    defaultValue='MAIN_PROBLEM'
                    value={problemType}
                    onChange={handleChangeProblemType}
                  />

                  {problemType === 'CHILD_PROBLEM' && (
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
                  control={problemPointingControl}
                  setValue={problemPointingSetValue}
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
    </>
  );
}
