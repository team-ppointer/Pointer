import { useMemo } from 'react';
import {
  Button,
  Header,
  Modal,
  SegmentedControl,
  TagSelectModal,
  Input,
  ComponentWithLabel,
} from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { components } from '@schema';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { postProblem, getConcept } from '@apis';
import { getEmptyContentString, transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { Info, FileText, Lightbulb, Sparkles, CheckIcon, Plus } from 'lucide-react';

import {
  ProblemEssentialInput,
  MainProblemSection,
  ProblemPointingInput,
  TipSection,
  PracticeTestSelect,
} from '@/components/problem';
import CreatePracticeTestModal from '@/components/common/Modals/CreatePracticeTestModal';

type ProblemCreateRequest = components['schemas']['ProblemCreateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type CreateType = NonNullable<ProblemCreateRequest['createType']>;

const CREATE_TYPE_OPTIONS: { label: string; value: CreateType }[] = [
  { label: '기출문제', value: 'GICHUL_PROBLEM' },
  { label: '변형문제', value: 'VARIANT_PROBLEM' },
  { label: '창작문제', value: 'CREATION_PROBLEM' },
];

const createDefaultValues = (): ProblemCreateRequest => {
  const base = transformToProblemUpdateRequest({} as ProblemInfoResp);
  const { pointings = [], ...rest } = base;
  return {
    ...(rest as unknown as Omit<ProblemCreateRequest, 'problemType' | 'pointings' | 'no'>),
    no: undefined,
    problemType: 'MAIN_PROBLEM',
    createType: 'GICHUL_PROBLEM',
    practiceTestId: undefined,
    practiceTestNo: undefined,
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
    isOpen: isPracticeTestModalOpen,
    openModal: openPracticeTestModal,
    closeModal: closePracticeTestModal,
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
  const pointings = watch('pointings') ?? [];

  const normalizeContent = (value?: string) => value || getEmptyContentString();

  const handleChangeTagList = (tagList: number[]) => {
    setValue('concepts', [...tagList], { shouldDirty: true, shouldValidate: true });
  };

  const handleRemoveTag = (tag: number) => {
    const nextTags = concepts.filter((concept) => concept !== tag);
    setValue('concepts', nextTags, { shouldDirty: true, shouldValidate: true });
  };

  const handleChangeProblemType = (nextType: ProblemCreateRequest['problemType']) => {
    setValue('problemType', nextType, { shouldDirty: true, shouldValidate: true });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyControl = control as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyRegister = register as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySetValue = setValue as any;

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
      createType: data.createType,
      practiceTestId: data.practiceTestId ?? undefined,
      practiceTestNo: data.practiceTestNo ?? undefined,
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
              disabled={!isValid || concepts.length === 0 || pointings.length === 0}
              onClick={handleClickSave}
              className='bg-main shadow-main/20 flex items-center gap-2 rounded-2xl py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'>
              <CheckIcon className='h-4 w-4' />
              등록하기
            </button>
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

                  {/* MAIN_PROBLEM일 경우 새끼문항 추가 버튼 */}
                  {problemType === 'MAIN_PROBLEM' && (
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
                    control={anyControl}
                    register={anyRegister}
                    errors={errors}
                  />
                  <MainProblemSection.DifficultyInput control={anyControl} errors={errors} />
                  <MainProblemSection.RecommendedTimeInput
                    control={anyControl}
                    register={anyRegister}
                    setValue={anySetValue}
                    errors={errors}
                  />
                  <MainProblemSection.ProblemContentEditor control={anyControl} />
                  <MainProblemSection.MemoInput register={anyRegister} />
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
                  control={anyControl}
                  setValue={anySetValue}
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
                  <TipSection.ReadingTipCard control={anyControl} />
                  <TipSection.OneStepMoreCard control={anyControl} />
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
      <Modal isOpen={isPracticeTestModalOpen} onClose={closePracticeTestModal}>
        <CreatePracticeTestModal onClose={closePracticeTestModal} />
      </Modal>
    </>
  );
}
