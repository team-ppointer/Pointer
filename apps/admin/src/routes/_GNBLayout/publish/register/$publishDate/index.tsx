import { getConfirmProblemSet, postPublish } from '@apis';
import {
  Button,
  FloatingButton,
  Header,
  IconButton,
  ProblemPreview,
  SearchInput,
  SectionCard,
} from '@components';
import { createFileRoute, Link } from '@tanstack/react-router';
import { getSearchProblemSetParamsType } from '@types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/publish/register/$publishDate/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { publishDate } = Route.useParams();
  const dateArr = publishDate.split('-');
  const year = dateArr[0];
  const month = dateArr[1];
  const day = dateArr[2];

  // state
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<getSearchProblemSetParamsType>({});

  // api
  const { data: problemSetList } = getConfirmProblemSet(searchQuery);
  const { mutate: mutatePostPublish } = postPublish();

  const { register, handleSubmit, reset } = useForm<getSearchProblemSetParamsType>();

  const handleClickSearch = (data: getSearchProblemSetParamsType) => {
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
    if (!selectedSetId) return;

    mutatePostPublish({
      body: {
        publishedDate: publishDate,
        problemSetId: selectedSetId,
      },
    });
  };

  return (
    <>
      <Header title='세트 목록' description={`${year}/${month}/${day} 발행`} />
      <form
        className='mt-[4.8rem] flex items-end justify-between'
        onSubmit={handleSubmit(handleClickSearch)}>
        <div className='flex gap-[2.4rem]'>
          <SearchInput
            sizeType='long'
            label='세트 타이틀'
            placeholder='입력해주세요.'
            {...register('problemSetTitle', { required: false })}
          />
          <SearchInput
            sizeType='long'
            label='문항 타이틀'
            placeholder='입력해주세요.'
            {...register('problemTitle', { required: false })}
          />
        </div>
        <div className='flex gap-[1.6rem]'>
          <Button variant='light' type='reset' onClick={handleResetQuery}>
            초기화
          </Button>
          <Button variant='dark'>검색</Button>
        </div>
      </form>
      <div className='mt-[6.4rem] flex flex-col gap-[4.8rem]'>
        {problemSetList?.data.map((problemSet) => (
          <SectionCard key={problemSet.id} isSelected={selectedSetId === problemSet.id}>
            <div className='flex items-center justify-between'>
              <h2 className='font-bold-24 text-black'>{problemSet.problemSetTitle}</h2>
              <div className='flex gap-[1.6rem]'>
                <IconButton
                  variant={selectedSetId === problemSet.id ? 'select' : 'unselected'}
                  onClick={() => {
                    setSelectedSetId(problemSet.id);
                  }}
                />
                <Link
                  to={'/problem-set/$problemSetId'}
                  params={{
                    problemSetId: problemSet.id?.toString(),
                  }}>
                  <IconButton variant='right' />
                </Link>
              </div>
            </div>
            <div className='mt-[3.2rem] flex gap-[2.4rem] overflow-auto'>
              {problemSet.problemThumbnailResponses.map((problem, index) => (
                <ProblemPreview
                  key={`문항-${index}`}
                  title={problem.problemTitle ?? ''}
                  memo={problem.problemMemo ?? ''}
                  imgSrc={problem.mainProblemImageUrl ?? ''}
                />
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
      <FloatingButton disabled={!selectedSetId} onClick={handleClickPublish}>
        해당 날짜에 발행하기
      </FloatingButton>
    </>
  );
}
