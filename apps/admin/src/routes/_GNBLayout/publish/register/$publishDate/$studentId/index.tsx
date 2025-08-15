import { getProblemSetSearch, postPublish } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  ProblemPreview,
  SearchInput,
  SectionCard,
} from '@components';
import { useInvalidate } from '@hooks';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { GetProblemSetSearchParams } from '@types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';

export const Route = createFileRoute('/_GNBLayout/publish/register/$publishDate/$studentId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidatePublish } = useInvalidate();
  const { navigate } = useRouter();
  const { publishDate, studentId } = Route.useParams();
  const dateArr = publishDate.split('-');
  const year = dateArr[0];
  const month = dateArr[1];
  const day = dateArr[2];

  // state
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<GetProblemSetSearchParams>({});

  // api
  const { data: problemSetList } = getProblemSetSearch(searchQuery);
  const { mutate: mutatePostPublish } = postPublish();

  const { register, handleSubmit, reset, watch } = useForm<GetProblemSetSearchParams>();

  const watchedSetTitle = watch('setTitle');
  const watchedProblemTitle = watch('problemTitle');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedSetTitle = (watchedSetTitle ?? '').toString().trim();
      const trimmedProblemTitle = (watchedProblemTitle ?? '').toString().trim();

      setSearchQuery((prev) => {
        const nextQuery: GetProblemSetSearchParams = {
          ...prev,
          setTitle: trimmedSetTitle || undefined,
          problemTitle: trimmedProblemTitle || undefined,
        };

        const cleaned = Object.fromEntries(
          Object.entries(nextQuery).filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
          )
        ) as GetProblemSetSearchParams;

        return cleaned;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedSetTitle, watchedProblemTitle]);

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

  const handleClickPublish = () => {
    if (!selectedSetId || !studentId) return;

    console.log(studentId);
    console.log(publishDate);
    console.log(selectedSetId);

    mutatePostPublish(
      {
        body: {
          publishAt: publishDate,
          problemSetId: selectedSetId,
          studentId: Number(studentId),
        },
      },
      {
        onSuccess: () => {
          invalidatePublish(Number(year), Number(month));
          navigate({ to: '/publish' });
        },
        onError: (error: Error) => {
          toast.error(error.message);
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
      <Header title='세트 검색' description={`${year}/${month}/${day} 발행`} />
      <form
        className='mt-1200 flex items-end justify-between'
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
            label='문제 타이틀'
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
            <SectionCard isSelected={selectedSetId === problemSet.id}>
              <div className='flex items-center justify-between'>
                <h2 className='font-bold-24 text-black'>{problemSet.title}</h2>
                <div className='flex gap-400'>
                  <IconButton
                    variant={selectedSetId === problemSet.id ? 'select' : 'unselected'}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSetId(problemSet.id);
                    }}
                  />
                  <IconButton variant='right' />
                </div>
              </div>
              <div className='mt-800 flex gap-600 overflow-auto'>
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
      <FloatingButton disabled={!selectedSetId} onClick={handleClickPublish}>
        해당 날짜에 발행하기
      </FloatingButton>
    </>
  );
}
