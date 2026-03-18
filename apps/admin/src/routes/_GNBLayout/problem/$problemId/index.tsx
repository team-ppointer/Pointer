import {
  Button,
  Header,
  Modal,
  SegmentedControl,
  TagSelectModal,
  TwoButtonModalTemplate,
  Input,
  ComponentWithLabel,
} from '@components';
import { components } from '@schema';
import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { deleteProblem, getConcept, getProblemById, putProblemById } from '@apis';
import { getEmptyContentString, transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';
import {
  Info,
  FileText,
  Lightbulb,
  Trash2,
  Link2,
  SaveIcon,
  Sparkles,
  Hash,
  BookOpen,
  Plus,
  ChevronRight,
  Clipboard,
} from 'lucide-react';

import {
  ProblemEssentialInput,
  MainProblemSection,
  ProblemPointingInput,
  TipSection,
  PracticeTestSelect,
} from '@/components/problem';
import CreatePracticeTestModal from '@/components/common/Modals/CreatePracticeTestModal';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type CreateType = NonNullable<ProblemUpdateRequest['createType']>;

const CREATE_TYPE_OPTIONS: { label: string; value: CreateType }[] = [
  { label: '기출문제', value: 'GICHUL_PROBLEM' },
  { label: '변형문제', value: 'VARIANT_PROBLEM' },
  { label: '창작문제', value: 'CREATION_PROBLEM' },
];

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
    isOpen: isPracticeTestModalOpen,
    openModal: openPracticeTestModal,
    closeModal: closePracticeTestModal,
  } = useModal();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      answer: typeof data.answer === 'string' ? parseInt(data.answer, 10) : data.answer,
      problemContent: normalizeContent(data.problemContent),
      readingTipContent: normalizeContent(data.readingTipContent),
      oneStepMoreContent: normalizeContent(data.oneStepMoreContent),
      pointings: sanitizedPointings,
      mainAnalysisImageId: data.mainAnalysisImageId ?? undefined,
      mainHandAnalysisImageId: data.mainHandAnalysisImageId ?? undefined,
      createType: data.createType,
      practiceTestId: data.practiceTestId ?? undefined,
      practiceTestNo: data.practiceTestNo ?? undefined,
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
                disabled={!isValid || concepts.length === 0}
                onClick={handleClickSave}
                className='bg-main shadow-main/20 flex items-center gap-2 rounded-2xl py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'>
                <SaveIcon className='h-4 w-4' />
                저장하기
              </button>
            </div>
          </Header>

          <div className='mx-auto max-w-7xl px-8 py-8'>
            <div className='mb-6 rounded-2xl border border-gray-200 bg-white'>
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
                  {/* 문제 ID - 읽기 전용 텍스트로 표시 */}
                  <div className='flex items-center gap-3'>
                    <ComponentWithLabel label='문제 ID' labelWidth='4rem'>
                      <div className='flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
                        <Hash className='h-4 w-4 text-gray-500' />
                        <span className='font-mono text-sm font-semibold text-gray-700'>
                          {fetchedProblemData.customId || '-'}
                        </span>
                        <button
                          type='button'
                          className='ml-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600'
                          onClick={() => {
                            navigator.clipboard.writeText(fetchedProblemData.customId || '');
                            toast.success('문제 ID가 복사되었습니다.');
                          }}>
                          <Clipboard className='h-4 w-4' />
                        </button>
                      </div>
                    </ComponentWithLabel>
                  </div>

                  <ProblemEssentialInput.ProblemTitle
                    {...register('title', {
                      required: '문제 제목은 필수 입력 항목입니다.',
                    })}
                  />
                  <div className='flex flex-wrap gap-4'>
                    <ProblemEssentialInput.ProblemType
                      enabled={false}
                      defaultValue={fetchedProblemData.problemType}
                    />

                    {fetchedProblemData.problemType === 'CHILD_PROBLEM' && (
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                          <Link2 className='text-main h-4 w-4' />
                          부모 문제
                        </div>
                        {fetchedProblemData.parentProblem ? (
                          <Link
                            to='/problem/$problemId'
                            params={{ problemId: String(fetchedProblemData.parentProblem) }}
                            className='group flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100'>
                            <span>
                              {fetchedProblemData.parentProblemTitle ||
                                `ID ${fetchedProblemData.parentProblem}`}
                            </span>
                            <ChevronRight className='h-4 w-4 text-blue-500' />
                          </Link>
                        ) : (
                          <span className='text-sm text-gray-500'>
                            연결된 부모 문제가 없습니다.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* MAIN_PROBLEM일 경우 새끼문제 목록 표시 */}
                  {fetchedProblemData.problemType === 'MAIN_PROBLEM' &&
                    fetchedProblemData.childProblems &&
                    fetchedProblemData.childProblems.length > 0 && (
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                          <FileText className='text-main h-4 w-4' />
                          새끼문제 목록
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {fetchedProblemData.childProblems.map((child, index) => (
                            <Link
                              key={child.id}
                              to='/problem/$problemId'
                              params={{ problemId: String(child.id) }}
                              className='group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'>
                              <span className='flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'>
                                {index + 1}
                              </span>
                              <span className='max-w-[200px] truncate'>
                                {child.title || `새끼문제 ${index + 1}`}
                              </span>
                              <ChevronRight className='h-4 w-4 text-gray-400 group-hover:text-blue-500' />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* MAIN_PROBLEM일 경우 새끼문항 추가 버튼 */}
                  {fetchedProblemData.problemType === 'MAIN_PROBLEM' && (
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='light'
                        sizeType='fit'
                        onClick={() => {
                          alert('새끼문항 추가 기능은 아직 구현되지 않았습니다.');
                        }}>
                        <Plus className='h-4 w-4' />
                        새끼문항 추가
                      </Button>
                    </div>
                  )}

                  {/* 출제 유형 (createType) */}
                  <ComponentWithLabel label='출제 유형' labelWidth='4rem'>
                    <Controller
                      name='createType'
                      control={control}
                      render={({ field }) => (
                        <SegmentedControl
                          items={CREATE_TYPE_OPTIONS}
                          value={field.value}
                          onChange={(value) => field.onChange(value as CreateType)}
                        />
                      )}
                    />
                  </ComponentWithLabel>

                  {/* 모의고사 정보 */}
                  <ComponentWithLabel label='모의고사' labelWidth='4rem'>
                    <div className='flex flex-wrap items-end gap-4'>
                      <div className='min-w-[300px] flex-1'>
                        <Controller
                          name='practiceTestId'
                          control={control}
                          render={({ field }) => (
                            <PracticeTestSelect
                              practiceTest={field.value}
                              handlePracticeTest={(value) => field.onChange(value)}
                              onCreateNew={openPracticeTestModal}
                            />
                          )}
                        />
                      </div>
                      <div className='w-[150px]'>
                        <ComponentWithLabel label='문제 번호'>
                          <Input
                            type='number'
                            placeholder='번호 입력'
                            {...register('practiceTestNo', {
                              valueAsNumber: true,
                            })}
                            className='h-[48px]'
                          />
                        </ComponentWithLabel>
                      </div>
                    </div>
                  </ComponentWithLabel>
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
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문제를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
      <Modal isOpen={isPracticeTestModalOpen} onClose={closePracticeTestModal}>
        <CreatePracticeTestModal onClose={closePracticeTestModal} />
      </Modal>
    </>
  );
}
